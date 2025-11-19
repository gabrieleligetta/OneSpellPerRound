//Global Variables caching system
import axios from "axios";
import { getFromCollection, writeToCollection } from "./mongoDB.js";

const userBroadcast = "userBroadcast";

let classesGlobal;
let scoresGlobal;
let skillsGlobal;
let spellsGlobal;
let racesGlobal;
let traitsGlobalArray = [];
let MARTA_EPISODE_PROMPT = null;

//Global Variables caching system

export const getMartaEpisodePrompt = () => {
  return MARTA_EPISODE_PROMPT;
};

export const setMartaEpisodePrompt = (episode) => {
  MARTA_EPISODE_PROMPT = episode;
  return MARTA_EPISODE_PROMPT;
};

export const getBroadcastSubs = async (BroadcastType) => {
  return await getFromCollection(userBroadcast, "BroadcastType", BroadcastType);
};

export const setInBroadcastSubs = async (BroadcastType, user) => {
  let USERS_CACHE = await getBroadcastSubs(BroadcastType);
  if (!!USERS_CACHE._id) {
    USERS_CACHE.value.push(user);
    USERS_CACHE.value = [...new Set(USERS_CACHE.value)];
    await writeToCollection(userBroadcast, USERS_CACHE);
  } else {
    await writeToCollection(userBroadcast, {
      BroadcastType: BroadcastType,
      value: [user],
    });
  }

  return USERS_CACHE;
};

export const removeInBroadcastSubs = async (BroadcastType, user) => {
  let USERS_CACHE = await getBroadcastSubs(BroadcastType);
  if (!!USERS_CACHE._id) {
    USERS_CACHE.value = USERS_CACHE.value.filter((e) => e !== user);
    await writeToCollection(userBroadcast, USERS_CACHE);
  } else {
    await writeToCollection(userBroadcast, {
      BroadcastType: BroadcastType,
      value: [],
    });
  }
};

export const getAbilityScores = async () => {
  if (scoresGlobal) {
    return scoresGlobal;
  } else {
    return (scoresGlobal = await axios.get(
      "http://www.dnd5eapi.co/api/ability-scores/"
    ));
  }
};

export const getClasses = async () => {
  if (classesGlobal) {
    return classesGlobal;
  } else {
    classesGlobal = await axios.get("http://www.dnd5eapi.co/api/classes/");
    return classesGlobal;
  }
};

export const getRaces = async () => {
  if (racesGlobal) {
    return racesGlobal;
  } else {
    racesGlobal = await axios.get("http://www.dnd5eapi.co/api/races/");
    return racesGlobal;
  }
};

export const getSkills = async () => {
  if (skillsGlobal) {
    return skillsGlobal;
  } else {
    skillsGlobal = await axios.get("http://www.dnd5eapi.co/api/skills/");
    return skillsGlobal;
  }
};

export const getSpells = async () => {
  if (spellsGlobal) {
    return spellsGlobal;
  } else {
    spellsGlobal = await axios.get("http://www.dnd5eapi.co/api/spells/");
    return spellsGlobal;
  }
};

export const getTraitData = async (url) => {
  if (traitsGlobalArray[url]) {
    return traitsGlobalArray[url];
  } else {
    traitsGlobalArray[url] = (
      await axios.get("http://www.dnd5eapi.co" + url)
    ).data;
    return traitsGlobalArray[url];
  }
};
