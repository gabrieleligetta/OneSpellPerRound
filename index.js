import { Markup, session, Telegraf } from "telegraf";
import dotenv from "dotenv";
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
import {Mongo} from "@telegraf/session/mongodb";

dotenv.config();

async function startBot() {
  try {
    console.log("Tentativo di connessione a MongoDB...");
    await mongoClient.connect();
    console.log(">>> Connessione a MongoDB stabilita con successo!");

    const token = process.env.BOT_TOKEN;
    if (token === undefined) throw new Error("BOT_TOKEN must be provided!");

    const bot = new Telegraf(token);

    const store = Mongo({
        client: mongoClient,
        database: "marta_game",
        collection: "sessions",
    });
    bot.use(session({
      store,
      defaultSession: () => ({ adventureLock: false }),
    }));

    const stage = new Stage([characterScene, fileUploadScene, martaAdventureScene]);
    bot.use(stage.middleware());

    setupBotHandlers(bot);
    setupCronJobs(bot);

    bot.catch((err, ctx) => {
      console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
      if (ctx.session) ctx.session.adventureLock = false;
      ctx.reply("Si è verificato un errore, per favore riprova più tardi.").catch(e => {
        console.error("Failed to send error message to user", e);
      });
    });

    await bot.launch();
    console.log(">>> Bot avviato e in ascolto!");

    process.once('SIGINT', () => { bot.stop('SIGINT'); mongoClient.close(); });
    process.once('SIGTERM', () => { bot.stop('SIGTERM'); mongoClient.close(); });

  } catch (error) {
    console.error("Impossibile avviare il bot:", error);
    process.exit(1);
  }
}

