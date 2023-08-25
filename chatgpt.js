const axios = require("axios");
const martaMessages = new Map();
const {
  Prompts,
  extractStringBetweenCharacters,
  getRandomElementsFromArray,
  removeCharExceptFirstAndLast,
  abstractDice,
  getRandomAndRemove,
} = require("./utils");
const randomItem = require("random-item");

async function prompt(richiesta, type = null, model = "gpt-3.5-turbo") {
  if (!richiesta.text) {
    richiesta.text =
      "Sei un comico affermato che ritorna freddure a tema fantasy";
  }
  const messages = [];
  if (type === Prompts.MartaLaPapera) {
    messages.push({
      role: "system",
      content:
        "Sei il Dungeon Master di una campagna di D&D dove la protagonista è 'Marta la papera col cappello da Strega', che racconta episodi della vita di Marta e i suoi amici che sono degli avventurieri e vagano per il mondo di Ethim, popolato da animali antropomorfi, mostri e creature magiche senzienti, in un atmosfera a metà bambinesca e a metà Lovecraftiana. Nel corso dell' avventura succedono 3 eventi che hanno una difficoltà da 5 a 15, per tutti e tre verrà lanciato un d20 per effettuare una prova, racconta dettagliatamente il modo in cui andranno gli eventi per Marta e i suoi amici, basandoti sul numero del dado 20, tenendo presente che se il numero del d20 non supera la difficoltà dell'evento la prova fallisce a discapito dei nostri eroi.",
    });
  } else if (type === Prompts.BattuteDnD) {
    messages.push({
      role: "system",
      content: "Sei un comico affermato che ritorna freddure a tema fantasy",
    });
  } else if (type === Prompts.EpisodePromptValues) {
    messages.push({
      role: "system",
      content:
        "Sei un l'assistente di uno sviluppatore che ha bisogno di risultati che tornano sempre alla stessa maniera," +
        " Ritornali separati da virgola senza altro testo in una frase racchiusa tra due #",
    });
  }
  messages.push({ role: "user", content: richiesta.text });
  const apiKey = process.env.CHATGPT_API_KEY;
  const data = {
    model: model,
    messages: messages,
    temperature: richiesta.temperature || 1,
  };
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      data,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (e) {
    console.log(e.response.status);
    console.log(e.response.statusText);
    console.log(e.response.data.error);
  }
}

async function promptForMarta(
  request,
  temperature = 1,
  model = "gpt-3.5-turbo",
  isFirstPassage,
  chatId,
  isIncipit = false
) {
  if (isFirstPassage === 0 && isIncipit) {
    martaMessages.set(chatId, [
      {
        role: "system",
        content:
          "Sei il Dungeon Master di una campagna di D&D dove la protagonista è 'Marta la papera col cappello da Strega', che racconta episodi della vita di Marta e i suoi amici che sono degli avventurieri e vagano per il mondo di Ethim, popolato da animali antropomorfi, mostri e creature magiche senzienti, in un'atmosfera fantasy.",
      },
    ]);
  }
  if (isFirstPassage !== 4 && !isIncipit) {
    martaMessages.set(chatId, [
      ...martaMessages.get(chatId),
      {
        role: "system",
        content:
          "è importante NON raccontare di come la prova viene superata, ma solo una descrizione della prova da superare",
      },
    ]);
  }
  martaMessages.set(chatId, [
    ...martaMessages.get(chatId),
    {
      role: "user",
      content: request,
    },
  ]);
  const apiKey = process.env.CHATGPT_API_KEY;
  const data = {
    model: model,
    messages: martaMessages.get(chatId),
    temperature: temperature || 1,
  };
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      data,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const botResponse = response.data.choices[0].message.content;
    martaMessages.set(chatId, [
      ...martaMessages.get(chatId),
      {
        role: "assistant",
        content: botResponse,
      },
    ]);
    if (isFirstPassage === 4 && !isIncipit) {
      martaMessages.set(chatId, []);
    }
    return botResponse;
  } catch (e) {
    console.log(e.response.status);
    console.log(e.response.statusText);
    console.log(e.response.data.error);
  }
}

