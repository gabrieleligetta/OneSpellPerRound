import { Markup, Telegraf } from "telegraf";
import dotenv from "dotenv";
import { createRequire } from "module";
import {
    removeInBroadcastSubs,
    setInBroadcastSubs,
    setMartaEpisodePrompt,
} from "./cache.js";
import { characterScene } from "./scenes/characterScene.js";
import { getStandardChar } from "./persona.js";
import { MARTA_SUBS, SPELLS_SUBS } from "./constants.js";
import { getSpell } from "./spell.js";
import { Stage } from "telegraf/scenes";
import cron from "node-cron";
import {
    raccontoDiMartaBroadcast,
    randomSpellBroadcast,
} from "./broadcasts.js";
import { generateEpisodeFormat } from "./prompts.js";
import { askDnD5eAssistant } from "./openai.js";
import { fileUploadScene } from "./scenes/fileUploadScene.js";
import { martaAdventureScene } from "./scenes/martaAdventureScene.js";
import { client as mongoClient, listFromCollection, getFromCollection } from "./mongoDB.js";
import { ObjectId } from "mongodb";

// Initialize 'require' for this file to support CommonJS imports in an ESM environment
const require = createRequire(import.meta.url);

// Import the 'session' factory function, not a nonexistent class.
const { session } = require('telegraf-session-mongodb');

dotenv.config();

async function startBot() {
    try {
        console.log("Tentativo di connessione a MongoDB...");

        // Ensure the connection is fully established before dependent logic runs.
        await mongoClient.connect();
        console.log(">>> Connessione a MongoDB stabilita con successo!");

        const token = process.env.BOT_TOKEN;
        if (token === undefined) throw new Error("BOT_TOKEN must be provided!");

        const bot = new Telegraf(token);

        const db = mongoClient.db("marta_game");

        const sessionMiddleware = session(db, {
            collectionName: "sessions"
        });

        bot.use(sessionMiddleware);

        // Middleware to ensure a user document exists for every request.
        // This is a safe, idempotent upsert that prevents race conditions.
        bot.use(async (ctx, next) => {
            if (ctx.from) {
                const usersCollection = db.collection("users");
                await usersCollection.updateOne(
                    { _id: ctx.from.id },
                    { $setOnInsert: { adventureLock: false } },
                    { upsert: true }
                );
            }
            return next();
        });

        bot.use(async (ctx, next) => {
            if (!ctx.session) ctx.session = {};
            return next();
        });

        const stage = new Stage([characterScene, fileUploadScene, martaAdventureScene]);
        bot.use(stage.middleware());

        setupBotHandlers(bot);
        setupCronJobs(bot);

        // Error boundary to prevent process crashes from unhandled middleware errors
        bot.catch(async (err, ctx) => {
            console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
            // Safety unlock: If an error occurs, ensure the user isn't stuck.
            if (ctx.from) {
                const usersCollection = db.collection("users");
                await usersCollection.updateOne({ _id: ctx.from.id }, { $set: { adventureLock: false } });
            }
            ctx.reply("Si è verificato un errore, per favore riprova più tardi.").catch(e => {
                console.error("Failed to send error message to user", e);
            });
        });

        // Log confirmation message *before* launching the bot
        console.log(">>> Bot avviato e in ascolto!");
        
        // Launch the bot. No 'await' here, as it's a long-running process.
        bot.launch();

        // Robust Signal Handling for Graceful Shutdown
        const stopSignalHandler = (signal) => {
            console.log(`Received ${signal}. Stopping bot and closing DB connection...`);
            bot.stop(signal);
            mongoClient.close().then(() => {
                console.log("MongoDB connection closed.");
                process.exit(0);
            });
        };

        process.once('SIGINT', () => stopSignalHandler('SIGINT'));
        process.once('SIGTERM', () => stopSignalHandler('SIGTERM'));

    } catch (error) {
        console.error("Impossibile avviare il bot:", error);
        process.exit(1);
    }
}

