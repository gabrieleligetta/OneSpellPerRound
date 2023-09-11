import { generalPrompt } from "./chatgpt.js";
import {
  getBroadcastSubs,
  getMartaEpisodePrompt,
  setInUniqueActionArray,
} from "./cache.js";
import { MARTA_SUBS, SPELLS_SUBS } from "./constants.js";
import { Markup } from "telegraf";
import { generateEpisodeFormat } from "./prompts.js";
import { getSpell } from "./spell.js";
import { Prompts } from "./utils.js";

export const randomSpellBroadcast = async (bot) => {
  const richiesta =
    "rispondimi solo con una battuta divertente a tema fantasy senza che sembri la risposta di un bot";
  const USERS_CACHE = await getBroadcastSubs(SPELLS_SUBS);
  if (USERS_CACHE?.value?.length) {
    let battuta = await generalPrompt(
      { text: richiesta, temperature: 0.7 },
      Prompts.BattuteDnD
    );
    if (!battuta) {
      battuta = "Oh no! Qualcosa non ha funzionato!";
    }
    for (const chatId of USERS_CACHE.value) {
      await bot.telegram.sendMessage(
        chatId,
        "Ecco la battuta cringe del giorno!"
      );
      await bot.telegram.sendMessage(chatId, battuta);
      await bot.telegram.sendMessage(chatId, "Ecco la spell del giorno!");
      await bot.telegram.sendChatAction(chatId, "typing");
      let reply = await getSpell("random");
      await bot.telegram.sendMessage(chatId, reply, { parse_mode: "HTML" });
    }
  }
};

export const raccontoDiMartaBroadcast = async (bot) => {
  const USERS_CACHE = (await getBroadcastSubs(MARTA_SUBS)) || [];
  let MARTA_EPISODE_PROMPT = getMartaEpisodePrompt();
  try {
    if (!MARTA_EPISODE_PROMPT) {
      await generateEpisodeFormat();
    }
    console.log("sono nel broadcast");
    if (USERS_CACHE?.value?.length) {
      for (const chatId of USERS_CACHE.value) {
        await bot.telegram.sendChatAction(chatId, "typing");
        await bot.telegram.sendPhoto(chatId, {
          source: "./imgs/witch2.jpeg",
        });
        setInUniqueActionArray(chatId);
        await bot.telegram.sendMessage(
          chatId,
          "Avviare una nuova avventura di Marta la papera col cappello da strega?",
          Markup.inlineKeyboard([
            Markup.button.callback(
              "Tira Il Dado!",
              "startMartaAdventure",
              false
            ),
          ])
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
};
