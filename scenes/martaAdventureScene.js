import { Markup } from "telegraf";
import { BaseScene } from "telegraf/scenes";
import { getMartaEpisodePrompt, setMartaEpisodePrompt } from "../cache.js";
import {
  generateEpisodeFinale,
  generateEpisodeFormat,
  generateIntroducktion,
  generateOutcome,
  generateNextTrialPrompt,
} from "../prompts.js";
import { promptForMarta } from "../chatgpt.js";
import { abstractDice, chunk } from "../utils.js";
import { client as mongoClient, writeToCollection } from "../mongoDB.js";
import { getCharacter } from "../game/characters.js";

function generateDiceRollPrompt(diceRoll, trialDifficulty, suggestedAction) {
  return `L'utente, impersonando il suo personaggio, ha suggerito di '${suggestedAction}' e ha ottenuto ${diceRoll} su un tiro con difficoltà ${trialDifficulty}. Descrivi cosa succede, mantenendo la narrazione focalizzata sul party.`;
}

export const martaAdventureScene = new BaseScene("martaAdventureScene");

martaAdventureScene.command("resetAdventure", async (ctx) => {
  console.log("[Marta Scene] Ricevuto comando /resetAdventure. Uscita forzata.");
  const db = mongoClient.db("marta_game");
  const usersCollection = db.collection("users");
  await usersCollection.updateOne({ _id: ctx.from.id }, { $set: { adventureLock: false } });
  await ctx.reply("La tua avventura è stata resettata e il tuo lock rimosso.");
  return ctx.scene.leave();
});

martaAdventureScene.command(["enterDungeon", "start", "help"], async (ctx) => {
  console.log(`[Marta Scene] Ricevuto comando '${ctx.message.text}' durante l'avventura.`);
  await ctx.reply("Sei già nel mezzo di un'avventura! Descrivi la tua prossima azione oppure usa il comando /resetAdventure per terminarla e ricominciare.");
});

