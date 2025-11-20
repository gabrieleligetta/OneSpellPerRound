import { Markup } from "telegraf";
import { BaseScene } from "telegraf/scenes";
import { getMartaEpisodePrompt, setMartaEpisodePrompt } from "../cache.js";
import {
  generateEpisodeFinale,
  generateEpisodeFormat,
  generateIntroducktion,
  generateOutcome, // Importa la nuova funzione generateOutcome
  generateNextTrialPrompt, // Importa la nuova funzione generateNextTrialPrompt
} from "../prompts.js";
import { promptForMarta } from "../chatgpt.js";
import { abstractDice, chunk } from "../utils.js";
import { writeToCollection } from "../mongoDB.js"; // Importa le funzioni DB
import { getCharacter } from "../game/characters.js"; // Importa getCharacter

// generateDiceRollPrompt non è più usata direttamente per generare il prompt per OpenAI
// ma i suoi elementi sono usati nella nuova funzione combinata.
function generateDiceRollPrompt(diceRoll, trialDifficulty, suggestedAction) {
  return `L'utente, impersonando il suo personaggio, ha suggerito di '${suggestedAction}' e ha ottenuto ${diceRoll} su un tiro con difficoltà ${trialDifficulty}. Descrivi cosa succede, mantenendo la narrazione focalizzata sul party.`;
}

export const martaAdventureScene = new BaseScene("martaAdventureScene");

// --- GESTORI DI COMANDI INTERNI ALLA SCENA ---
martaAdventureScene.command("resetAdventure", async (ctx) => { // Rinominato
  console.log("[Marta Scene] Ricevuto comando /resetAdventure. Uscita forzata.");
  await ctx.reply("La tua avventura è stata resettata.");
  ctx.session.adventureLock = false;
  return ctx.scene.leave();
});

martaAdventureScene.command(["enterDungeon", "start", "help"], async (ctx) => {
  console.log(`[Marta Scene] Ricevuto comando '${ctx.message.text}' durante l'avventura.`);
  await ctx.reply("Sei già nel mezzo di un'avventura! Descrivi la tua prossima azione oppure usa il comando /resetAdventure per terminarla e ricominciare."); // Rinominato
});

// --- FLUSSO PRINCIPALE DELLA SCENA ---

