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
let uniqueActionArray = [];
// let MARTA_SUBS = [481189001, -1001845883499, 6482260157];
// let SPELLS_SUBS = [481189001, -1001845883499, 6482260157];
// let MARTA_EPISODE_PROMPT = null;
let MARTA_EPISODE_PROMPT = {
  episodeFormat: "autoconclusivo",
  enemy: " Dragonne",
  boss: " Tiamat",
  supportCharacters: ["Leo il lupo coraggioso", "Lucia la gatta ballerina"],
  events: [
    "Incendio distrugge mercato nel Villaggio delle Streghe",
    " Invasione di draghi nel Villaggio delle Streghe",
    " Crollo di una torre a causa di una dragone nel Villaggio delle Streghe",
    " Fuga di massa a causa di un attacco di dragone nel Villaggio delle Streghe",
    " Distruzione di una casa a causa di un dragone nel Villaggio delle Streghe",
    " Panico generale causato da un dragone nel Villaggio delle Streghe",
    " Attacco di dragone al castello nel Villaggio delle Streghe",
    " Danni alle coltivazioni a causa di un dragone nel Villaggio delle Streghe",
    " Feriti a seguito di un attacco di dragone nel Villaggio delle Streghe",
    " ",
  ],
  startPlace: " Villaggio delle Streghe",
  enemyPlace: " Aokigahara Forest",
  trialsOfHeroes: [
    "Caduta da altezza",
    " combattimento con spade",
    " furia distruttiva",
    " abilità di volo",
    " controllo del fuoco",
    " teletrasporto",
    " manipolazione mentale",
    " invisibilità",
    " guarigione istantanea",
    " controllo elementale",
  ],
};
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

export const getUniqueActionArray = () => {
  return uniqueActionArray;
};

export const setInUniqueActionArray = (item) => {
  uniqueActionArray.push(item);
  return uniqueActionArray;
};

export const removeInUniqueActionArray = (item) => {
  uniqueActionArray = uniqueActionArray.filter((e) => e !== item);
  return uniqueActionArray;
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
