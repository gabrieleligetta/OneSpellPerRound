import { Markup, session, Telegraf } from "telegraf";
import dotenv from "dotenv";
import {
  getUniqueActionArray,
  removeInUniqueActionArray,
  setInUniqueActionArray,
  setInUserCache,
} from "./cache.js";
import { generateDiceRollPrompt } from "./dicePrompts.js";
import { abstractDice, chunk } from "./utils.js";
import {
  avventuraInterattivaMartaLaPapera,
  sendFollowUpMessage,
} from "./avventuraMartaLaPapera.js";
import { promptForMarta } from "./chatgpt.js";
import { cs } from "./scenes/characterScene.js";
import { getStandardChar } from "./persona.js";
import { getSpell } from "./spell.js";
import { message } from "telegraf/filters";
import { Stage } from "telegraf/scenes";

dotenv.config();

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(token);

const stage = new Stage([cs]);

bot.command("randomchar", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let msg = ctx.message.text;
  let charLevel = 1;
  let reply = await getStandardChar(msg, charLevel, "standard");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("randomrolledchar", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let msg = ctx.message.text;
  let charLevel = 1;
  let reply = await getStandardChar(msg, charLevel, "rolled");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("randombestchar", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let msg = ctx.message.text;
  let charLevel = 1;
  let reply = await getStandardChar(msg, charLevel, "best");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("randomspell", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let reply = await getSpell("random");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
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

bot.command("createCharacter", async (ctx) => {
  let userFirstName = ctx.message.from.first_name;
  let message = ` Ciao ${userFirstName}, ti guiderò nella creazione del tuo personaggio. \n
    Sei una papera?`;

  let options = Markup.inlineKeyboard([
    Markup.button.callback("🦆", "characterScene"),
    Markup.button.callback("🦢", "characterScene"),
  ]);
  await ctx.reply(message, options);
});

bot.action("startMartaAdventure", async (ctx) => {
  const uniqueActionArray = getUniqueActionArray();
  if (uniqueActionArray.includes(ctx.chat.id)) {
    removeInUniqueActionArray(ctx.chat.id);
    await avventuraInterattivaMartaLaPapera(ctx);
  } else {
    return ctx.answerCbQuery("Non è più possibile avviare l'avventura");
  }
});

bot.action("rollDice", async (ctx) => {
  const uniqueActionArray = getUniqueActionArray();
  const uniqueAction = ctx.session[ctx.chat.id].uniqueAction;
  if (!!uniqueAction && uniqueActionArray.includes(uniqueAction)) {
    removeInUniqueActionArray(uniqueAction);
    const diceRoll = abstractDice(1, 20);
    await ctx.reply("Hai Rollato: " + diceRoll);
    const prompt = generateDiceRollPrompt(
      diceRoll,
      ctx.session[ctx.chat.id].trialDifficulty,
      ctx
    );
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
    const reply = await promptForMarta(
      prompt,
      1,
      "gpt-3.5-turbo",
      ctx.session[ctx.chat.id].dungeonData,
      ctx.chat.id
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    await sendFollowUpMessage(ctx);
  } else {
    return ctx.answerCbQuery("You already rolled the dice!");
  }
});

//SETTINGS SECTION OF THE BOT INDEX, CRONS AND HELP FUNCTIONS

bot.on(message("text"), async (ctx) => {
  setInUserCache(ctx.chat.id);
});

// cron.schedule("0 10 * * *", async () => {
//   await randomSpellBroadcast(bot);
// });
//
// cron.schedule("00 16 * * *", async () => {
//   console.log("sono nel chron di Marta");
//   console.log("sono nel chron di Marta");
//   try {
//     await raccontoDiMartaBroadcast(bot);
//   } catch (e) {
//     console.log(e);
//   }
// });
//
// cron.schedule("0 1 * * *", async () => {
//   console.log("sono nel chron di MARTA_EPISODE_PROMPT");
//   await generateEpisodeFormat();
// });

bot.use(session());
bot.use(stage.middleware());

bot.action("characterScene", Stage.enter("characterScene"));

bot.launch();
