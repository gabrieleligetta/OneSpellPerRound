const telegraf = require("telegraf");
require("dotenv").config();
const persona = require("./persona");
const spell = require("./spell");
const chatgpt = require("./chatgpt");
const { chunk, abstractDice } = require("./utils");
const { Markup, session } = require("telegraf");
const { generateDiceRollPrompt } = require("./dicePrompts");
const {
  avventuraInterattivaMartaLaPapera,
  sendFollowUpMessage,
} = require("./avventuraMartaLaPapera");
const {
  setInUniqueActionArray,
  getUniqueActionArray,
  removeInUniqueActionArray,
  setInUserCache,
} = require("./cache");
const cron = require("node-cron");
const {
  randomSpellBroadcast,
  raccontoDiMartaBroadcast,
} = require("./broadcasts");
const { generateEpisodeFormat } = require("./prompts");
const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}
const bot = new telegraf(token);

bot.use(session());

bot.command("randomchar", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let msg = ctx.message.text;
  let charLevel = 1;
  let reply = await persona.getStandardChar(msg, charLevel, "standard");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("randomrolledchar", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let msg = ctx.message.text;
  let charLevel = 1;
  let reply = await persona.getStandardChar(msg, charLevel, "rolled");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("randombestchar", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let msg = ctx.message.text;
  let charLevel = 1;
  let reply = await persona.getStandardChar(msg, charLevel, "best");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("randomspell", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let reply = await spell.getSpell("random");
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
      Markup.callbackButton("Tira Il Dado!", "startMartaAdventure", false),
    ]).extra()
  );
});

bot.action("startMartaAdventure", async (ctx) => {
  const uniqueActionArray = getUniqueActionArray();
  if (uniqueActionArray.includes(ctx.chat.id)) {
    removeInUniqueActionArray(ctx.chat.id);
    await avventuraInterattivaMartaLaPapera(ctx);
  } else {
    return ctx.answerCbQuery("Hai già iniziato l' avventura!");
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
    const reply = await chatgpt.promptForMarta(
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

bot.on("text", async (ctx) => {
  const cache = setInUserCache(ctx.chat.id);
  console.log("aggiungo " + ctx.chat.id + " alla cache!");
  console.log("chache:  " + cache);
});

bot.help(async (ctx) => {
  await ctx.reply(
    "This bot can do the following commands:\n" +
      " - /help\n" +
      " - /randomchar\n" +
      " - /randomspell\n" +
      " - /randomrolledchar\n" +
      " - /randombestchar"
  );
});

bot.launch();
