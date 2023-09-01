import { MongoClient, ServerApiVersion } from "mongodb";

import dotenv from "dotenv";

dotenv.config();
const uri = process.env.MONGO_DB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
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
  const result = await currentCollection.insertOne(objToWrite, {});
  console.log(`A document was inserted with the _id: ${result.insertedId}`);
  return result;
};
