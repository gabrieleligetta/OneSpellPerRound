import { Markup } from "telegraf";
import { BaseScene } from "telegraf/scenes";
import { getMartaEpisodePrompt } from "../cache.js";
import {
  generateEpisodeFinale,
  generateEpisodeFormat,
  generateIntroducktion,
  generateTrial,
} from "../prompts.js";
import { promptForMarta } from "../chatgpt.js";
import { abstractDice, chunk, makeid } from "../utils.js";

export const martaAdventureScene = new BaseScene("martaAdventureScene");

// 1. Ingresso nella scena
martaAdventureScene.enter(async (ctx) => {
  // Inizializza lo stato della scena
  ctx.scene.session.dungeonData = 0;
  ctx.scene.session.overallSuccess = 0;

  let MARTA_EPISODE_PROMPT = getMartaEpisodePrompt();
  if (!MARTA_EPISODE_PROMPT) {
    MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
  }
  ctx.scene.session.MARTA_EPISODE_PROMPT = MARTA_EPISODE_PROMPT;

  const richiesta = generateIntroducktion(MARTA_EPISODE_PROMPT);

  await ctx.reply("Inizia l'avventura di Marta!");
  await ctx.persistentChatAction("typing", async () => {
    const reply = await promptForMarta(
      richiesta,
      1,
      process.env.CHATGPT_MODEL,
      ctx.scene.session.dungeonData,
      ctx.chat.id,
      true
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
  });

  // Passa alla prima prova
  return ctx.scene.enter("martaAdventureScene", { step: "trial" });
});

// Gestore centralizzato per le prove
martaAdventureScene.on("text", async (ctx) => {
  // Questo gestore cattura l'azione suggerita dall'utente
  const suggestedAction = ctx.message.text;
  ctx.scene.session.suggestedAction = suggestedAction;

  await ctx.reply(
    "Ottima idea! Ora tira il dado per vedere se la tua azione ha successo.",
    Markup.inlineKeyboard([
      Markup.button.callback("Tira Il Dado!", "rollDiceInScene"),
    ])
  );
});

martaAdventureScene.action("rollDiceInScene", async (ctx) => {
  await ctx.answerCbQuery("Hai tirato il dado!");
  const suggestedAction = ctx.scene.session.suggestedAction;

  if (!suggestedAction) {
    return ctx.reply("Dovresti prima suggerire un'azione!");
  }

  const diceRoll = abstractDice(1, 20);
  await ctx.reply(`Hai rollato: ${diceRoll}`);

  const trialDifficulty = ctx.scene.session.trialDifficulty;
  const isSuccess = diceRoll >= trialDifficulty;
  if (isSuccess) {
    ctx.scene.session.overallSuccess++;
  }

  const prompt = generateDiceRollPrompt(
    diceRoll,
    trialDifficulty,
    ctx, // Potrebbe essere necessario adattare cosa viene passato qui
    suggestedAction
  );

  await ctx.persistentChatAction("typing", async () => {
    const reply = await promptForMarta(
      prompt,
      1,
      process.env.CHATGPT_MODEL,
      ctx.scene.session.dungeonData,
      ctx.chat.id
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
  });
  
  // Logica per passare alla prova successiva o al finale
  if (ctx.scene.session.dungeonData < 3) {
     return ctx.scene.enter("martaAdventureScene", { step: "trial" });
  } else {
     return ctx.scene.enter("martaAdventureScene", { step: "finale" });
  }
});

// Logica per gestire i vari step
martaAdventureScene.use(async (ctx, next) => {
  if (ctx.scene.state.step === "trial") {
    ctx.scene.session.dungeonData++;
    const difficultyMap = { 1: 5, 2: 11, 3: 11 };
    const trialNameMap = { 1: "la prima prova", 2: "la seconda prova", 3: "la terza e ultima prova" };

    const difficulty = abstractDice(ctx.scene.session.dungeonData === 1 ? 0 : (ctx.scene.session.dungeonData === 2 ? 5 : 8), difficultyMap[ctx.scene.session.dunngeonData]);
    ctx.scene.session.trialDifficulty = difficulty + ctx.scene.session.dungeonData;

    const trialPrompt = generateTrial(
      ctx.scene.session.MARTA_EPISODE_PROMPT,
      trialNameMap[ctx.scene.session.dungeonData],
      difficulty,
      ctx.scene.session.dungeonData
    );

    await ctx.persistentChatAction("typing", async () => {
      const reply = await promptForMarta(
        trialPrompt,
        1,
        process.env.CHATGPT_MODEL,
        ctx.scene.session.dungeonData,
        ctx.chat.id
      );
      for (const part of chunk(reply, 4096)) {
        await ctx.telegram.sendMessage(ctx.chat.id, part);
      }
    });

    await ctx.reply(
      "Cosa vuoi fare? Descrivi la tua azione.",
    );
    // La scena ora attenderà l'input di testo dall'utente
    return;
  }
  
  if (ctx.scene.state.step === "finale") {
      ctx.scene.session.dungeonData++;
      const finalePrompt = generateEpisodeFinale(
        ctx.scene.session.MARTA_EPISODE_PROMPT,
        ctx.scene.session.overallSuccess
      );

      await ctx.persistentChatAction("typing", async () => {
        const reply = await promptForMarta(
          finalePrompt,
          1,
          process.env.CHATGPT_MODEL,
          ctx.scene.session.dungeonData,
          ctx.chat.id
        );
        for (const part of chunk(reply, 4096)) {
          await ctx.telegram.sendMessage(ctx.chat.id, part);
        }
      });
      
      await ctx.reply("L'avventura di Marta si conclude qui. Grazie per aver giocato!");
      return ctx.scene.leave();
  }

  return next();
});

function generateDiceRollPrompt(diceRoll, trialDifficulty, ctx, suggestedAction) {
    // Implementa la logica per generare il prompt del tiro di dado
    // Questa è una funzione di placeholder
    return `L'utente ha suggerito di '${suggestedAction}' e ha ottenuto ${diceRoll} su un tiro con difficoltà ${trialDifficulty}. Descrivi cosa succede.`;
}