const generateIntroducktion = (MARTA_EPISODE_PROMPT) => {
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

const generateTrial = (
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

const generateEpisodeFinale = (MARTA_EPISODE_PROMPT, overallSuccess) => {
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
const generateMartaPrompt = (MARTA_EPISODE_PROMPT) => {
  let prompt =
    "rispondimi solo con un episodio delle avventure di Marta, la papera con il cappello da strega, senza che sembri la risposta di un bot.";
  if (!!MARTA_EPISODE_PROMPT) {
    if (MARTA_EPISODE_PROMPT?.startPlace) {
      prompt += ` il luogo in cui inizia l'avventura sarà: ${MARTA_EPISODE_PROMPT.startPlace}, che si trova nel mondo di Ethim. `;
    }
    if (MARTA_EPISODE_PROMPT?.enemy) {
      prompt += ` il nemico sarà: ${MARTA_EPISODE_PROMPT.enemy} che è un sottoposto di ${MARTA_EPISODE_PROMPT.boss}. `;
    }
    if (MARTA_EPISODE_PROMPT?.supportCharacters) {
      prompt += ` gli amici di Marta saranno: ${MARTA_EPISODE_PROMPT.supportCharacters.join(
        ", "
      )}. `;
    }
    if (MARTA_EPISODE_PROMPT?.events) {
      prompt += ` l'evento iniziale sarà: ${randomItem(
        MARTA_EPISODE_PROMPT.events
      )} causata dal potere di ${MARTA_EPISODE_PROMPT.boss} o dal tirapiedi ${
        MARTA_EPISODE_PROMPT.enemy
      }. `;
    }
    if (MARTA_EPISODE_PROMPT?.enemyPlace) {
      prompt += ` il luogo del combattimento col nemico sarà: ${MARTA_EPISODE_PROMPT.enemyPlace}. `;
    }
    if (MARTA_EPISODE_PROMPT?.trialsOfHeroes) {
      prompt += ` la sfida da superare sarà: ${randomItem(
        MARTA_EPISODE_PROMPT.trialsOfHeroes
      )} con descrizione di come viene superata. `;
    }
    if (MARTA_EPISODE_PROMPT?.spells) {
      prompt += ` gli incantesimi utilizzati da marta e gli amici saranno: ${MARTA_EPISODE_PROMPT.spells.join(
        ", "
      )}. `;
    }
    if (MARTA_EPISODE_PROMPT?.spells) {
      prompt += ` gli incantesimi utilizzati da ${
        MARTA_EPISODE_PROMPT.enemy
      } saranno: ${MARTA_EPISODE_PROMPT.enemySpells.join(", ")}. `;
    }
    prompt +=
      "il racconto sarà e dettagliato," +
      " descriverà gli scontri e i modo in cui verrà superata la sfida in maniera approfondita, ci saranno dialoghi e riflessioni di Marta";
  }

  return prompt;
};

const generateNewMartaPrompt = (MARTA_EPISODE_PROMPT) => {
  let prompt =
    "Rispondimi solo con una breve introduzione e i tre tiri di dado degli eventi e un breve finale delle avventure di Marta, la papera con il cappello da strega, senza che sembri la risposta di un bot.";
  if (!!MARTA_EPISODE_PROMPT) {
    if (MARTA_EPISODE_PROMPT?.supportCharacters) {
      prompt += ` gli amici di Marta saranno: ${MARTA_EPISODE_PROMPT.supportCharacters.join(
        ", "
      )}. `;
    }
    if (MARTA_EPISODE_PROMPT?.events) {
      prompt += ` l'evento iniziale sarà: ${randomItem(
        MARTA_EPISODE_PROMPT.events
      )} causata dal potere di ${MARTA_EPISODE_PROMPT.boss} o dal tirapiedi ${
        MARTA_EPISODE_PROMPT.enemy
      }. `;
    }
    if (MARTA_EPISODE_PROMPT?.enemyPlace) {
      prompt += ` il luogo del combattimento col nemico sarà: ${MARTA_EPISODE_PROMPT.enemyPlace}. `;
    }
    if (MARTA_EPISODE_PROMPT?.trialsOfHeroes) {
      prompt += ` la sfida da superare sarà: ${randomItem(
        MARTA_EPISODE_PROMPT.trialsOfHeroes
      )} con descrizione di come viene superata. `;
    }
  }

  return prompt;
};

const generateEpisodeFormat = async () => {
  const loreArray = ["Dungeons and Dragons"];
  const lore = randomItem(loreArray);
  const fantasy = "fantasy";
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
  return {
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
    // spells: getRandomElementsFromArray(
    //   await generateArrayOf(
    //     "Incantesimi Elementali o di luce o di protezione o di evocazione o di illusione",
    //     "Dungeons and Dragons"
    //   ),
    //   4
    // ),
    // enemySpells: getRandomElementsFromArray(
    //   await generateArrayOf(
    //     `Incantesimi Oscuri, Necrotici o Psichici o che possono essere lanciati da ${enemy}`,
    //     "Dungeons and Dragons"
    //   ),
    //   4
    // ),
  };
};

const generateArrayOf = async (narrationElement, lore) => {
  let stringBetweenHashes = null;
  let textArray = [];
  while (!stringBetweenHashes || textArray.length < 4) {
    const promptText = `conosci 10 ${narrationElement} di massimo 6 parole selezionato dal mondo ${lore}? Ritornali separati da virgola senza altro testo in una frase racchiusa tra due #`;
    let messageWithArray = await prompt(
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

const daVinciPrompt = async (richiesta, type = null) => {
  if (!richiesta.text) {
    richiesta.text =
      "rispondimi solo con una battuta divertente su dungeons and dragons senza che sembri la risposta di un bot e in meno di 50 parole";
  }
  const messages = [{ role: "user", content: richiesta.text }];
  const apiKey = process.env.CHATGPT_API_KEY;
  const data = {
    model: "text-davinci-003",
    prompt: richiesta.text,
    temperature: richiesta.temperature || 1,
    max_tokens: 1000,
  };
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      data,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].text;
  } catch (e) {
    console.log(e.response.status);
    console.log(e.response.statusText);
    console.log(e.response.data.error);
  }
};

const getStringBetweenHashes = (input) =>
  (input.match(/#(.*?)#/) || [])[1] || null;

module.exports = {
  prompt,
  generateMartaPrompt,
  generateEpisodeFormat,
  generateNewMartaPrompt,
  generateIntroducktion,
  generateTrial,
  promptForMarta,
  generateEpisodeFinale,
};
