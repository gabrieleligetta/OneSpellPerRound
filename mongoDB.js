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
  console.log("objToWrite");
  console.log(objToWrite);
  if (!!objToWrite._id) {
    const _id = objToWrite._id;
    const newObj = filterObjectFromProperties(["_id"], objToWrite);
    const update = {
      $set: {
        ...newObj,
      },
    };
    const result = await currentCollection.updateOne({ _id }, update);
    console.log(`A document was updated with the _id: ${result.upsertedId}`);
    return result;
  } else {
    const result = await currentCollection.insertOne(objToWrite, {});
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
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

  // Create a query filter to find records with the specified property value
  const query = { [propertyName]: propertyValue };
  let result = null;

  try {
    // Find records that match the query
    if (!!propertyName && !!propertyValue) {
      result = await currentCollection.findOne(query);
    } else {
      result = null;
    }
    // Process the found records
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const listFromCollection = async (
  collection,
  propertyName,
  propertyValue
) => {
  const database = getMongoDBClient();
  const currentCollection = database.collection(collection);

  // Create a query filter to find records with the specified property value
  const query = { [propertyName]: propertyValue };
  let result = null;
  try {
    // Find records that match the query
    if (propertyName && propertyValue) {
      result = await currentCollection.find(query).toArray();
    } else {
      result = await currentCollection.find().toArray();
    }
    // Process the found records
    return result;
  } catch (error) {
    return [];
  }
};
