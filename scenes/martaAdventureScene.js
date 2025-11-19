import { Markup } from "telegraf";
import { BaseScene } from "telegraf/scenes";
import { getMartaEpisodePrompt, setMartaEpisodePrompt } from "../cache.js";
import {
  generateEpisodeFinale,
  generateEpisodeFormat,
  generateIntroducktion,
  generateTrial,
} from "../prompts.js";
import { promptForMarta } from "../chatgpt.js";
import { abstractDice, chunk } from "../utils.js";

function generateDiceRollPrompt(diceRoll, trialDifficulty, suggestedAction) {
  return `L'utente ha suggerito di '${suggestedAction}' e ha ottenuto ${diceRoll} su un tiro con difficoltà ${trialDifficulty}. Descrivi cosa succede.`;
}

export const martaAdventureScene = new BaseScene("martaAdventureScene");

// --- GESTORI DI COMANDI INTERNI ALLA SCENA ---
martaAdventureScene.command("resetAdventure", async (ctx) => {
  console.log("[Marta Scene] Ricevuto comando /reset_adventure. Uscita forzata.");
  await ctx.reply("La tua avventura è stata resettata.");
  ctx.session.adventureLock = false;
  return ctx.scene.leave();
});

martaAdventureScene.command(["enterDungeon", "start", "help"], async (ctx) => {
  console.log(`[Marta Scene] Ricevuto comando '${ctx.message.text}' durante l'avventura.`);
  await ctx.reply("Sei già nel mezzo di un'avventura! Descrivi la tua prossima azione oppure usa il comando /reset_adventure per terminarla e ricominciare.");
});

// --- FLUSSO PRINCIPALE DELLA SCENA ---

// 1. Ingresso nella scena: Invia solo l'introduzione.
martaAdventureScene.enter(async (ctx) => {
  console.log("[Marta Scene] Entrato nella scena.");
  try {
    ctx.scene.session.dungeonData = 0;
    ctx.scene.session.overallSuccess = 0;
    ctx.scene.session.messageHistory = [{
        role: "system",
        content: "Sei il Dungeon Master di una campagna di D&D dove la protagonista è 'Marta la papera col cappello da Strega', che racconta episodi della vita di Marta e i suoi amici che sono degli avventurieri e vagano per il mondo di Ethim, popolato da animali antropomorfi, mostri e creature magiche senzienti, in un'atmosfera fantasy.",
    }];

    console.log("[Marta Scene] Caricamento episodio...");
    let MARTA_EPISODE_PROMPT = await getMartaEpisodePrompt();
    if (!MARTA_EPISODE_PROMPT) {
      console.warn("[Marta Scene] Nessun episodio pre-generato trovato. Lo genero al volo.");
      MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
      await setMartaEpisodePrompt(MARTA_EPISODE_PROMPT);
    }
    ctx.scene.session.MARTA_EPISODE_PROMPT = MARTA_EPISODE_PROMPT;
    console.log("[Marta Scene] Episodio caricato.");

    const richiesta = generateIntroducktion(MARTA_EPISODE_PROMPT);

    const { reply, updatedHistory } = await promptForMarta(
      richiesta, 1, process.env.CHATGPT_MODEL, ctx.scene.session.messageHistory
    );
    ctx.scene.session.messageHistory = updatedHistory;
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    
    // Dopo l'intro, chiedi subito la prima azione.
    await ctx.reply("Cosa vuoi fare? Descrivi la tua azione.");

  } catch (error) {
    console.error("[Marta Scene] Errore critico all'ingresso nella scena:", error);
    ctx.session.adventureLock = false;
    await ctx.reply("C'è stato un problema nella creazione dell'avventura. Riprova.");
    return ctx.scene.leave();
  }
});

