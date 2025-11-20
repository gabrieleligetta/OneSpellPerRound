import { setMartaEpisodePrompt } from "./cache.js";
import { generateCompleteEpisode } from "./openai.js";

export const generateIntroducktion = (MARTA_EPISODE_PROMPT, character, currentMetadata = {}) => {
  const charName = character?.name || "l'eroe";
  const instructions = `Sei un Dungeon Master di una campagna di D&D. Utilizzando le informazioni fornite nel 'context', descrivi la scena iniziale dell'avventura in massimo 150 parole, impersonando il game Master. La tua risposta deve essere un oggetto JSON con le chiavi 'message', 'metadata', 'loot' (array, opzionale) e 'xp_points' (numero, opzionale). 'message' deve contenere la narrazione. 'metadata' deve contenere un oggetto con lo stato iniziale del party o dell'ambiente. 'loot' e 'xp_points' saranno vuoti o 0 per l'introduzione.`;
  
  return {
    type: "introduction",
    instructions: instructions,
    context: {
      characterName: charName,
      partyLeader: "Marta la papera col cappello da strega",
      supportCharacters: MARTA_EPISODE_PROMPT?.supportCharacters || [],
      initialEvent: MARTA_EPISODE_PROMPT?.initialEvent || "",
      enemy: MARTA_EPISODE_PROMPT?.enemy || "",
      boss: MARTA_EPISODE_PROMPT?.boss || "",
      enemyPlace: MARTA_EPISODE_PROMPT?.enemyPlace || "",
      currentMetadata: currentMetadata
    }
  };
};

export const generateOutcome = (
  MARTA_EPISODE_PROMPT,
  character,
  diceRoll,
  trialDifficulty,
  suggestedAction,
  isSuccess,
  currentMetadata = {}
) => {
  const charName = character?.name || "l'eroe";
  const instructions = `Sei un Dungeon Master esperto e coinvolgente. Utilizzando le informazioni fornite nel 'context', descrivi UNICAMENTE le conseguenze IMMEDIATE dell'azione del personaggio del giocatore e del suo esito in massimo 150 parole. Integra la narrazione con la situazione attuale del party di Marta. Assicurati che la narrazione si concentri sull'azione del personaggio del giocatore. NON introdurre la prossima sfida, NON fare domande all'utente, e NON suggerire azioni future. La tua risposta deve essere un oggetto JSON con le chiavi 'message', 'metadata', 'loot' (array, opzionale) e 'xp_points' (numero, opzionale). 'message' deve contenere la narrazione conclusiva dell'esito. 'metadata' deve riflettere eventuali cambiamenti nello stato del party o dell'ambiente. 'loot' e 'xp_points' devono essere generati in base al successo/fallimento della prova.`;
  
  return {
    type: "outcome",
    instructions: instructions,
    context: {
      characterName: charName,
      diceRoll: diceRoll,
      trialDifficulty: trialDifficulty,
      suggestedAction: suggestedAction,
      isSuccess: isSuccess,
      partyLeader: "Marta la papera col cappello da strega",
      enemy: MARTA_EPISODE_PROMPT?.enemy || "",
      boss: MARTA_EPISODE_PROMPT?.boss || "",
      enemyPlace: MARTA_EPISODE_PROMPT?.enemyPlace || "",
      currentMetadata: currentMetadata
    }
  };
};

