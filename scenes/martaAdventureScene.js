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
  console.log("[Marta Scene] Entrato nella scena.");
  try {
    // Inizializza lo stato della scena
    ctx.scene.session.dungeonData = 0;
    ctx.scene.session.overallSuccess = 0;

    console.log("[Marta Scene] Inizializzazione episodio...");
    let MARTA_EPISODE_PROMPT = getMartaEpisodePrompt();
    if (!MARTA_EPISODE_PROMPT) {
      MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
    }
    ctx.scene.session.MARTA_EPISODE_PROMPT = MARTA_EPISODE_PROMPT;

    const richiesta = generateIntroducktion(MARTA_EPISODE_PROMPT);

    // await ctx.reply("Inizia l'avventura di Marta!"); // Messaggio già inviato in index.js
    console.log("[Marta Scene] Invio introduzione a OpenAI...");
    await ctx.persistentChatAction("typing", async () => {
      const reply = await promptForMarta(
        richiesta,
        1,
        process.env.CHATGPT_MODEL,
        ctx.scene.session.dungeonData,
        ctx.chat.id,
        true
      );
      console.log("[Marta Scene] Introduzione ricevuta, invio al client.");
      for (const part of chunk(reply, 4096)) {
        await ctx.telegram.sendMessage(ctx.chat.id, part);
      }
    });

    console.log("[Marta Scene] Passaggio alla prima prova.");
    // Passa alla prima prova
    return ctx.scene.enter("martaAdventureScene", { step: "trial" });
  } catch (error) {
    console.error("[Marta Scene] Errore critico all'ingresso nella scena:", error);
    ctx.session.adventureLock = false; // Rilascia il lock in caso di errore
    await ctx.reply("C'è stato un problema nella creazione dell'avventura. Riprova.");
    return ctx.scene.leave();
  }
});

// Gestore per l'input di testo (azione suggerita)
martaAdventureScene.on("text", async (ctx) => {
  console.log("[Marta Scene] Ricevuto input di testo (azione suggerita).");
  const suggestedAction = ctx.message.text;
  ctx.scene.session.suggestedAction = suggestedAction;
  console.log(`[Marta Scene] Azione suggerita: ${suggestedAction}`);

  await ctx.reply(
    "Ottima idea! Ora tira il dado per vedere se la tua azione ha successo.",
    Markup.inlineKeyboard([
      Markup.button.callback("Tira Il Dado!", "rollDiceInScene"),
    ])
  );
});

// Gestore per il tiro di dado
martaAdventureScene.action("rollDiceInScene", async (ctx) => {
  console.log("[Marta Scene] Ricevuta azione 'rollDiceInScene'.");
  await ctx.answerCbQuery("Hai tirato il dado!");
  const suggestedAction = ctx.scene.session.suggestedAction;

  if (!suggestedAction) {
    console.error("[Marta Scene] Errore: rollDice chiamato senza azione suggerita.");
    return ctx.reply("Dovresti prima suggerire un'azione!");
  }

  const diceRoll = abstractDice(1, 20);
  await ctx.reply(`Hai rollato: ${diceRoll}`);
  console.log(`[Marta Scene] Tiro di dado: ${diceRoll}`);

  const trialDifficulty = ctx.scene.session.trialDifficulty;
  const isSuccess = diceRoll >= trialDifficulty;
  if (isSuccess) {
    ctx.scene.session.overallSuccess++;
  }
  console.log(`[Marta Scene] Prova ${isSuccess ? "superata" : "fallita"}. Successi totali: ${ctx.scene.session.overallSuccess}`);

  const prompt = generateDiceRollPrompt(
    diceRoll,
    trialDifficulty,
    ctx,
    suggestedAction
  );

  console.log("[Marta Scene] Invio risultato tiro a OpenAI...");
  await ctx.persistentChatAction("typing", async () => {
    const reply = await promptForMarta(
      prompt,
      1,
      process.env.CHATGPT_MODEL,
      ctx.scene.session.dungeonData,
      ctx.chat.id
    );
    console.log("[Marta Scene] Risultato ricevuto, invio al client.");
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
  });
  
  // Logica per passare alla prova successiva o al finale
  if (ctx.scene.session.dungeonData < 3) {
     console.log("[Marta Scene] Passaggio alla prova successiva.");
     return ctx.scene.enter("martaAdventureScene", { step: "trial" });
  } else {
     console.log("[Marta Scene] Passaggio al finale.");
     return ctx.scene.enter("martaAdventureScene", { step: "finale" });
  }
});

// Middleware per gestire i vari step (trial, finale)
martaAdventureScene.use(async (ctx, next) => {
  const step = ctx.scene.state.step;
  console.log(`[Marta Scene] Middleware eseguito per lo step: ${step}`);

  if (step === "trial") {
    ctx.scene.session.dungeonData++;
    console.log(`[Marta Scene] Inizio prova numero: ${ctx.scene.session.dungeonData}`);
    const difficultyMap = { 1: 5, 2: 11, 3: 11 };
    const trialNameMap = { 1: "la prima prova", 2: "la seconda prova", 3: "la terza e ultima prova" };

    const difficulty = abstractDice(ctx.scene.session.dungeonData === 1 ? 0 : (ctx.scene.session.dungeonData === 2 ? 5 : 8), difficultyMap[ctx.scene.session.dungeonData]);
    ctx.scene.session.trialDifficulty = difficulty + ctx.scene.session.dungeonData;
    console.log(`[Marta Scene] Difficoltà prova: ${ctx.scene.session.trialDifficulty}`);

    const trialPrompt = generateTrial(
      ctx.scene.session.MARTA_EPISODE_PROMPT,
      trialNameMap[ctx.scene.session.dungeonData],
      difficulty,
      ctx.scene.session.dungeonData
    );

    console.log("[Marta Scene] Invio descrizione prova a OpenAI...");
    await ctx.persistentChatAction("typing", async () => {
      const reply = await promptForMarta(
        trialPrompt,
        1,
        process.env.CHATGPT_MODEL,
        ctx.scene.session.dungeonData,
        ctx.chat.id
      );
      console.log("[Marta Scene] Descrizione prova ricevuta, invio al client.");
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
  
  if (step === "finale") {
      console.log("[Marta Scene] Esecuzione finale.");
      ctx.scene.session.dungeonData++;
      const finalePrompt = generateEpisodeFinale(
        ctx.scene.session.MARTA_EPISODE_PROMPT,
        ctx.scene.session.overallSuccess
      );

      console.log("[Marta Scene] Invio finale a OpenAI...");
      await ctx.persistentChatAction("typing", async () => {
        const reply = await promptForMarta(
          finalePrompt,
          1,
          process.env.CHATGPT_MODEL,
          ctx.scene.session.dungeonData,
          ctx.chat.id
        );
        console.log("[Marta Scene] Finale ricevuto, invio al client.");
        for (const part of chunk(reply, 4096)) {
          await ctx.telegram.sendMessage(ctx.chat.id, part);
        }
      });
      
      await ctx.reply("L'avventura di Marta si conclude qui. Grazie per aver giocato!");
      console.log("[Marta Scene] Rilascio del lock e uscita dalla scena.");
      ctx.session.adventureLock = false; // Rilascia il lock
      return ctx.scene.leave();
  }

  return next();
});

function generateDiceRollPrompt(diceRoll, trialDifficulty, ctx, suggestedAction) {
    return `L'utente ha suggerito di '${suggestedAction}' e ha ottenuto ${diceRoll} su un tiro con difficoltà ${trialDifficulty}. Descrivi cosa succede.`;
}
