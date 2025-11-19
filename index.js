import { Markup, session, Telegraf } from "telegraf";
import dotenv from "dotenv";
import {
  removeInBroadcastSubs,
  setInBroadcastSubs,
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
import { client as mongoClient } from "./mongoDB.js"; // Importa il client MongoDB
import { MongoDBSession } from "@telegraf/session/mongodb"; // Importa il gestore di sessione

dotenv.config();

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(token);

// Fase 1: Configurazione della sessione persistente su MongoDB
const sessionsCollection = mongoClient.db("marta_game").collection("sessions");
bot.use(session({
  store: MongoDBSession(sessionsCollection),
  defaultSession: () => ({ adventureLock: false }),
}));

const stage = new Stage([characterScene, fileUploadScene, martaAdventureScene]);
bot.use(stage.middleware());

// Helper function for character generation
const sendCharacter = async (ctx, type) => {
  await ctx.persistentChatAction("typing", async () => {
    const msg = ctx.message.text;
    const charLevel = 1;
    const reply = await getStandardChar(msg, charLevel, type);
    await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
  });
};

// Refactored character commands
bot.command("randomchar", (ctx) => sendCharacter(ctx, "standard"));
bot.command("randomrolledchar", (ctx) => sendCharacter(ctx, "rolled"));
bot.command("randombestchar", (ctx) => sendCharacter(ctx, "best"));

bot.command("randomspell", async (ctx) => {
  await ctx.persistentChatAction("typing", async () => {
    const reply = await getSpell("random");
    await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
  });
});

bot.command("enterDungeon", async (ctx) => {
  console.log("Comando /enterDungeon ricevuto");
  await bot.telegram.sendChatAction(ctx.chat.id, "typing");
  await bot.telegram.sendPhoto(ctx.chat.id, {
    source: "./imgs/witch2.jpeg",
  });
  await bot.telegram.sendMessage(
    ctx.chat.id,
    "Avviare una nuova avventura di Marta la papera col cappello da strega?",
    Markup.inlineKeyboard([
      Markup.button.callback("Tira Il Dado!", "startMartaAdventure"),
    ])
  );
});

bot.action("startMartaAdventure", async (ctx) => {
  console.log("Azione 'startMartaAdventure' ricevuta.");
  
  if (ctx.session.adventureLock) {
    console.log("Bloccato: un'avventura è già in corso.");
    return ctx.answerCbQuery("Sto già preparando un'avventura per te!", { show_alert: true });
  }

  console.log("Impostazione del lock e avvio avventura.");
  ctx.session.adventureLock = true;
  
  await ctx.answerCbQuery("L'avventura sta per iniziare!");
  await ctx.reply("Sto creando la tua avventura, un momento...");

  ctx.scene.enter("martaAdventureScene");
});

bot.command("reset_adventure", (ctx) => {
  console.log("Comando /reset_adventure ricevuto. Reset della sessione.");
  ctx.session = { adventureLock: false };
  ctx.scene.leave();
  ctx.reply("Il tuo stato è stato resettato. Ora puoi iniziare una nuova avventura.");
});

bot.command("sub", async (ctx) => {
  await bot.telegram.sendMessage(
    ctx.chat.id,
    "A quale broadcast vuoi iscriverti?",
    Markup.inlineKeyboard([
      Markup.button.callback("Marta", "marta@subscribe"),
      Markup.button.callback("RandomSpell", "randomSpell@subscribe"),
    ])
  );
});

bot.command("unsub", async (ctx) => {
  await bot.telegram.sendMessage(
    ctx.chat.id,
    "Da quale broadcast vuoi uscire?",
    Markup.inlineKeyboard([
      Markup.button.callback("Marta", "marta@unsubscribe"),
      Markup.button.callback("RandomSpell", "randomSpell@unsubscribe"),
    ])
  );
});

bot.action("marta@subscribe", async (ctx) => {
  await setInBroadcastSubs(MARTA_SUBS, ctx.chat.id);
  return ctx.reply("Sottoscrizione Marta effettuata");
});

bot.action("randomSpell@subscribe", async (ctx) => {
  await setInBroadcastSubs(SPELLS_SUBS, ctx.chat.id);
  return ctx.reply("Sottoscrizione RandomSpell effettuata");
});

bot.action("marta@unsubscribe", async (ctx) => {
  await removeInBroadcastSubs(MARTA_SUBS, ctx.chat.id);
  return ctx.reply("Sottoscrizione Marta rimossa");
});

bot.action("randomSpell@unsubscribe", async (ctx) => {
  await removeInBroadcastSubs(SPELLS_SUBS, ctx.chat.id);
  return ctx.reply("Sottoscrizione RandomSpell rimossa");
});

bot.command('ask', async (ctx) => {
  await ctx.persistentChatAction("typing", async () => {
    const messageText = ctx.message.text;
    const question = messageText.replace('/ask', '').trim();
    console.log('User question:', question);
    if (question !== "")  {
      const reply = await askDnD5eAssistant(question)
      await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
    } else {
      ctx.reply("per favore inserisci una domanda valida");
    }
  });
});

//SETTINGS SECTION OF THE BOT INDEX, CRONS AND HELP FUNCTIONS

bot.command("createCharacter", Stage.enter("characterScene"));
bot.command("sonogiosy", Stage.enter("fileUploadScene"));

bot.command("beSilly", async () => {
  await randomSpellBroadcast(bot);
});

cron.schedule("0 10 * * *", async () => {
  await randomSpellBroadcast(bot);
});

cron.schedule("00 16 * * *", async () => {
  console.log("sono nel chron di Marta");
  try {
    await raccontoDiMartaBroadcast(bot);
  } catch (e) {
    console.log(e);
  }
});

cron.schedule("0 1 * * *", async () => {
  console.log("sono nel chron di MARTA_EPISODE_PROMPT");
  await generateEpisodeFormat();
});

// Fase 2: Cron job per resettare i lock a mezzanotte
cron.schedule("0 0 * * *", async () => {
  console.log("Esecuzione cron job di mezzanotte: reset dei lock delle avventure.");
  try {
    const result = await sessionsCollection.updateMany(
      { "data.adventureLock": true },
      { $set: { "data.adventureLock": false } }
    );
    console.log(`Reset completato. ${result.modifiedCount} sessioni sono state sbloccate.`);
  } catch (error) {
    console.error("Errore durante il reset dei lock delle sessioni:", error);
  }
});

// Global error handler
bot.catch((err, ctx) => {
  console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
  if (ctx.session) {
    ctx.session.adventureLock = false; // Rilascia il lock in caso di errore
  }
  ctx.reply("Si è verificato un errore, per favore riprova più tardi.").catch(e => {
    console.error("Failed to send error message to user", e);
  });
});

bot.launch().then(() => {
  console.log(">>> Bot avviato correttamente con sessioni su MongoDB!");
});
