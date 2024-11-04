import { Prompts } from "./utils.js";
import axios from "axios";

const martaMessages = new Map();


export async function generalPrompt(
  richiesta,
  type = null,
  model = process.env.CHATGPT_MODEL
) {
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

export async function promptForMarta(
  request,
  temperature = 1,
  model = process.env.CHATGPT_MODEL,
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
          "è importante raccontare dettagliatamente di come la prova viene superata dai nostri eroi",
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