function setupBotHandlers(bot) {
    const db = mongoClient.db("marta_game");
    // Comandi randomchar
    bot.command("randomchar", (ctx) => sendCharacter(ctx, "standard"));
    bot.command("randomrolledchar", (ctx) => sendCharacter(ctx, "rolled"));
    bot.command("randombestchar", (ctx) => sendCharacter(ctx, "best"));

    // Comando randomspell
    bot.command("randomspell", async (ctx) => {
        await ctx.sendChatAction("typing");
        const reply = await getSpell("random");
        await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
    });

    // Comando enterDungeon
    bot.command("enterDungeon", async (ctx) => {
        console.log("Comando /enterDungeon ricevuto. Uscita forzata da scene precedenti.");
        if (ctx.scene) await ctx.scene.leave();
        await bot.telegram.sendChatAction(ctx.chat.id, "typing");
        await bot.telegram.sendPhoto(ctx.chat.id, { source: "./imgs/witch2.jpeg" });
        await bot.telegram.sendMessage(
            ctx.chat.id,
            "Avviare una nuova avventura di Marta la papera col cappello da strega?",
            Markup.inlineKeyboard([
                Markup.button.callback("Sì, avvia l'avventura!", "startMartaAdventure")
            ])
        );
    });

    // Azione startMartaAdventure
    bot.action("startMartaAdventure", async (ctx) => {
        await ctx.answerCbQuery();
        const userId = ctx.from.id;
        const userCharacters = await listFromCollection("characters", "owner", userId);

        if (userCharacters && userCharacters.length > 0) {
            const buttons = userCharacters.map(char =>
                Markup.button.callback(char.name, `selectChar:${char._id}`)
            );
            await ctx.editMessageText(
                "Scegli quale dei tuoi eroi parteciperà all'avventura:",
                Markup.inlineKeyboard(buttons, { columns: 1 })
            );
        } else {
            await ctx.editMessageText("Non hai ancora un eroe! Creiamone uno insieme per iniziare l'avventura.");
            if (ctx.scene) ctx.scene.enter("characterScene", { startAdventureAfter: true });
        }
    });

    // Azione selectChar - WITH SAFE ATOMIC LOCK
    bot.action(/selectChar:(.+)/, async (ctx) => {
        const charId = ctx.match[1];
        const userId = ctx.from.id;
        const usersCollection = db.collection("users");

        // ATOMIC OPERATION: Try to acquire the lock.
        // The user document is guaranteed to exist by our new middleware.
        const result = await usersCollection.findOneAndUpdate(
            { _id: userId, adventureLock: false }, // Simple, safe query
            { $set: { adventureLock: true } }
            // No upsert needed, preventing race conditions.
        );

        // If `result` is null, it means no document matched (lock was already true).
        if (!result) {
            return ctx.answerCbQuery("Sto già preparando un'avventura per te!", { show_alert: true });
        }

        // --- Lock Acquired ---
        try {
            const character = await getFromCollection("characters", "_id", new ObjectId(charId));
            if (!character) {
                // Release lock if character not found
                await usersCollection.updateOne({ _id: userId }, { $set: { adventureLock: false } });
                return ctx.reply("Non ho trovato questo personaggio. Riprova.");
            }

            await ctx.answerCbQuery(`Hai scelto ${character.name}!`);
            await ctx.editMessageText(`L'avventura di ${character.name} sta per iniziare...`);

            if (ctx.scene) ctx.scene.enter("martaAdventureScene", { character: character });

        } catch (error) {
            // Release lock on error
            console.error("Error in selectChar action:", error);
            await usersCollection.updateOne({ _id: userId }, { $set: { adventureLock: false } });
            await ctx.reply("Qualcosa è andato storto, riprova.");
        }
    });

    // Comando resetAdventure
    bot.command("resetAdventure", async (ctx) => {
        const usersCollection = db.collection("users");
        await usersCollection.updateOne({ _id: ctx.from.id }, { $set: { adventureLock: false } });
        if (ctx.scene) await ctx.scene.leave();
        ctx.reply("Il tuo stato è stato resettato.");
    });

    // --- COMMAND: newEpisode ---
    bot.command("newEpisode", async (ctx) => {
        console.log("Comando /newEpisode ricevuto. Rigenerazione episodio e reset stato.");
        await ctx.reply("Sto generando un nuovo episodio per l'avventura di Marta. Potrebbe volerci un momento...");

        try {
            await generateEpisodeFormat();
            // Also reset user lock on episode regeneration
            const usersCollection = db.collection("users");
            await usersCollection.updateOne({ _id: ctx.from.id }, { $set: { adventureLock: false } });
            if (ctx.scene) await ctx.scene.leave();
            await ctx.reply("Un nuovo episodio è stato generato e il tuo stato è stato resettato. Ora puoi iniziare una nuova avventura!");
        } catch (error) {
            console.error("Errore durante la generazione del nuovo episodio:", error);
            await ctx.reply("Si è verificato un errore durante la generazione del nuovo episodio. Riprova più tardi.");
        }
    });

    // Sub/Unsub Broadcast Handlers
    bot.command("sub", async (ctx) => {
        await bot.telegram.sendMessage(ctx.chat.id, "A quale broadcast vuoi iscriverti?", Markup.inlineKeyboard([
            [Markup.button.callback("Marta la Papera", "marta@subscribe")],
            [Markup.button.callback("Incantesimo del Giorno", "randomSpell@subscribe")]
        ]));
    });
    bot.command("unsub", async (ctx) => {
        await bot.telegram.sendMessage(ctx.chat.id, "Da quale broadcast vuoi uscire?", Markup.inlineKeyboard([
            [Markup.button.callback("Marta la Papera", "marta@unsubscribe")],
            [Markup.button.callback("Incantesimo del Giorno", "randomSpell@unsubscribe")]
        ]));
    });

    bot.action("marta@subscribe", async (ctx) => { await setInBroadcastSubs(MARTA_SUBS, ctx.chat.id); return ctx.reply("Sottoscrizione Marta effettuata"); });
    bot.action("randomSpell@subscribe", async (ctx) => { await setInBroadcastSubs(SPELLS_SUBS, ctx.chat.id); return ctx.reply("Sottoscrizione RandomSpell effettuata"); });
    bot.action("marta@unsubscribe", async (ctx) => { await removeInBroadcastSubs(MARTA_SUBS, ctx.chat.id); return ctx.reply("Sottoscrizione Marta rimossa"); });
    bot.action("randomSpell@unsubscribe", async (ctx) => { await removeInBroadcastSubs(SPELLS_SUBS, ctx.chat.id); return ctx.reply("Sottoscrizione RandomSpell rimossa"); });

    // Ask Command
    bot.command('ask', async (ctx) => {
        await ctx.sendChatAction("typing");
        const messageText = ctx.message.text;
        const question = messageText.replace('/ask', '').trim();
        if (question!== "") {
            const reply = await askDnD5eAssistant(question);
            await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
        } else {
            ctx.reply("per favore inserisci una domanda valida");
        }
    });

    bot.command("createCharacter", (ctx) => ctx.scene.enter("characterScene"));
    bot.command("sonogiosy", (ctx) => ctx.scene.enter("fileUploadScene"));
    bot.command("beSilly", async () => await randomSpellBroadcast(bot));
}