martaAdventureScene.enter(async (ctx) => {
  console.log("[Marta Scene] Entrato nella scena.");
  try {
    let character = ctx.scene.state.character || { name: "un eroe senza nome" };
    
    if (character._id) {
      const fullCharacter = await getCharacter(character._id);
      if (fullCharacter) {
        character = fullCharacter;
        console.log(`[Marta Scene] Caricato personaggio completo dal DB: ${character.name}`);
      }
    }

    character.xp = character.xp || 0;
    character.inventory = character.inventory || [];

    ctx.scene.session.character = character;
    console.log(`[Marta Scene] Personaggio del giocatore: ${character.name}, XP: ${character.xp}, Inventory: ${character.inventory.length} items`);

    ctx.scene.session.dungeonData = 0;
    ctx.scene.session.overallSuccess = 0;
    ctx.scene.session.totalTrials = abstractDice(3, 5);
    ctx.scene.session.currentMetadata = {};
    console.log(`[Marta Scene] Numero totale di prove per questa avventura: ${ctx.scene.session.totalTrials}`);
    
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
      jsonOutputInstructions,
      {
        role: "system",
        content: `Sei un Dungeon Master di una campagna di D&D. Il party di avventurieri è guidato da 'Marta la papera col cappello da strega'. L'utente a cui stai scrivendo impersona un altro membro del party, il suo personaggio giocante (PG) di nome '${character.name}'. Quando l'utente suggerisce un'azione, narra sempre il suo personaggio (il PG) che compie quell'azione. Quando narri in generale, descrivi le azioni di Marta, ma rivolgiti sempre all'utente chiedendogli cosa fa il suo personaggio. Esempio: 'Marta sguaina la spada. Tu, ${character.name}, cosa fai?'. Non dire mai 'Cosa fai, Marta?'. Mantieni la coerenza narrativa tra le prove, basandoci sulle conseguenze delle azioni precedenti.`,
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

    const richiestaPayload = generateIntroducktion(MARTA_EPISODE_PROMPT, character, ctx.scene.session.currentMetadata);

    const { reply, metadata, updatedHistory } = await promptForMarta(
      richiestaPayload, 1, process.env.CHATGPT_MODEL, ctx.scene.session.messageHistory, character, false
    );
    ctx.scene.session.messageHistory = updatedHistory;
    ctx.scene.session.currentMetadata = metadata;
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    
  } catch (error) {
    console.error("[Marta Scene] Errore critico all'ingresso nella scena:", error);
    const db = mongoClient.db("marta_game");
    const usersCollection = db.collection("users");
    await usersCollection.updateOne({ _id: ctx.from.id }, { $set: { adventureLock: false } });
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

  let finalReply = "";
  let updatedHistory = ctx.scene.session.messageHistory;
  let currentLoot = [];
  let currentXpPoints = 0;

  const outcomePayload = generateOutcome(
    ctx.scene.session.MARTA_EPISODE_PROMPT,
    ctx.scene.session.character,
    diceRoll,
    trialDifficulty,
    suggestedAction,
    isSuccess,
    ctx.scene.session.currentMetadata
  );

  const { reply: outcomeReply, metadata: outcomeMetadata, loot: outcomeLoot, xp_points: outcomeXp, updatedHistory: outcomeUpdatedHistory } = await promptForMarta(
    outcomePayload, 1, process.env.CHATGPT_MODEL, updatedHistory, ctx.scene.session.character, false
  );
  finalReply += outcomeReply;
  updatedHistory = outcomeUpdatedHistory;
  ctx.scene.session.currentMetadata = outcomeMetadata;
  currentLoot = currentLoot.concat(outcomeLoot || []);
  currentXpPoints += outcomeXp || 0;

  if (currentTrial < ctx.scene.session.totalTrials) {
    const nextTrialPayload = generateNextTrialPrompt(
      ctx.scene.session.MARTA_EPISODE_PROMPT,
      ctx.scene.session.character,
      currentTrial,
      ctx.scene.session.totalTrials,
      ctx.scene.session.currentMetadata
    );

    const { reply: nextTrialReply, metadata: nextTrialMetadata, loot: nextTrialLoot, xp_points: nextTrialXp, updatedHistory: nextTrialUpdatedHistory } = await promptForMarta(
      nextTrialPayload, 1, process.env.CHATGPT_MODEL, updatedHistory, ctx.scene.session.character, false
    );
    finalReply += "\n\n" + nextTrialReply;
    updatedHistory = nextTrialUpdatedHistory;
    ctx.scene.session.currentMetadata = nextTrialMetadata;
    currentLoot = currentLoot.concat(nextTrialLoot || []);
    currentXpPoints += nextTrialXp || 0;
  } else {
    const finalePayload = generateEpisodeFinale(
      ctx.scene.session.MARTA_EPISODE_PROMPT,
      ctx.scene.session.overallSuccess,
      ctx.scene.session.totalTrials,
      ctx.scene.session.currentMetadata
    );

    const { reply: finaleReply, metadata: finaleMetadata, loot: finaleLoot, xp_points: finaleXp, updatedHistory: finaleUpdatedHistory } = await promptForMarta(
      finalePayload, 1, process.env.CHATGPT_MODEL, updatedHistory, ctx.scene.session.character, false
    );
    finalReply += "\n\n" + finaleReply;
    updatedHistory = finaleUpdatedHistory;
    ctx.scene.session.currentMetadata = finaleMetadata;
    currentLoot = currentLoot.concat(finaleLoot || []);
    currentXpPoints += finaleXp || 0;
  }

  if (ctx.scene.session.character && (currentXpPoints > 0 || currentLoot.length > 0)) {
    ctx.scene.session.character.xp = (ctx.scene.session.character.xp || 0) + currentXpPoints;
    ctx.scene.session.character.inventory = (ctx.scene.session.character.inventory || []).concat(currentLoot);
    
    await writeToCollection("characters", ctx.scene.session.character);
    console.log(`[Marta Scene] Personaggio ${ctx.scene.session.character.name} aggiornato nel DB. +${currentXpPoints} XP, +${currentLoot.length} items.`);
  }

  ctx.scene.session.messageHistory = updatedHistory;
  for (const part of chunk(finalReply, 4096)) {
    await ctx.telegram.sendMessage(ctx.chat.id, part);
  }
  
  if (currentTrial >= ctx.scene.session.totalTrials) {
    await ctx.reply("L'avventura si conclude qui. Grazie per aver giocato!");
    
    const db = mongoClient.db("marta_game");
    const usersCollection = db.collection("users");
    await usersCollection.updateOne({ _id: ctx.from.id }, { $set: { adventureLock: false } });
    console.log(`[Marta Scene] Lock rilasciato per l'utente ${ctx.from.id}`);

    return ctx.scene.leave();
  }
});