martaAdventureScene.enter(async (ctx) => {
  console.log("[Marta Scene] Entrato nella scena.");
  try {
    let character = ctx.scene.state.character || { name: "un eroe senza nome" };
    
    // Carica il personaggio completo dal DB usando getCharacter
    if (character._id) {
      const fullCharacter = await getCharacter(character._id);
      if (fullCharacter) {
        character = fullCharacter;
        console.log(`[Marta Scene] Caricato personaggio completo dal DB: ${character.name}`);
      }
    }

    // Inizializza XP e inventory se non presenti
    character.xp = character.xp || 0;
    character.inventory = character.inventory || [];

    ctx.scene.session.character = character;
    console.log(`[Marta Scene] Personaggio del giocatore: ${character.name}, XP: ${character.xp}, Inventory: ${character.inventory.length} items`);

    ctx.scene.session.dungeonData = 0;
    ctx.scene.session.overallSuccess = 0;
    ctx.scene.session.totalTrials = abstractDice(3, 5);
    ctx.scene.session.currentMetadata = {}; // Inizializza currentMetadata
    console.log(`[Marta Scene] Numero totale di prove per questa avventura: ${ctx.scene.session.totalTrials}`);
    
    // Istruzioni per l'AI su come formattare l'output JSON con i nuovi campi
    const jsonOutputInstructions = {
      role: "system",
      content: `Rispondi UNICAMENTE con un oggetto JSON. L'oggetto JSON deve avere le seguenti chiavi:
- 'message' (stringa): Il testo narrativo principale da visualizzare all'utente.
- 'metadata' (oggetto): Un oggetto JSON contenente informazioni rilevanti per arricchire i prompt successivi (es. stato del party, dettagli ambientali aggiornati, eventi in corso). Se non ci sono metadati specifici da aggiornare, restituisci un oggetto vuoto {}.
- 'loot' (array di stringhe, opzionale): Un array di stringhe, dove ogni stringa è un oggetto o una ricompensa ottenuta. Se non c'è loot, ometti la chiave 'loot' o restituisci un array vuoto [].
- 'xp_points' (numero, opzionale): I punti esperienza guadagnati dall'evento. Se non ci sono XP, ometti la chiave 'xp_points' o restituisci 0.

NON includere testo aggiuntivo al di fuori dell'oggetto JSON. Se ti viene chiesto di fare una domanda, includila all'interno del campo 'message'.`,
    };

    ctx.scene.session.messageHistory = [
      jsonOutputInstructions, // Aggiungi le istruzioni JSON all'inizio
      {
        role: "system",
        content: `Sei un Dungeon Master di una campagna di D&D. Il party di avventurieri è guidato da 'Marta la papera col cappello da strega'. L'utente a cui stai scrivendo impersona un altro membro del party, il suo personaggio giocante (PG) di nome '${character.name}'. Quando l'utente suggerisce un'azione, narra sempre il suo personaggio (il PG) che compie quell'azione. Quando narri in generale, descrivi le azioni di Marta, ma rivolgiti sempre all'utente chiedendogli cosa fa il suo personaggio. Esempio: 'Marta sguaina la spada. Tu, ${character.name}, cosa fai?'. Non dire mai 'Cosa fai, Marta?'. Mantieni la coerenza narrativa tra le prove, basandoti sulle conseguenze delle azioni precedenti.`,
      }
    ];

    console.log("[Marta Scene] Caricamento episodio...");
    let MARTA_EPISODE_PROMPT = await getMartaEpisodePrompt();
    if (!MARTA_EPISODE_PROMPT) {
      console.warn("[Marta Scene] Nessun episodio pre-generato trovato. Lo genero al volo.");
      MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
      await setMartaEpisodePrompt(MARTA_EPISODE_PROMPT);
    }
    ctx.scene.session.MARTA_EPISODE_PROMPT = MARTA_EPISODE_PROMPT;
    console.log("[Marta Scene] Episodio caricato.");

    const richiestaPayload = generateIntroducktion(MARTA_EPISODE_PROMPT, character, ctx.scene.session.currentMetadata); // Passa currentMetadata

    const { reply, metadata, updatedHistory } = await promptForMarta(
      richiestaPayload, 1, process.env.CHATGPT_MODEL, ctx.scene.session.messageHistory, character, true // Introduzione dovrebbe chiedere cosa fare
    );
    ctx.scene.session.messageHistory = updatedHistory;
    ctx.scene.session.currentMetadata = metadata; // Aggiorna currentMetadata
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    
  } catch (error) {
    console.error("[Marta Scene] Errore critico all'ingresso nella scena:", error);
    ctx.session.adventureLock = false;
    await ctx.reply("C'è stato un problema nella creazione dell'avventura. Riprova.");
    return ctx.scene.leave();
  }
});

martaAdventureScene.on("text", async (ctx) => {
  ctx.scene.session.suggestedAction = ctx.message.text;
  await ctx.reply(
    "Ottima idea! Ora tira il dado per determinare il successo della tua azione.",
    Markup.inlineKeyboard([
      Markup.button.callback("Tira Il Dado!", "rollDiceInScene"),
    ])
  );
});

