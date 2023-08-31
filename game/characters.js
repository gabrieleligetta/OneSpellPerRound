import { writeToCollection } from "../mongoDB.js";

const collection = "characters";

export const createCharacter = async (chatId, owner, name) => {
  const character = {
    chatId,
    owner,
    name: name,
    level: 1,
    xp: 0,
    spells: [],
    inventory: [],
  };
  await writeToCollection(collection, character);
  return character;
};