async function sendCharacter(ctx, type) {
    await ctx.sendChatAction("typing");
    const msg = ctx.message.text;
    const charLevel = 1;
    const reply = await getStandardChar(msg, charLevel, type);
    await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
}

function setupCronJobs(bot) {
    const db = mongoClient.db("marta_game");
    cron.schedule("0 11 * * *", async () => await randomSpellBroadcast(bot));
    cron.schedule("00 16 * * *", async () => {
        try { await raccontoDiMartaBroadcast(bot); } catch (e) { console.error("CRON: Errore nel broadcast di Marta:", e); }
    });
    cron.schedule("0 1 * * *", async () => {
        try {
            const newEpisode = await generateEpisodeFormat();
            await setMartaEpisodePrompt(newEpisode);
            console.log("CRON: Nuovo episodio di Marta generato e salvato.");
        } catch (error) {
            console.error("CRON: Errore durante la pre-generazione dell'episodio:", error);
        }
    });

    // Automatic Session Unlocker - NOW ON 'users' COLLECTION
    cron.schedule("0 0 * * *", async () => {
        try {
            const usersCollection = db.collection("users");
            const result = await usersCollection.updateMany(
                { "adventureLock": true },
                { $set: { "adventureLock": false } }
            );
            console.log(`CRON: Reset completato. ${result.modifiedCount} utenti sbloccati.`);
        } catch (error) {
            console.error("CRON: Errore durante il reset dei lock:", error);
        }
    });
}

startBot();
