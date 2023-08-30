const axios = require("axios");
//Global Variables caching system
let classesGlobal;
let scoresGlobal;
let skillsGlobal;
let spellsGlobal;
let racesGlobal;
let traitsGlobalArray = [];
let uniqueActionArray = [];
let MARTA_EPISODE_PROMPT = null;
let USERS_CACHE = [481189001, -1001845883499, 6482260157];
// let MARTA_EPISODE_PROMPT = {
//   episodeFormat: "autoconclusivo",
//   enemy: " Dragonne",
//   boss: " Tiamat",
//   supportCharacters: ["Leo il lupo coraggioso", "Lucia la gatta ballerina"],
//   events: [
//     "Incendio distrugge mercato nel Villaggio delle Streghe",
//     " Invasione di draghi nel Villaggio delle Streghe",
//     " Crollo di una torre a causa di una dragone nel Villaggio delle Streghe",
//     " Fuga di massa a causa di un attacco di dragone nel Villaggio delle Streghe",
//     " Distruzione di una casa a causa di un dragone nel Villaggio delle Streghe",
//     " Panico generale causato da un dragone nel Villaggio delle Streghe",
//     " Attacco di dragone al castello nel Villaggio delle Streghe",
//     " Danni alle coltivazioni a causa di un dragone nel Villaggio delle Streghe",
//     " Feriti a seguito di un attacco di dragone nel Villaggio delle Streghe",
//     " ",
//   ],
//   startPlace: " Villaggio delle Streghe",
//   enemyPlace: " Aokigahara Forest",
//   trialsOfHeroes: [
//     "Caduta da altezza",
//     " combattimento con spade",
//     " furia distruttiva",
//     " abilità di volo",
//     " controllo del fuoco",
//     " teletrasporto",
//     " manipolazione mentale",
//     " invisibilità",
//     " guarigione istantanea",
//     " controllo elementale",
//   ],
// };
//Global Variables caching system

const getMartaEpisodePrompt = () => {
  return MARTA_EPISODE_PROMPT;
};

const setMartaEpisodePrompt = (episode) => {
  MARTA_EPISODE_PROMPT = episode;
  return MARTA_EPISODE_PROMPT;
};
const getUniqueActionArray = () => {
  return uniqueActionArray;
};

const setInUniqueActionArray = (item) => {
  uniqueActionArray.push(item);
  return uniqueActionArray;
};

const removeInUniqueActionArray = (item) => {
  uniqueActionArray = uniqueActionArray.filter((e) => e !== item);
  return uniqueActionArray;
};

const getUserCache = () => {
  return USERS_CACHE;
};

const setInUserCache = (user) => {
  USERS_CACHE.push(user);
  USERS_CACHE = [...new Set(USERS_CACHE)];
  return USERS_CACHE;
};

const getAbilityScores = async () => {
  if (scoresGlobal) {
    return scoresGlobal;
  } else {
    return (scoresGlobal = await axios.get(
      "http://www.dnd5eapi.co/api/ability-scores/"
    ));
  }
};

const getClasses = async () => {
  if (classesGlobal) {
    return classesGlobal;
  } else {
    classesGlobal = await axios.get("http://www.dnd5eapi.co/api/classes/");
    return classesGlobal;
  }
};

const getRaces = async () => {
  if (racesGlobal) {
    return racesGlobal;
  } else {
    racesGlobal = await axios.get("http://www.dnd5eapi.co/api/races/");
    return racesGlobal;
  }
};

const getSkills = async () => {
  if (skillsGlobal) {
    return skillsGlobal;
  } else {
    skillsGlobal = await axios.get("http://www.dnd5eapi.co/api/skills/");
    return skillsGlobal;
  }
};

const getSpells = async () => {
  if (spellsGlobal) {
    return spellsGlobal;
  } else {
    spellsGlobal = await axios.get("http://www.dnd5eapi.co/api/spells/");
    return spellsGlobal;
  }
};

const getTraitData = async (url) => {
  if (traitsGlobalArray[url]) {
    return traitsGlobalArray[url];
  } else {
    traitsGlobalArray[url] = (
      await axios.get("http://www.dnd5eapi.co" + url)
    ).data;
    return traitsGlobalArray[url];
  }
};

module.exports = {
  getUserCache,
  setInUserCache,
  getMartaEpisodePrompt,
  setMartaEpisodePrompt,
  getUniqueActionArray,
  setInUniqueActionArray,
  removeInUniqueActionArray,
  getAbilityScores,
  getClasses,
  getRaces,
  getSkills,
  getSpells,
  getTraitData,
};