function setupBotHandlers(bot) {
  // Comandi randomchar
  bot.command("randomChar", (ctx) => sendCharacter(ctx, "standard"));
  bot.command("randomRolledChar", (ctx) => sendCharacter(ctx, "rolled"));
  bot.command("randomBestChar", (ctx) => sendCharacter(ctx, "best"));

  // Comando randomspell
  bot.command("randomSpell", async (ctx) => {
    await ctx.persistentChatAction("typing", async () => {
      const reply = await getSpell("random");
      await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
    });
  });

  // Comando enterDungeon
  bot.command("enterDungeon", async (ctx) => {
    console.log("Comando /enterDungeon ricevuto. Uscita forzata da scene precedenti.");
    await ctx.scene.leave();
    await bot.telegram.sendChatAction(ctx.chat.id, "typing");
    await bot.telegram.sendPhoto(ctx.chat.id, { source: "./imgs/witch2.jpeg" });
    await bot.telegram.sendMessage(
      ctx.chat.id,
      "Avviare una nuova avventura di Marta la papera col cappello da strega?",
      Markup.inlineKeyboard([
        Markup.button.callback("Tira Il Dado!", "startMartaAdventure"),
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
      ctx.scene.enter("characterScene", { startAdventureAfter: true });
    }
  });

  // Azione selectChar
  bot.action(/selectChar:(.+)/, async (ctx) => {
    const charId = ctx.match[1];
    console.log(`Selezione personaggio con ID: ${charId}`);
    
    if (ctx.session.adventureLock) {
      return ctx.answerCbQuery("Sto già preparando un'avventura per te!", { show_alert: true });
    }
    
    const character = await getFromCollection("characters", "_id", new ObjectId(charId));
    if (!character) {
        return ctx.reply("Non ho trovato questo personaggio. Riprova.");
    }

    ctx.session.adventureLock = true;
    await ctx.answerCbQuery(`Hai scelto ${character.name}!`);
    await ctx.editMessageText(`L'avventura di ${character.name} sta per iniziare...`);
    
    ctx.scene.enter("martaAdventureScene", { character: character });
  });

  // Comando resetAdventure
  bot.command("resetAdventure", (ctx) => {
    ctx.session = { adventureLock: false };
    ctx.scene.leave();
    ctx.reply("Il tuo stato è stato resettato.");
  });

  // --- NUOVO COMANDO newEpisode ---
  bot.command("newEpisode", async (ctx) => {
    console.log("Comando /newEpisode ricevuto. Rigenerazione episodio e reset stato.");
    await ctx.reply("Sto generando un nuovo episodio per l'avventura di Marta. Potrebbe volerci un momento...");
    
    try {
      await generateEpisodeFormat(); // Questa funzione genera e salva il nuovo episodio
      ctx.session = { adventureLock: false }; // Reset dello stato utente
      ctx.scene.leave(); // Uscita da qualsiasi scena
      await ctx.reply("Un nuovo episodio è stato generato e il tuo stato è stato resettato. Ora puoi iniziare una nuova avventura!");
    } catch (error) {
      console.error("Errore durante la generazione del nuovo episodio:", error);
      await ctx.reply("Si è verificato un errore durante la generazione del nuovo episodio. Riprova più tardi.");
    }
  });
  // --------------------------------

  // Comandi sub/unsub
  bot.command("sub", async (ctx) => {
    await bot.telegram.sendMessage(ctx.chat.id, "A quale broadcast vuoi iscriverti?", Markup.inlineKeyboard([
        Markup.button.callback("Marta", "marta@subscribe"),
        Markup.button.callback("RandomSpell", "randomSpell@subscribe"),
    ]));
  });
  bot.command("unsub", async (ctx) => {
    await bot.telegram.sendMessage(ctx.chat.id, "Da quale broadcast vuoi uscire?", Markup.inlineKeyboard([
        Markup.button.callback("Marta", "marta@unsubscribe"),
        Markup.button.callback("RandomSpell", "randomSpell@unsubscribe"),
    ]));
  });
  bot.action("marta@subscribe", async (ctx) => { await setInBroadcastSubs(MARTA_SUBS, ctx.chat.id); return ctx.reply("Sottoscrizione Marta effettuata"); });
  bot.action("randomSpell@subscribe", async (ctx) => { await setInBroadcastSubs(SPELLS_SUBS, ctx.chat.id); return ctx.reply("Sottoscrizione RandomSpell effettuata"); });
  bot.action("marta@unsubscribe", async (ctx) => { await removeInBroadcastSubs(MARTA_SUBS, ctx.chat.id); return ctx.reply("Sottoscrizione Marta rimossa"); });
  bot.action("randomSpell@unsubscribe", async (ctx) => { await removeInBroadcastSubs(SPELLS_SUBS, ctx.chat.id); return ctx.reply("Sottoscrizione RandomSpell rimossa"); });
  
  // Comando ask
  bot.command('ask', async (ctx) => {
    await ctx.persistentChatAction("typing", async () => {
      const messageText = ctx.message.text;
      const question = messageText.replace('/ask', '').trim();
      if (question !== "") {
        const reply = await askDnD5eAssistant(question);
        await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
      } else {
        ctx.reply("per favore inserisci una domanda valida");
      }
    });
  });
  
  // Comandi createCharacter, sonogiosy, beSilly
  bot.command("createCharacter", Stage.enter("characterScene"));
  bot.command("sonogiosy", Stage.enter("fileUploadScene"));
  bot.command("beSilly", async () => await randomSpellBroadcast(bot));
}

async function sendCharacter(ctx, type) {
    await ctx.persistentChatAction("typing", async () => {
        const msg = ctx.message.text;
        const charLevel = 1;
        const reply = await getStandardChar(msg, charLevel, type);
        await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
    });
}

function setupCronJobs(bot) {
  cron.schedule("0 10 * * *", async () => await randomSpellBroadcast(bot));
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
  cron.schedule("0 0 * * *", async () => {
    try {
      const sessionsCollection = mongoClient.db("marta_game").collection("sessions");
      const result = await sessionsCollection.updateMany(
        { "data.adventureLock": true },
        { $set: { "data.adventureLock": false } }
      );
      console.log(`CRON: Reset completato. ${result.modifiedCount} sessioni sbloccate.`);
    } catch (error) {
      console.error("CRON: Errore durante il reset dei lock:", error);
    }
  });
}

startBot();
