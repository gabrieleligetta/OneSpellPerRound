import randomItem from "random-item";

import {
  getRandomAndRemove,
  getRandomElementsFromArray,
  Prompts,
  removeCharExceptFirstAndLast,
} from "./utils.js";

import { generalPrompt } from "./chatgpt.js";
import { setMartaEpisodePrompt } from "./cache.js";

export const generateIntroducktion = (MARTA_EPISODE_PROMPT) => {
  let prompt =
    "Rispondimi solo con l'inizio di un'avventura di Marta la papera con il cappello da strega, impersonando il game Master, utilizza al massimo 150 parole";
  if (!!MARTA_EPISODE_PROMPT) {
    if (MARTA_EPISODE_PROMPT?.supportCharacters) {
      prompt += ` gli amici di Marta saranno: ${MARTA_EPISODE_PROMPT.supportCharacters.join(
        ", "
      )}. `;
    }
    if (MARTA_EPISODE_PROMPT?.events) {
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
  prompt += ` la difficoltà della prova da superare sarà: ${
    difficulty + modifier
  }`;

  return prompt;
};

export const generateEpisodeFinale = (MARTA_EPISODE_PROMPT, overallSuccess) => {
  if (overallSuccess === 7) {
    return `Rispondimi solo con il finale di questa avventura in cui tutte le prove sono state superate e il nemico sconfitto, impersonando il game Master, utilizza al massimo 150 parole`;
  } else if (overallSuccess === 6 || overallSuccess === 5) {
    return `Rispondimi solo con il finale di questa avventura in cui il nemico è sconfitto, impersonando il game Master, utilizza al massimo 150 parole`;
  } else if (overallSuccess === 4) {
    return `Rispondimi solo con il finale di questa avventura in cui il nemico è sconfitto per un soffio, non senza molte difficoltà, impersonando il game Master, utilizza al massimo 150 parole`;
  } else if (overallSuccess === 3) {
    return `Rispondimi solo con il finale di questa avventura in cui le prove sono state superate ma il nemico non è stato sconfitto, ma c'è speranza in una prossima avventura, impersonando il game Master, utilizza al massimo 150 parole`;
  } else if (overallSuccess === 2 || overallSuccess === 1) {
    return `Rispondimi solo con il finale di questa avventura il nemico non è stato sconfitto,ma c'è ancora un barlume di speranza anche se i nostri eroi sono sconfitti e feriti, impersonando il game Master, utilizza al massimo 150 parole`;
  } else if (overallSuccess === 0) {
    return `Rispondimi solo con il finale di questa avventura il nemico non è stato sconfitto,e non c'è modo di sconfiggerlo, i nostri eroi sono sconfitti e feriti, impersonando il game Master, utilizza al massimo 150 parole`;
  }
};

export const generateEpisodeFormat = async () => {
  const loreArray = ["Dungeons and Dragons"];
  const lore = randomItem(loreArray);
  const boss = randomItem(
    await generateArrayOf("Antagonisti con grande potere o divinità", lore)
  );
  const enemy = randomItem(
    await generateArrayOf(
      `Antagonisti tirapiedi o subordinati di ${boss}`,
      lore
    )
  );
  const startPlace = randomItem(
    await generateArrayOf("Luoghi", "fantasy, atmosfera magica")
  );
  const enemyPlace = randomItem(
    await generateArrayOf("Luoghi", `rifugio di ${enemy}, atmosfera cupa`)
  );
  const events = await generateArrayOf(
    "Eventi",
    `causati da ${enemy} nel luogo ${startPlace}`
  );
  const initialEvent = getRandomAndRemove(events);
  const episode = {
    episodeFormat: randomItem(["autoconclusivo"]),
    enemy: enemy,
    boss: boss,
    supportCharacters: getRandomElementsFromArray(
      await generateArrayOf(
        "Animaletti del bosco con nome, soprannome e aggettivo",
        "Amici di Marta la Papera col cappello da Strega, esempio: 'Lucia la gatta ballerina'"
      ),
      Math.floor(Math.random() * 4)
    ),
    events: events,
    initialEvent: initialEvent,
    startPlace: startPlace,
    enemyPlace: enemyPlace,
    trialsOfHeroes: await generateArrayOf(
      "Sfide da eroi",
      `causati da ${enemy} nel luogo ${enemyPlace}`
    ),
  };
  setMartaEpisodePrompt(episode);
  return episode;
};

const generateArrayOf = async (narrationElement, lore) => {
  let stringBetweenHashes = null;
  let textArray = [];
  while (!stringBetweenHashes || textArray.length < 4) {
    const promptText = `conosci 10 ${narrationElement} di massimo 6 parole selezionato dal mondo ${lore}? Ritornali separati da virgola senza altro testo in una frase racchiusa tra due #`;
    let messageWithArray = await generalPrompt(
      { text: promptText, temperature: 0.7 },
      Prompts.EpisodePromptValues
    );
    const result = messageWithArray.split("#").length - 1;
    console.log("messageWithArray");
    console.log(messageWithArray);
    if (result > 2) {
      messageWithArray = removeCharExceptFirstAndLast(messageWithArray, "#");
    }
    stringBetweenHashes = getStringBetweenHashes(messageWithArray);
    console.log("stringBetweenHashes");
    console.log(stringBetweenHashes);
    if (!!stringBetweenHashes) {
      textArray = stringBetweenHashes
        .split(",")
        .map((element) =>
          element.replaceAll("[^a-zA-Z0-9]", "").replaceAll(`\n`, "")
        );
      console.log("textArray");
      console.log(textArray);
    }
  }
  return textArray;
};

const getStringBetweenHashes = (input) =>
  (input.match(/#(.*?)#/) || [])[1] || null;