export const generateNextTrialPrompt = (
  MARTA_EPISODE_PROMPT,
  character,
  currentTrial,
  totalTrials,
  currentMetadata = {}
) => {
  const charName = character?.name || "l'eroe";
  const nextTrialStage = currentTrial === 1 ? "la seconda prova" : "la prossima prova";
  const instructions = `Sei un Dungeon Master esperto e coinvolgente. Utilizzando le informazioni fornite nel 'context', fai emergere la prossima sfida direttamente dalla situazione attuale e dalle conseguenze appena descritte. La sfida deve essere coerente con l'episodio. Descrivi la nuova sfida in massimo 150 parole. La tua risposta deve essere un oggetto JSON con le chiavi 'message', 'metadata', 'loot' (array, opzionale) e 'xp_points' (numero, opzionale). 'message' deve contenere la narrazione della nuova sfida. 'metadata' deve riflettere il contesto della nuova sfida. 'loot' e 'xp_points' saranno vuoti o 0 per la descrizione della prossima prova.`; // Rimosso: DEVI concludere il messaggio chiedendo all'utente: "Tu, ${charName}, cosa fai?".
  
  return {
    type: "next_trial",
    instructions: instructions,
    context: {
      characterName: charName,
      currentTrial: currentTrial,
      totalTrials: totalTrials,
      nextTrialStage: nextTrialStage,
      partyLeader: "Marta la papera col cappello da strega",
      enemy: MARTA_EPISODE_PROMPT?.enemy || "",
      boss: MARTA_EPISODE_PROMPT?.boss || "",
      enemyPlace: MARTA_EPISODE_PROMPT?.enemyPlace || "",
      currentMetadata: currentMetadata
    }
  };
};


export const generateEpisodeFinale = (MARTA_EPISODE_PROMPT, overallSuccess, totalTrials, currentMetadata = {}) => {
  const successRatio = overallSuccess / totalTrials;
  let outcomeDescription = "";

  if (successRatio === 1) {
    outcomeDescription = "I nostri eroi hanno trionfato, sconfiggendo il nemico in modo spettacolare.";
  } else if (successRatio >= 0.66) {
    outcomeDescription = "Il nemico è stato sconfitto per un soffio, dopo una battaglia estenuante e non senza perdite.";
  } else if (successRatio >= 0.33) {
    outcomeDescription = "Nonostante i loro sforzi, il nemico non è stato sconfitto, ma c'è ancora speranza per il futuro.";
  } else {
    outcomeDescription = "Il nemico ha trionfato. I nostri eroi sono sconfitti e feriti, e un'ombra cala sul mondo.";
  }

  const instructions = `Sei un Dungeon Master di una campagna di D&D. Utilizzando le informazioni fornite nel 'context', descrivi il finale dell'avventura per il party di Marta in massimo 150 parole. La tua descrizione del finale deve essere ASSOLUTAMENTE conclusiva. NON fare domande all'utente, NON suggerire azioni future, e NON lasciare spiragli narrativi aperti. L'avventura è terminata. La tua risposta deve essere un oggetto JSON con le chiavi 'message', 'metadata', 'loot' (array, opzionale) e 'xp_points' (numero, opzionale). 'message' deve contenere la narrazione conclusiva del finale. 'metadata' deve riassumere lo stato finale dell'avventura. 'loot' e 'xp_points' devono rappresentare le ricompense finali dell'avventura.`;

  return {
    type: "finale",
    instructions: instructions,
    context: {
      overallSuccess: overallSuccess,
      totalTrials: totalTrials,
      successRatio: successRatio,
      outcomeDescription: outcomeDescription,
      partyLeader: "Marta la papera col cappello da strega",
      enemy: MARTA_EPISODE_PROMPT?.enemy || "",
      boss: MARTA_EPISODE_PROMPT?.boss || "",
      enemyPlace: MARTA_EPISODE_PROMPT?.enemyPlace || "",
      currentMetadata: currentMetadata
    }
  };
};

export const generateEpisodeFormat = async (character) => { // Aggiunto 'character' come parametro
  console.log("[generateEpisodeFormat] Avvio generazione episodio con una sola chiamata API...");
  const episodeData = await generateCompleteEpisode();
  
  // Costruisci la lista dei personaggi di supporto
  const partyMembers = ["Marta la papera col cappello da strega"];
  if (character && character.name) {
    partyMembers.push(character.name);
  }

  // Nessuna generazione di NPC aggiuntivi, il party è fisso (Marta + PG)
  
  const episode = {
    ...episodeData,
    episodeFormat: "autoconclusivo",
    supportCharacters: partyMembers, // Il party è solo Marta e il PG
  };

  await setMartaEpisodePrompt(episode);
  console.log("[generateEpisodeFormat] Episodio generato e salvato con successo.");
  return episode;
};
