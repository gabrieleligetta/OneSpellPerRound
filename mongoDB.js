import { MongoClient, ServerApiVersion } from "mongodb";

import dotenv from "dotenv";
import { filterObjectFromProperties } from "./utils.js";

dotenv.config();
const uri = process.env.MONGO_DB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const getMongoDBClient = () => {
  return client.db("marta_game");
};

export const writeToCollection = async (collection, objToWrite) => {
  const database = getMongoDBClient();
  const currentCollection = database.collection(collection);
  const now = new Date().toISOString();
  if (!objToWrite?.createdAt) {
    objToWrite.createdAt = now;
    objToWrite.updatedAt = now;
  } else {
    objToWrite.updatedAt = now;
  }
  
  if (!!objToWrite._id) {
    const filter = { _id: objToWrite._id };
    const newObj = filterObjectFromProperties(["_id"], objToWrite);
    const update = {
      $set: {
        ...newObj,
      },
    };
    // Usiamo un'opzione per creare il documento se non esiste (upsert)
    const options = { upsert: true };
    const result = await currentCollection.updateOne(filter, update, options);
    
    if (result.upsertedId) {
      console.log(`[DB] Documento inserito con _id: ${result.upsertedId}`);
    } else if (result.modifiedCount > 0) {
      console.log(`[DB] Documento con _id: '${objToWrite._id}' aggiornato.`);
    } else {
      console.log(`[DB] Nessun aggiornamento necessario per _id: '${objToWrite._id}'.`);
    }
    return result;
  } else {
    const result = await currentCollection.insertOne(objToWrite, {});
    console.log(`[DB] Nuovo documento inserito con _id: ${result.insertedId}`);
    return result;
  }
};

export const getFromCollection = async (
  collection,
  propertyName,
  propertyValue
) => {
  const database = getMongoDBClient();
  const currentCollection = database.collection(collection);

  const query = { [propertyName]: propertyValue };
  try {
    return await currentCollection.findOne(query);
  } catch (error) {
    console.error(`[DB] Errore durante la lettura da ${collection}:`, error);
    return null;
  }
};

export const listFromCollection = async (
  collection,
  propertyName,
  propertyValue
) => {
  const database = getMongoDBClient();
  const currentCollection = database.collection(collection);

  const query = (propertyName && propertyValue) ? { [propertyName]: propertyValue } : {};
  try {
    return await currentCollection.find(query).toArray();
  } catch (error) {
    console.error(`[DB] Errore durante l'elenco da ${collection}:`, error);
    return [];
  }
};
