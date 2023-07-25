const axios = require("axios");
const {Prompts, extractStringBetweenCharacters, getRandomElementsFromArray, removeCharExceptFirstAndLast} = require("./utils");
const randomItem = require("random-item");
async function prompt (richiesta, type= null) {
    if (!richiesta.text) {
        richiesta.text = "rispondimi solo con una battuta divertente su dungeons and dragons senza che sembri la risposta di un bot e in meno di 50 parole"
    }
    const messages = []
    if (type === Prompts.MartaLaPapera) {
        messages.push({"role": "system",
            "content": "Sei l'autore dei libri di 'Marta la papera col cappello da Strega'," +
                " che racconta episodi della vita di Marta e i suoi amici che sono degli avventurieri e vagano per il mondo di Ethim, " +
                "popolato da animali antropomorfi, mostri e creature magiche senzienti," +
                " in un atmosfera a metà bambinesca e a metà Lovecraftiana"})
    } else if (type === Prompts.BattuteDnD) {
        messages.push({"role": "system", "content": "Sei un comico affermato che ritorna freddure a tema fantasy"})
    } else if (type === Prompts.EpisodePromptValues) {
        messages.push({"role": "system", "content": "Sei un l'assistente di uno sviluppatore che ha bisogno di risultati che tornano sempre alla stessa maniera," +
                " Ritornali separati da virgola senza altro testo in una frase racchiusa tra due #"})
    }
    messages.push({"role": "user", "content": richiesta.text});
    const apiKey = process.env.CHATGPT_API_KEY
    const data = {
        "model": "gpt-3.5-turbo-16k",
        "messages": messages,
        "temperature": richiesta.temperature || 1
    };
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions', data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data.choices[0].message.content
    } catch (e) {
        console.log(e.response.status)
        console.log(e.response.statusText)
        console.log(e.response.data.error)
    }
}

const daVinciPrompt = async (richiesta, type= null) => {
    if (!richiesta.text) {
        richiesta.text = "rispondimi solo con una battuta divertente su dungeons and dragons senza che sembri la risposta di un bot e in meno di 50 parole"
    }
    const messages = [{"role": "user", "content": richiesta.text}];
    const apiKey = process.env.CHATGPT_API_KEY
    const data = {
        "model": "text-davinci-003",
        "prompt": richiesta.text,
        "temperature": richiesta.temperature || 1,
        "max_tokens": 1000,

    };
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/completions', data, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
            });
        return response.data.choices[0].text
    } catch (e) {
        console.log(e.response.status)
        console.log(e.response.statusText)
        console.log(e.response.data.error)
    }
}

const generateMartaPrompt = (MARTA_EPISODE_PROMPT) => {
    let prompt =  "rispondimi solo con un episodio autoconclusivo delle avventure di Marta, la papera con il cappello da strega, senza che sembri la risposta di un bot.";
    if (!!MARTA_EPISODE_PROMPT) {
        if (MARTA_EPISODE_PROMPT?.startPlace) {
            prompt +=` il luogo in cui inizia l'avventura sarà: ${MARTA_EPISODE_PROMPT.startPlace}, che si trova nel mondo di Ethim. `
        }
        if (MARTA_EPISODE_PROMPT?.enemy) {
            prompt +=` il nemico sarà: ${MARTA_EPISODE_PROMPT.enemy} che è un sottoposto di ${MARTA_EPISODE_PROMPT.boss}. `
        }
        if (MARTA_EPISODE_PROMPT?.supportCharacters) {
            prompt +=` gli amici di Marta saranno: ${MARTA_EPISODE_PROMPT.supportCharacters.join(", ")}. `
        }
        if (MARTA_EPISODE_PROMPT?.event) {
            prompt +=` l'evento iniziale sarà: ${MARTA_EPISODE_PROMPT.event} causata dal potere di ${MARTA_EPISODE_PROMPT.boss} o dal tirapiedi ${MARTA_EPISODE_PROMPT.enemy}. `
        }
        if (MARTA_EPISODE_PROMPT?.enemyPlace) {
            prompt +=` il luogo del combattimento col nemico sarà: ${MARTA_EPISODE_PROMPT.enemyPlace}. `
        }
        if (MARTA_EPISODE_PROMPT?.trialOfHeroes) {
            prompt +=` la sfida da superare sarà: ${MARTA_EPISODE_PROMPT.trialOfHeroes} con descrizione di come viene superata. `
        }
        if (MARTA_EPISODE_PROMPT?.spells) {
            prompt +=` gli incantesimi utilizzati da marta e gli amici saranno: ${MARTA_EPISODE_PROMPT.spells.join(", ")}. `
        }        if (MARTA_EPISODE_PROMPT?.spells) {
            prompt +=` gli incantesimi utilizzati da ${MARTA_EPISODE_PROMPT.enemy} saranno: ${MARTA_EPISODE_PROMPT.enemySpells.join(", ")}. `
        }
        prompt += 'il racconto sarà descrittivo e dettagliato,' +
            ' descriverà gli scontri e i modo in cui verrà superata la sfida in maniera approfondita, ci saranno dialoghi e riflessioni di Marta'
    }

    return prompt
}

