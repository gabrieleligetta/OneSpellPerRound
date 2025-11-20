import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY,
});

// --- SCHEMA ZOD PER L'EPISODIO BASE (SENZA supportCharacters) ---
const EpisodeObject = z.object({
    enemy: z.string().describe("Il nome di un gruppo di antagonisti o di un singolo nemico, che funge da tirapiedi o subordinato del boss. Massimo 6 parole."),
    boss: z.string().describe("Il nome del boss finale, una divinità o un'entità di grande potere nel mondo di Dungeons and Dragons. Massimo 6 parole."),
    startPlace: z.string().describe("Un luogo fantasy con un'atmosfera magica dove inizia l'avventura. Massimo 6 parole."),
    enemyPlace: z.string().describe("Il covo o il rifugio del nemico ('enemy'), deve avere un'atmosfera cupa e minacciosa. Massimo 6 parole."),
    initialEvent: z.string().describe("Una breve descrizione dell'evento iniziale che dà il via all'avventura. Massimo 15 parole."),
    // supportCharacters rimosso da qui, verrà generato dinamicamente
});

// --- FUNZIONE PER GENERARE L'EPISODIO BASE ---
export const generateCompleteEpisode = async () => {
    const systemMessage = {
        role: "system",
        content: "Sei un Dungeon Master esperto per una campagna di Dungeons and Dragons. Il tuo compito è generare la struttura base di un'avventura autoconclusiva in un singolo oggetto JSON, seguendo scrupolosamente lo schema fornito. Assicurati che gli elementi siano coerenti tra loro: l'enemy deve essere un subordinato del boss."
    };

    const userPrompt = "Genera una nuova struttura base per un'avventura per 'Marta la papera col cappello da strega'. Popola tutti i campi richiesti dallo schema JSON.";

    const userMessage = {
        role: "user",
        content: userPrompt,
    };

    try {
        const response = await openai.beta.chat.completions.parse({
            model: process.env.CHATGPT_MODEL,
            messages: [systemMessage, userMessage],
            temperature: 1,
            response_format: zodResponseFormat(EpisodeObject, "episode"),
        });

        const episode = response.choices[0].message.parsed;
        console.log("[OpenAI] Episodio base generato con successo:", episode);
        return episode;
    } catch (error) {
        console.error("[OpenAI] Errore durante la generazione dell'episodio base:", error);
        throw error;
    }
};

// --- CODICE ASSISTENTE (INVARIATO) ---
const assistant = await openai.beta.assistants.retrieve(process.env.CHATGPT_ASSISTANT);

export const askDnD5eAssistant = async (question) => {
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: question
    })
    const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id
    })
    return await pollThreadStatus(thread.id, run.id)
}

const pollThreadStatus = async (threadId, runId) => {
    let threadRetrieve;
    const pollInterval = 2000;
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
            try {
                threadRetrieve = await openai.beta.threads.runs.retrieve(threadId, runId);
                if (threadRetrieve.status === 'completed') {
                    clearInterval(intervalId);
                    const messages = await openai.beta.threads.messages.list(threadId);
                    const replacedText = await replaceAnnotationsWithFileNames(messages.data[0].content[0].text.value, messages.data[0].content[0].text.annotations);
                    resolve(replacedText);
                }
            } catch (error) {
                clearInterval(intervalId);
                reject(error);
            }
        }, pollInterval);
    });
};

async function replaceAnnotationsWithFileNames(text, annotations) {
    async function getFileName(fileId) {
        try {
            const fileInfo = await openai.files.retrieve(fileId);
            return fileInfo.filename;
        } catch (error) {
            console.error('Error retrieving file information:', error);
            throw error;
        }
    }
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    if (annotations && annotations.length) {
        for (let annotation of annotations) {
            const annotationText = annotation.text;
            const fileId = annotation.file_citation?.file_id;
            if (fileId) {
                try {
                    const fileName = await getFileName(fileId);
                    text = text.replace(annotationText, " source@[" + fileName + "]");
                } catch (error) {
                    console.error('Failed to retrieve file name:', error);
                }
            }
        }
    }
    return text;
}