martaAdventureScene.action("rollDiceInScene", async (ctx) => {
  await ctx.answerCbQuery("Hai tirato il dado!");
  
  const suggestedAction = ctx.scene.session.suggestedAction;
  if (!suggestedAction) return ctx.reply("Dovresti prima suggerire un'azione!");

  const currentTrial = (ctx.scene.session.dungeonData || 0) + 1;
  ctx.scene.session.dungeonData = currentTrial;
  console.log(`[Marta Scene] Esecuzione prova numero: ${currentTrial}`);

  const difficultyMap = { 1: 5, 2: 11, 3: 11 };
  const baseDifficulty = abstractDice(currentTrial === 1 ? 0 : (currentTrial === 2 ? 5 : 8), difficultyMap[currentTrial]);
  const trialDifficulty = baseDifficulty + currentTrial;
  console.log(`[Marta Scene] Difficoltà calcolata: ${trialDifficulty}`);

  const diceRoll = abstractDice(1, 20);
  await ctx.reply(`Hai rollato: ${diceRoll}`);
  
  console.log(`[Marta Scene] CONFRONTO: Tiro: ${diceRoll}, Difficoltà: ${trialDifficulty}`);
  const isSuccess = parseInt(diceRoll, 10) >= parseInt(trialDifficulty, 10);
  
  if (isSuccess) ctx.scene.session.overallSuccess++;
  console.log(`[Marta Scene] Prova ${isSuccess ? "superata" : "fallita"}. Successi totali: ${ctx.scene.session.overallSuccess}`);

  // --- NUOVA LOGICA COMBINATA ---
  let finalReply = "";
  let updatedHistory = ctx.scene.session.messageHistory;
  let currentLoot = [];
  let currentXpPoints = 0;

  // Genera l'esito dell'azione corrente
  const outcomePayload = generateOutcome(
    ctx.scene.session.MARTA_EPISODE_PROMPT,
    ctx.scene.session.character,
    diceRoll,
    trialDifficulty,
    suggestedAction,
    isSuccess,
    ctx.scene.session.currentMetadata // Passa currentMetadata
  );

  const { reply: outcomeReply, metadata: outcomeMetadata, loot: outcomeLoot, xp_points: outcomeXp, updatedHistory: outcomeUpdatedHistory } = await promptForMarta(
    outcomePayload, 1, process.env.CHATGPT_MODEL, updatedHistory, ctx.scene.session.character, false // Non forzare la domanda qui
  );
  finalReply += outcomeReply;
  updatedHistory = outcomeUpdatedHistory;
  ctx.scene.session.currentMetadata = outcomeMetadata; // Aggiorna currentMetadata
  currentLoot = currentLoot.concat(outcomeLoot);
  currentXpPoints += outcomeXp;

  if (currentTrial < ctx.scene.session.totalTrials) {
    // Genera il payload per la prossima prova
    const nextTrialPayload = generateNextTrialPrompt(
      ctx.scene.session.MARTA_EPISODE_PROMPT,
      ctx.scene.session.character,
      currentTrial,
      ctx.scene.session.totalTrials,
      ctx.scene.session.currentMetadata // Passa currentMetadata
    );

    const { reply: nextTrialReply, metadata: nextTrialMetadata, loot: nextTrialLoot, xp_points: nextTrialXp, updatedHistory: nextTrialUpdatedHistory } = await promptForMarta(
      nextTrialPayload, 1, process.env.CHATGPT_MODEL, updatedHistory, ctx.scene.session.character, true // Forzare la domanda qui
    );
    finalReply += "\n\n" + nextTrialReply; // Aggiungi un separatore per chiarezza
    updatedHistory = nextTrialUpdatedHistory;
    ctx.scene.session.currentMetadata = nextTrialMetadata; // Aggiorna currentMetadata
    currentLoot = currentLoot.concat(nextTrialLoot);
    currentXpPoints += nextTrialXp;
  } else {
    // Genera il payload per il finale dell'episodio
    const finalePayload = generateEpisodeFinale(
      ctx.scene.session.MARTA_EPISODE_PROMPT,
      ctx.scene.session.overallSuccess,
      ctx.scene.session.totalTrials,
      ctx.scene.session.currentMetadata // Passa currentMetadata
    );

    const { reply: finaleReply, metadata: finaleMetadata, loot: finaleLoot, xp_points: finaleXp, updatedHistory: finaleUpdatedHistory } = await promptForMarta(
      finalePayload, 1, process.env.CHATGPT_MODEL, updatedHistory, ctx.scene.session.character, false // Non forzare la domanda nel finale
    );
    finalReply += "\n\n" + finaleReply; // Aggiungi un separatore per chiarezza
    updatedHistory = finaleUpdatedHistory;
    ctx.scene.session.currentMetadata = finaleMetadata; // Aggiorna currentMetadata
    currentLoot = currentLoot.concat(finaleLoot);
    currentXpPoints += finaleXp;

    // --- SALVATAGGIO DATI PERSONAGGIO A FINE AVVENTURA ---
    if (ctx.scene.session.character) {
      ctx.scene.session.character.xp = (ctx.scene.session.character.xp || 0) + currentXpPoints;
      ctx.scene.session.character.inventory = (ctx.scene.session.character.inventory || []).concat(currentLoot);
      
      await writeToCollection("characters", ctx.scene.session.character);
      console.log(`[Marta Scene] Personaggio ${ctx.scene.session.character.name} aggiornato nel DB. XP: ${ctx.scene.session.character.xp}, Inventory: ${ctx.scene.session.character.inventory.length} items`);
    }
    // ---------------------------------------------------
  }

  ctx.scene.session.messageHistory = updatedHistory;
  for (const part of chunk(finalReply, 4096)) {
    await ctx.telegram.sendMessage(ctx.chat.id, part);
  }
  // -----------------------------
  
  if (currentTrial >= ctx.scene.session.totalTrials) {
    // Se è l'ultima prova, l'avventura finisce qui.
    await ctx.reply("L'avventura si conclude qui. Grazie per aver giocato!");
    ctx.session.adventureLock = false;
    return ctx.scene.leave();
  }
});
