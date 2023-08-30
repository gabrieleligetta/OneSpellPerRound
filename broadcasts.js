const chatgpt = require("./chatgpt");
const { Prompts } = require("./utils");
const spell = require("./spell");
const { generateEpisodeFormat } = require("./prompts");
const { Markup } = require("telegraf");
const randomSpellBroadcast = async () => {
  const richiesta =
    "rispondimi solo con una battuta divertente a tema fantasy senza che sembri la risposta di un bot";
  if (USERS_CACHE.length) {
    let battuta = await chatgpt.prompt(
      { text: richiesta, temperature: 0.7 },
      Prompts.BattuteDnD
    );
    if (!battuta) {
      battuta = "Oh no! Qualcosa non ha funzionato!";
    }
    for (const chatId of USERS_CACHE) {
      await bot.telegram.sendMessage(
        chatId,
        "Ecco la battuta cringe del giorno!"
      );
      await bot.telegram.sendMessage(chatId, battuta);
      await bot.telegram.sendMessage(chatId, "Ecco la spell del giorno!");
      await bot.telegram.sendChatAction(chatId, "typing");
      let reply = await spell.getSpell("random");
      await bot.telegram.sendMessage(chatId, reply, { parse_mode: "HTML" });
    }
  }
};

const raccontoDiMartaBroadcast = async () => {
  try {
    if (!MARTA_EPISODE_PROMPT) {
      MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
    }
    console.log("sono nel broadcast");
    if (USERS_CACHE.length) {
      for (const chatId of USERS_CACHE) {
        await bot.telegram.sendChatAction(chatId, "typing");
        await bot.telegram.sendPhoto(chatId, {
          source: "./imgs/witch2.jpeg",
        });
        uniqueActionArray.push(chatId);
        await bot.telegram.sendMessage(
          chatId,
          "Avviare una nuova avventura di Marta la papera col cappello da strega?",
          Markup.inlineKeyboard([
            Markup.callbackButton(
              "Tira Il Dado!",
              "startMartaAdventure",
              false
            ),
          ]).extra()
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  randomSpellBroadcast,
  raccontoDiMartaBroadcast,
};
