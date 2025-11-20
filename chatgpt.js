import axios from "axios";

export async function generalPrompt(
  richiesta,
  type = null,
  model = process.env.CHATGPT_MODEL
) {
  // ... (codice invariato)
}

export async function promptForMarta(
  requestPayload, // Ora accetta un payload JSON
  temperature = 1,
  model = process.env.CHATGPT_MODEL,
  messageHistory,
  character, // Aggiunto per poter inserire il nome del personaggio nella domanda finale
  forceQuestion = false // Nuovo parametro per controllare la domanda finale
) {
  let currentHistory = [...messageHistory];

  // Rimosse le istruzioni per l'AI su come formattare l'output JSON da qui.
  // Saranno aggiunte una sola volta all'inizio della scena in martaAdventureScene.js

  // Aggiungi il payload JSON come messaggio utente
  currentHistory.push({
    role: "user",
    content: JSON.stringify(requestPayload), // Serializza il payload JSON
  });

  const apiKey = process.env.CHATGPT_API_KEY;
  const data = {
    model: model,
    messages: currentHistory,
    temperature: temperature || 1,
    response_format: { type: "json_object" }, // Richiede output JSON
  };

  // --- LOG DIAGNOSTICO ---
  console.log("--- MESSAGES SENT TO OPENAI ---");
  console.log(JSON.stringify(data.messages, null, 2));
  console.log("-------------------------------");
  // --- FINE LOG DIAGNOSTICO ---

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
    
    const botResponseContent = response.data.choices[0].message.content;
    
    // --- LOG DIAGNOSTICO AGGIUNTO ---
    console.log("Type of botResponseContent:", typeof botResponseContent);
    // --- FINE LOG DIAGNOSTICO AGGIUNTO ---

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(botResponseContent);
    } catch (jsonError) {
      console.error("Errore nel parsing JSON della risposta OpenAI:", jsonError);
      console.error("Risposta RAW:", botResponseContent);
      throw new Error("La risposta dell'AI non è un JSON valido.");
    }

    let message = parsedResponse.message || "L'AI non ha fornito un messaggio valido.";
    const metadata = parsedResponse.metadata || {};
    const loot = parsedResponse.loot || [];
    const xp_points = parsedResponse.xp_points || 0;

    // Aggiungi la domanda finale al messaggio se richiesto
    if (forceQuestion) {
      const charName = character?.name || "l'eroe";
      message += ` Tu, ${charName}, cosa fai?`;
    }

    // Aggiungi loot e XP al messaggio per la visualizzazione immediata
    if (loot.length > 0) {
      message += `\n\nHai trovato: ${loot.join(", ")}.`;
    }
    if (xp_points > 0) {
      message += `\n\nHai guadagnato ${xp_points} punti esperienza!`;
    }
    
    // Aggiungi la risposta dell'assistente alla cronologia come stringa JSON
    currentHistory.push({
      role: "assistant",
      content: botResponseContent, // Memorizza la stringa JSON RAW
    });

    return {
      reply: message, // Restituisce il messaggio testuale arricchito
      metadata: metadata,
      loot: loot,
      xp_points: xp_points,
      updatedHistory: currentHistory,
    };
  } catch (e) {
    console.error("Errore in promptForMarta:", e.response ? e.response.data.error : e.message);
    return {
      reply: "Oh no! Qualcosa è andato storto con la magia...",
      metadata: {},
      loot: [],
      xp_points: 0,
      updatedHistory: messageHistory,
    };
    }
}