const generateEpisodeFormat = async () => {
    const loreArray = ["Lovecraft","Dungeons and Dragons"]
    const lore = randomItem(loreArray);
    const fantasy = 'fantasy';
    const boss = randomItem(await generateArrayOf("Antagonisti con grande potere o divinità", lore));
    const enemy = randomItem(await generateArrayOf(`Antagonisti tirapiedi o subordinati di ${boss}`, lore));
    const startPlace = randomItem(await generateArrayOf("Luoghi", "fantasy, atmosfera magica"));
    const enemyPlace = randomItem(await generateArrayOf("Luoghi", `rifugio di ${enemy}, atmosfera cupa`));
    const event = randomItem(await generateArrayOf("Eventi", `causati da ${enemy} nel luogo ${startPlace}`))
    return {
        episodeFormat: randomItem(["autoconclusivo"]),
        enemy: enemy,
        boss: boss,
        supportCharacters: getRandomElementsFromArray(await generateArrayOf("Animaletti del bosco con nome, soprannome e aggettivo", "Amici di Marta la Papera col cappello da Strega, esempio: 'Lucia la gatta ballerina'"), Math.floor(Math.random() * 4)),
        event: event,
        startPlace: startPlace,
        enemyPlace: enemyPlace,
        trialOfHeroes: randomItem(await generateArrayOf("Sfide da eroi", `causati da ${enemy} nel luogo ${enemyPlace}`)),
        spells: getRandomElementsFromArray(await generateArrayOf("Incantesimi Elementali o di luce o di protezione o di evocazione o di illusione", "Dungeons and Dragons"), 4),
        enemySpells: getRandomElementsFromArray(await generateArrayOf(`Incantesimi Oscuri, Necrotici o Psichici o che possono essere lanciati da ${enemy}`, "Dungeons and Dragons"), 4),
    }
}

const getStringBetweenHashes = (input) => (input.match(/#(.*?)#/) || [])[1] || null;

const generateArrayOf = async (narrationElement,lore) => {
    let stringBetweenHashes = null;
    let textArray = [];
    while (!stringBetweenHashes || textArray.length < 4) {
        const promptText = `conosci 10 ${narrationElement} di massimo 6 parole selezionato dal mondo ${lore}? Ritornali separati da virgola senza altro testo in una frase racchiusa tra due #`;
        let messageWithArray = await prompt({text:promptText, temperature: 0.7}, Prompts.EpisodePromptValues);
        const result = messageWithArray.split('#').length - 1;
        console.log("messageWithArray")
        console.log(messageWithArray)
        if (result > 2) {
            messageWithArray = removeCharExceptFirstAndLast(messageWithArray,'#');
        }
        stringBetweenHashes = getStringBetweenHashes(messageWithArray);
        console.log("stringBetweenHashes")
        console.log(stringBetweenHashes)
        if (!!stringBetweenHashes) {
            textArray = stringBetweenHashes.split(",").map(element => element.replaceAll("[^a-zA-Z0-9]", "").replaceAll(`\n`, ""))
            console.log("textArray")
            console.log(textArray)
        }
    }
    return textArray;
}

module.exports = {prompt,generateMartaPrompt,generateEpisodeFormat}

