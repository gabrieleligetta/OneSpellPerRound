import { Markup, session, Telegraf } from "telegraf";
import dotenv from "dotenv";
import {
  getUniqueActionArray,
  removeInBroadcastSubs,
  removeInUniqueActionArray,
  setInBroadcastSubs,
  setInUniqueActionArray,
} from "./cache.js";
import { generateDiceRollPrompt } from "./dicePrompts.js";
import { abstractDice, chunk } from "./utils.js";
import {
  avventuraInterattivaMartaLaPapera,
  sendFollowUpMessage,
} from "./avventuraMartaLaPapera.js";
import { promptForMarta } from "./chatgpt.js";
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

dotenv.config();

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(token);
bot.use(session({ defaultSession: () => ({}) }));

const stage = new Stage([characterScene, fileUploadScene]);

bot.command("randomchar", async (ctx) => {
  await ctx.persistentChatAction("typing", async () => {
    let msg = ctx.message.text;
    let charLevel = 1;
    let reply = await getStandardChar(msg, charLevel, "standard");
    await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
  });
});

bot.command("randomrolledchar", async (ctx) => {
  await ctx.persistentChatAction("typing", async () => {
    let msg = ctx.message.text;
    let charLevel = 1;
    let reply = await getStandardChar(msg, charLevel, "rolled");
    await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
  });
});

bot.command("randombestchar", async (ctx) => {
  await ctx.persistentChatAction("typing", async () => {
    let msg = ctx.message.text;
    let charLevel = 1;
    let reply = await getStandardChar(msg, charLevel, "best");
    await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
  });
});

bot.command("randomspell", async (ctx) => {
  await ctx.persistentChatAction("typing", async () => {
    let reply = await getSpell("random");
    await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
  });
});

bot.command("enterDungeon", async (ctx) => {
  await bot.telegram.sendChatAction(ctx.chat.id, "typing");
  await bot.telegram.sendPhoto(ctx.chat.id, {
    source: "./imgs/witch2.jpeg",
  });
  setInUniqueActionArray(ctx.chat.id);
  await bot.telegram.sendMessage(
    ctx.chat.id,
    "Avviare una nuova avventura di Marta la papera col cappello da strega?",
    Markup.inlineKeyboard([
      Markup.button.callback("Tira Il Dado!", "startMartaAdventure", false),
    ])
  );
});

bot.action("startMartaAdventure", async (ctx) => {
  console.log("ctx.session--startMartaAdventure");
  console.log(ctx.session);
  const uniqueActionArray = getUniqueActionArray();
  if (uniqueActionArray.includes(ctx.chat.id)) {
    removeInUniqueActionArray(ctx.chat.id);
    await avventuraInterattivaMartaLaPapera(ctx);
  } else {
    return ctx.answerCbQuery("Non è più possibile avviare l'avventura");
  }
});

bot.action("suggestAction", async (ctx) => {
  await ctx.reply("Descrivi l'azione che vuoi intraprendere:");
  bot.on('text', async (ctx) => {
    ctx.session[ctx.chat.id] = ctx.session[ctx.chat.id] || {};
    ctx.session[ctx.chat.id].suggestedAction = ctx.message.text;

    await ctx.reply(
        "Ora tira il dado per determinare se la tua azione ha successo",
        Markup.inlineKeyboard([
          Markup.button.callback("Tira Il Dado", "rollDice", false),
        ])
    );
  });
});

bot.action("rollDice", async (ctx) => {
  const uniqueActionArray = getUniqueActionArray();
  const uniqueAction = ctx.session?.[ctx.chat.id]?.uniqueAction;
  const suggestedAction = ctx.session?.[ctx.chat.id]?.suggestedAction;

  if (!suggestedAction) {
    return ctx.answerCbQuery("Prima suggerisci un'azione!");
  }

  if (!!uniqueAction && uniqueActionArray?.includes(uniqueAction)) {
    removeInUniqueActionArray(uniqueAction);
    const diceRoll = abstractDice(1, 20);
    await ctx.reply("Hai Rollato: " + diceRoll);
    const prompt = generateDiceRollPrompt(
        diceRoll,
        ctx.session[ctx.chat.id].trialDifficulty,
        ctx,
        suggestedAction
    );
    await ctx.persistentChatAction("typing", async () => {
      const reply = await promptForMarta(
          prompt,
          1,
          process.env.CHATGPT_MODEL,
          ctx.session[ctx.chat.id].dungeonData,
          ctx.chat.id
      );
      for (const part of chunk(reply, 4096)) {
        await ctx.telegram.sendMessage(ctx.chat.id, part);
      }
    });
    await sendFollowUpMessage(ctx);
  } else {
    return ctx.answerCbQuery("You already rolled the dice!");
  }
});

bot.command("sub", async (ctx) => {
  await bot.telegram.sendMessage(
    ctx.chat.id,
    "A quale broadcast vuoi iscriverti?",
    Markup.inlineKeyboard([
      Markup.button.callback("Marta", "marta@subscribe", false),
      Markup.button.callback("RandomSpell", "randomSpell@subscribe", false),
    ])
  );
});

bot.command("unsub", async (ctx) => {
  await bot.telegram.sendMessage(
    ctx.chat.id,
    "Da quale broadcast vuoi uscire?",
    Markup.inlineKeyboard([
      Markup.button.callback("Marta", "marta@unsubscribe", false),
      Markup.button.callback("RandomSpell", "randomSpell@unsubscribe", false),
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
    // The full text message (e.g., "/ask What is the meaning of life?")
    const messageText = ctx.message.text;

    // Extract the question part (everything after the command)
    const question = messageText.replace('/ask', '').trim();

    // Log the question to the console
    console.log('User question:', question);
    if (question !== "")  {
      const reply = await askDnD5eAssistant(question)
      // Respond back with the same question (optional)
      await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
    } else {
      ctx.reply("per favore inserisci una domanda valida");
    }
  });
});

//SETTINGS SECTION OF THE BOT INDEX, CRONS AND HELP FUNCTIONS

bot.use(stage.middleware());

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

bot.launch().then(r => console.log(r));
