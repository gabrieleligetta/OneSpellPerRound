const axios = require("axios");
const {Prompts, extractStringBetweenCharacters, getRandomElementsFromArray} = require("./utils");
const randomItem = require("random-item");
async function prompt (richiesta, type= null) {
    if (!richiesta.text) {
        richiesta.text = "rispondimi solo con una battuta divertente su dungeons and dragons senza che sembri la risposta di un bot e in meno di 50 parole"
    }
    const messages = []
    if (type === Prompts.MartaLaPapera) {
        messages.push({"role": "system", "content": "Sei l'autore dei libri di 'Marta la papera col cappello da Strega', che racconta episodi della vita di Marta e i suoi amici, in un atmosfera a metà bambinesca e a metà Lovecraftiana"})
    } else if (type === Prompts.BattuteDnD) {
        messages.push({"role": "system", "content": "Sei un comico affermato che ritorna freddure a tema fantasy"})
    } else if (type === Prompts.EpisodePromptValues) {
        messages.push({"role": "system", "content": "Sei un l'assistente di uno sviluppatore che ha bisogno di risultati che tornano sempre alla stessa maniera, Ritornali in una stringa racchiusa tra due #, separati da virgola senza altro testo"})
    }
    messages.push({"role": "user", "content": richiesta.text});
    const apiKey = process.env.CHATGPT_API_KEY
    const data = {
        "model": "gpt-3.5-turbo",
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
        if (MARTA_EPISODE_PROMPT?.enemy) {
            prompt +=` il nemico sarà: ${MARTA_EPISODE_PROMPT.enemy}. `
        }
        if (MARTA_EPISODE_PROMPT?.supportCharacters) {
            prompt +=` gli amici di Marta saranno: ${MARTA_EPISODE_PROMPT.supportCharacters.join(", ")}. `
        }
        if (MARTA_EPISODE_PROMPT?.event) {
            prompt +=` l'evento iniziale sarà: ${MARTA_EPISODE_PROMPT.event}. `
        }
        if (MARTA_EPISODE_PROMPT?.place) {
            prompt +=` il luogo del combattimento col nemico sarà: ${MARTA_EPISODE_PROMPT.place}. `
        }
        if (MARTA_EPISODE_PROMPT?.trialOfHeroes) {
            prompt +=` la sfida da superare sarà: ${MARTA_EPISODE_PROMPT.trialOfHeroes}. `
        }
        if (MARTA_EPISODE_PROMPT?.spells) {
            prompt +=` gli incantesimi utilizzati saranno: ${MARTA_EPISODE_PROMPT.spells.join(", ")}. `
        }
    }

    return prompt
}

const generateEpisodeFormat = async () => {
    const loreArray = ["Lovecraftiano","Dungeons and Dragons"]
    const lore = randomItem(loreArray);
    const fantasy = 'fantasy';
    const place = randomItem(await generateArrayOf("Luoghi", lore));
    const enemy = randomItem(await generateArrayOf("Antagonisti", lore))
    const event = randomItem(await generateArrayOf("Eventi", `causati da ${enemy} nel luogo ${place}`))
    return {
        episodeFormat: randomItem(["autoconclusivo"]),
        enemy: enemy,
        supportCharacters: getRandomElementsFromArray(await generateArrayOf("Animaletti del bosco con nome, soprannome e aggettivo", "Amici di Marta la Papera col cappello da Strega, esempio: 'Lucia la gatta ballerina'"), Math.floor(Math.random() * 2) +1),
        event: event,
        place: place,
        trialOfHeroes: randomItem(await generateArrayOf("Sfide da eroi", `causati da ${enemy} nel luogo ${place} per superare ${event}`)),
        spells: getRandomElementsFromArray(await generateArrayOf("Incantesimi", "Dungeons and Dragons"), 4),
    }
}

const getStringBetweenHashes = (input) => (input.match(/#(.*?)#/) || [])[1] || null;

const generateArrayOf = async (narrationElement,lore) => {
    let stringBetweenHashes = null;
    while (!stringBetweenHashes) {
        const promptText = `conosci 10 ${narrationElement} di massimo 6 parole selezionato dal mondo ${lore}? Ritornali in una stringa racchiusa tra due #, separati da virgola senza altro testo`;
        const messageWithArray = await prompt({text:promptText, temperature: 0.7}, Prompts.EpisodePromptValues);
        console.log("messageWithArray")
        console.log(messageWithArray)

        stringBetweenHashes = getStringBetweenHashes(messageWithArray);
        console.log("stringBetweenHashes")
        console.log(stringBetweenHashes)
    }

    const textArray = stringBetweenHashes.split(",").map(element => element.replaceAll("[^a-zA-Z0-9]", "").replaceAll(`\n`, ""))
    console.log("textArray")
    console.log(textArray)
    return textArray;
}

module.exports = {prompt,generateMartaPrompt,generateEpisodeFormat}

