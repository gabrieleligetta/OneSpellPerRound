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
        messages.push({"role": "system", "content": "You are a funny comedian who tells dad jokes about Dungeon and Dragons."})
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
    return {
        episodeFormat: randomItem(["autoconclusivo"]),
        enemy: randomItem(await generateArrayOf("Antagonista", lore)),
        supportCharacters: getRandomElementsFromArray(await generateArrayOf("Animaletti del bosco con nome, soprannome e aggettivo", "Amici di Marta la Papera col cappello da Strega, esempio: 'Lucia la gatta ballerina'"), Math.floor(Math.random() * 2) +1),
        event: randomItem(await generateArrayOf("Evento", fantasy)),
        place: randomItem(await generateArrayOf("Luoghi", fantasy)),
        trialOfHeroes: randomItem(await generateArrayOf("Sfide da eroi", place)),
        spells: getRandomElementsFromArray(await generateArrayOf("Incantesimi", "Dungeons and Dragons"), 4),
    }
}

const generateArrayOf = async (narrationElement,lore) => {
    const promptText = `conosci 10 ${narrationElement} di massimo 6 parole selezionato dal mondo ${lore}? Ritornali in una stringa, separati da virgola senza che sembri la risposta di un bot`;
    const messageWithArray = await daVinciPrompt({text:promptText, temperature: 0.7});
    console.log("messageWithArray")
    console.log(messageWithArray)
    const textArray = messageWithArray.split(",").map(element => element.replaceAll("[^a-zA-Z0-9]", "").replaceAll(`\n`, ""))
    console.log("textArray")
    console.log(textArray)
    return textArray;
}

module.exports = {prompt,generateMartaPrompt,generateEpisodeFormat}

