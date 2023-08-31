import { Markup } from "telegraf";
import { getMartaEpisodePrompt, setInUniqueActionArray } from "./cache.js";
import {
  generateEpisodeFinale,
  generateEpisodeFormat,
  generateIntroducktion,
  generateTrial,
} from "./prompts.js";
import { promptForMarta } from "./chatgpt.js";
import { abstractDice, chunk } from "./utils.js";

export const avventuraInterattivaMartaLaPapera = async (ctx) => {
  let MARTA_EPISODE_PROMPT = getMartaEpisodePrompt();
  if (!MARTA_EPISODE_PROMPT) {
    MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
  }
  ctx.session[ctx.chat.id] = {};
  ctx.session[ctx.chat.id]["dungeonData"] = 0;
  const richiesta = generateIntroducktion(MARTA_EPISODE_PROMPT);
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let reply = await promptForMarta(
    richiesta,
    1,
    "gpt-3.5-turbo",
    ctx.session[ctx.chat.id].dungeonData,
    ctx.chat.id,
    true
  );
  for (const part of chunk(reply, 4096)) {
    await ctx.telegram.sendMessage(ctx.chat.id, part);
  }
  const difficulty = abstractDice(0, 10);
  const uniqueAction = makeid(8);
  setInUniqueActionArray(uniqueAction);
  ctx.session[ctx.chat.id].uniqueAction = uniqueAction;
  ctx.session[ctx.chat.id].dungeonData = 1;
  ctx.session[ctx.chat.id].trialDifficulty =
    difficulty + ctx.session[ctx.chat.id].dungeonData;
  const firstTrial = generateTrial(
    MARTA_EPISODE_PROMPT,
    "la prima prova",
    difficulty,
    ctx.session[ctx.chat.id].dungeonData
  );
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  reply = await promptForMarta(
    firstTrial,
    1,
    "gpt-3.5-turbo",
    ctx.session[ctx.chat.id].dungeonData,
    ctx.chat.id
  );
  for (const part of chunk(reply, 4096)) {
    await ctx.telegram.sendMessage(ctx.chat.id, part);
  }
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    "Cosa Vuoi Fare?",
    Markup.inlineKeyboard([
      Markup.callbackButton("Tira Il Dado", "rollDice", false),
      // Markup.callbackButton("Suggerisci Azione", "ActionPrompt", false),
    ]).extra()
  );
};

export const sendFollowUpMessage = async (ctx) => {
  let MARTA_EPISODE_PROMPT = getMartaEpisodePrompt();
  if (ctx.session[ctx.chat.id].dungeonData === 1) {
    ctx.session[ctx.chat.id].dungeonData++;
    const difficulty = abstractDice(5, 11);
    ctx.session[ctx.chat.id].trialDifficulty =
      difficulty + ctx.session[ctx.chat.id].dungeonData;
    const uniqueAction = makeid(8);
    setInUniqueActionArray(uniqueAction);
    ctx.session[ctx.chat.id].uniqueAction = uniqueAction;
    const secondTrial = generateTrial(
      MARTA_EPISODE_PROMPT,
      "la seconda prova",
      difficulty,
      ctx.session[ctx.chat.id].dungeonData
    );
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
    const reply = await promptForMarta(
      secondTrial,
      1,
      "gpt-3.5-turbo",
      ctx.session[ctx.chat.id].dungeonData,
      ctx.chat.id
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    await ctx.telegram.sendMessage(
      ctx.chat.id,
      "Cosa Vuoi Fare?",
      Markup.inlineKeyboard([
        Markup.callbackButton("Tira Il Dado", "rollDice", false),
        // Markup.callbackButton("Suggerisci Azione", "ActionPrompt", false),
      ]).extra()
    );
  } else if (ctx.session[ctx.chat.id].dungeonData === 2) {
    ctx.session[ctx.chat.id].dungeonData++;
    const difficulty = abstractDice(8, 11);
    ctx.session[ctx.chat.id].trialDifficulty =
      difficulty + ctx.session[ctx.chat.id].dungeonData;
    const uniqueAction = makeid(8);
    setInUniqueActionArray(uniqueAction);
    ctx.session[ctx.chat.id].uniqueAction = uniqueAction;
    const thirdTrial = generateTrial(
      MARTA_EPISODE_PROMPT,
      "la terza e ultima prova",
      difficulty,
      ctx.session[ctx.chat.id].dungeonData
    );
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
    const reply = await promptForMarta(
      thirdTrial,
      1,
      "gpt-3.5-turbo",
      ctx.session[ctx.chat.id].dungeonData,
      ctx.chat.id
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    await ctx.telegram.sendMessage(
      ctx.chat.id,
      "Cosa Vuoi Fare?",
      Markup.inlineKeyboard([
        Markup.callbackButton("Tira Il Dado", "rollDice", false),
        // Markup.callbackButton("Suggerisci Azione", "ActionPrompt", false),
      ]).extra()
    );
  } else if (ctx.session[ctx.chat.id].dungeonData === 3) {
    ctx.session[ctx.chat.id].dungeonData++;
    ctx.session[ctx.chat.id].uniqueAction = makeid(8);

    const finale = generateEpisodeFinale(
      MARTA_EPISODE_PROMPT,
      ctx.session[ctx.chat.id].overallSuccess
    );
    ctx.session[ctx.chat.id].overallSuccess = 0;
    console.log("ctx.session[ctx.chat.id].overallSuccess");
    console.log(ctx.session[ctx.chat.id].overallSuccess);
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
    const reply = await promptForMarta(
      finale,
      1,
      "gpt-3.5-turbo",
      ctx.session[ctx.chat.id].dungeonData,
      ctx.chat.id
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
  }
};
