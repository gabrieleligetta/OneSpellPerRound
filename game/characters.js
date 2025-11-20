import { writeToCollection, getFromCollection } from "../mongoDB.js";
import { ObjectId } from "mongodb";

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

export const getCharacter = async (characterId) => {
  return await getFromCollection(collection, "_id", new ObjectId(characterId));
};
