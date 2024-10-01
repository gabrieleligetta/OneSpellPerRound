import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY,
});

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


// Poll the status until it is completed
const pollThreadStatus = async (threadId, runId) => {
    let threadRetrieve;

    // Poll the status every 2 seconds
    const pollInterval = 2000;

    // Keep polling until the status is 'completed'
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
            try {
                // Retrieve the thread's current run status
                threadRetrieve = await openai.beta.threads.runs.retrieve(threadId, runId);

                console.log("Current status:", threadRetrieve.status);

                // If the status is completed, resolve and stop polling
                if (threadRetrieve.status === 'completed') {
                    clearInterval(intervalId);  // Stop the polling
                    const messages = await openai.beta.threads.messages.list(threadId)
                    // Log the retrieved thread for debugging
                    console.log("messages.data[0].content[0]")
                    console.log(messages.data[0].content[0])
                    console.log("messages.data[0].content[0].text.annotations")
                    console.log(messages.data[0].content[0].text.annotations[0])
                    // Resolve the response from the assistant
                    const replacedText = await(replaceAnnotationsWithFileNames(messages.data[0].content[0].text.value, messages.data[0].content[0].text.annotations))
                    resolve(replacedText);
                }
            } catch (error) {
                clearInterval(intervalId);  // Stop the polling if there's an error
                reject(error);  // Reject the promise with the error
            }
        }, pollInterval);  // Polling interval in milliseconds
    });
};

async function replaceAnnotationsWithFileNames(text, annotations) {
    // Funzione che recupera i file name dal file_id usando la funzione getFileName
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
    // Scorriamo le annotazioni e sostituiamo nel testo
    if (annotations.length) {
        for (let annotation of annotations) {
            const annotationText = annotation.text;
            const fileId = annotation.file_citation?.file_id;

            if (fileId) {
                try {
                    // Recuperiamo il nome del file tramite il file_id
                    const fileName = await getFileName(fileId);

                    // Sostituisci l'annotazione nel testo originale con il nome del file
                    text = text.replace(annotationText, " source@[" + fileName + "]");
                } catch (error) {
                    console.error('Failed to retrieve file name:', error);
                }
            }
        }
    }

    return text; // Restituisce il testo modificato
}