// 2. Gestore per l'input di testo
martaAdventureScene.on("text", async (ctx) => {
  ctx.scene.session.suggestedAction = ctx.message.text;
  await ctx.reply(
    "Ottima idea! Ora tira il dado per determinare il successo della tua azione.",
    Markup.inlineKeyboard([
      Markup.button.callback("Tira Il Dado!", "rollDiceInScene"),
    ])
  );
});

// 3. Gestore per il tiro di dado - IL CERVELLO DELLA SCENA
martaAdventureScene.action("rollDiceInScene", async (ctx) => {
  await ctx.answerCbQuery("Hai tirato il dado!");
  
  const suggestedAction = ctx.scene.session.suggestedAction;
  if (!suggestedAction) return ctx.reply("Dovresti prima suggerire un'azione!");

  // --- LOGICA DI AVANZAMENTO E CALCOLO DIFFICOLTÀ ---
  const currentTrial = (ctx.scene.session.dungeonData || 0) + 1;
  ctx.scene.session.dungeonData = currentTrial;
  console.log(`[Marta Scene] Esecuzione prova numero: ${currentTrial}`);

  const difficultyMap = { 1: 5, 2: 11, 3: 11 };
  const baseDifficulty = abstractDice(currentTrial === 1 ? 0 : (currentTrial === 2 ? 5 : 8), difficultyMap[currentTrial]);
  const trialDifficulty = baseDifficulty + currentTrial;
  console.log(`[Marta Scene] Difficoltà calcolata: ${trialDifficulty}`);
  // ----------------------------------------------------

  const diceRoll = abstractDice(1, 20);
  await ctx.reply(`Hai rollato: ${diceRoll}`);
  
  console.log(`[Marta Scene] CONFRONTO: Tiro: ${diceRoll}, Difficoltà: ${trialDifficulty}`);
  const isSuccess = parseInt(diceRoll, 10) >= parseInt(trialDifficulty, 10);
  
  if (isSuccess) ctx.scene.session.overallSuccess++;
  console.log(`[Marta Scene] Prova ${isSuccess ? "superata" : "fallita"}. Successi totali: ${ctx.scene.session.overallSuccess}`);

  const resultPrompt = generateDiceRollPrompt(diceRoll, trialDifficulty, suggestedAction);
  const resultResponse = await promptForMarta(
    resultPrompt, 1, process.env.CHATGPT_MODEL, ctx.scene.session.messageHistory, true
  );
  ctx.scene.session.messageHistory = resultResponse.updatedHistory;
  for (const part of chunk(resultResponse.reply, 4096)) {
    await ctx.telegram.sendMessage(ctx.chat.id, part);
  }
  
  // --- PRESENTAZIONE PROVA SUCCESSIVA O FINALE ---
  if (currentTrial < 3) {
    const trialNameMap = { 2: "la seconda prova", 3: "la terza e ultima prova" };
    const trialPrompt = generateTrial(ctx.scene.session.MARTA_EPISODE_PROMPT, trialNameMap[currentTrial + 1], 0, 0); // Placeholder, la difficoltà vera è calcolata sopra
    
    const trialResponse = await promptForMarta(
      trialPrompt, 1, process.env.CHATGPT_MODEL, ctx.scene.session.messageHistory
    );
    ctx.scene.session.messageHistory = trialResponse.updatedHistory;
    for (const part of chunk(trialResponse.reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    
    await ctx.reply("Cosa vuoi fare? Descrivi la tua azione.");

  } else {
    console.log("[Marta Scene] Passaggio al finale.");
    const finalePrompt = generateEpisodeFinale(ctx.scene.session.MARTA_EPISODE_PROMPT, ctx.scene.session.overallSuccess);
    const finaleResponse = await promptForMarta(
      finalePrompt, 1, process.env.CHATGPT_MODEL, ctx.scene.session.messageHistory
    );
    
    for (const part of chunk(finaleResponse.reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    
    await ctx.reply("L'avventura di Marta si conclude qui. Grazie per aver giocato!");
    ctx.session.adventureLock = false;
    return ctx.scene.leave();
  }
});
