import randomItem from "random-item";
import { getRandomAndRemove } from "./utils.js";
import { setMartaEpisodePrompt } from "./cache.js";
import { generateCompleteEpisode } from "./openai.js"; // Importa la nuova funzione efficiente

export const generateIntroducktion = (MARTA_EPISODE_PROMPT) => {
  let prompt =
    "Rispondimi solo con l'inizio di un'avventura di Marta la papera con il cappello da strega, impersonando il game Master, utilizza al massimo 150 parole";
  if (!!MARTA_EPISODE_PROMPT) {
    if (MARTA_EPISODE_PROMPT?.supportCharacters) {
      prompt += ` gli amici di Marta saranno: ${MARTA_EPISODE_PROMPT.supportCharacters.join(
        ", "
      )}. `;
    }
    if (MARTA_EPISODE_PROMPT?.initialEvent) {
      prompt += ` l'evento iniziale sarà: ${MARTA_EPISODE_PROMPT.initialEvent} causato da ${MARTA_EPISODE_PROMPT.enemy} servitore di ${MARTA_EPISODE_PROMPT.boss}. `;
    }
    if (MARTA_EPISODE_PROMPT?.enemyPlace) {
      prompt += ` il luogo in cui si trova il nemico sarà: ${MARTA_EPISODE_PROMPT.enemyPlace}. `;
    }
  }

  return prompt;
};

export const generateTrial = (
  MARTA_EPISODE_PROMPT,
  trialStage,
  difficulty,
  modifier
) => {
  let prompt = `Rispondimi solo con ${trialStage} di questa avventura di Marta la papera con il cappello da strega, impersonando il game Master, utilizza al massimo 150 parole e non descrivere di come la prova viene superata`;
  if (!!MARTA_EPISODE_PROMPT && trialStage === "la prima prova") {
    if (MARTA_EPISODE_PROMPT?.trialsOfHeroes) {
      prompt += ` la sfida da superare sarà: ${randomItem(
        MARTA_EPISODE_PROMPT.trialsOfHeroes
      )}`;
    }
  }
  if (!!MARTA_EPISODE_PROMPT && trialStage === "la terza e ultima prova") {
    if (MARTA_EPISODE_PROMPT?.events) {
      prompt += ` risolvere l'evento iniziale: ${MARTA_EPISODE_PROMPT.initialEvent} causato da ${MARTA_EPISODE_PROMPT.boss} per sconfiggere ${MARTA_EPISODE_PROMPT.enemy}. nel luogo ${MARTA_EPISODE_PROMPT.enemyPlace}`;
    }
  }
  // La difficoltà non viene più aggiunta al prompt, è gestita internamente
  // prompt += ` la difficoltà della prova da superare sarà: ${
  //   difficulty + modifier
  // }`;

  return prompt;
};

export const generateEpisodeFinale = (MARTA_EPISODE_PROMPT, overallSuccess) => {
  if (overallSuccess >= 5) { // Semplificato
    return `Rispondimi solo con il finale di questa avventura in cui il nemico è sconfitto e i nostri eroi trionfano, impersonando il game Master, utilizza al massimo 150 parole`;
  } else if (overallSuccess >= 3) {
    return `Rispondimi solo con il finale di questa avventura in cui il nemico è sconfitto per un soffio, non senza molte difficoltà, impersonando il game Master, utilizza al massimo 150 parole`;
  } else if (overallSuccess >= 1) {
    return `Rispondimi solo con il finale di questa avventura in cui le prove sono state superate ma il nemico non è stato sconfitto, ma c'è speranza in una prossima avventura, impersonando il game Master, utilizza al massimo 150 parole`;
  } else {
    return `Rispondimi solo con il finale di questa avventura in cui il nemico non è stato sconfitto e non c'è modo di sconfiggerlo, i nostri eroi sono sconfitti e feriti, impersonando il game Master, utilizza al massimo 150 parole`;
  }
};

// --- NUOVA FUNZIONE EFFICIENTE ---
export const generateEpisodeFormat = async () => {
  console.log("[generateEpisodeFormat] Avvio generazione episodio con una sola chiamata API...");
  
  // 1. Chiama la nuova funzione che restituisce l'intero oggetto JSON
  const episodeData = await generateCompleteEpisode();

  // 2. Esegue la logica rimanente in JavaScript (molto più veloce)
  const initialEvent = getRandomAndRemove(episodeData.events);
  
  const episode = {
    ...episodeData,
    episodeFormat: "autoconclusivo", // Aggiunto staticamente
    initialEvent: initialEvent,
  };

  // 3. Salva l'episodio completo nella cache persistente
  await setMartaEpisodePrompt(episode);
  
  console.log("[generateEpisodeFormat] Episodio generato e salvato con successo.");
  return episode;
};
