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

const setMartaEpisodePrompt = () => {
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

module.exports = {
  getMartaEpisodePrompt,
  setMartaEpisodePrompt,
  getUniqueActionArray,
  setInUniqueActionArray,
  removeInUniqueActionArray,
  getAbilityScores: async function () {
    if (scoresGlobal) {
      //console.log('abilities cachato')
      return scoresGlobal;
    } else {
      //console.log('sto scaricando abilities')
      return (scoresGlobal = await axios.get(
        "http://www.dnd5eapi.co/api/ability-scores/"
      ));
    }
  },
  getClasses: async function () {
    if (classesGlobal) {
      //console.log('classes cachato')
      return classesGlobal;
    } else {
      //console.log('sto scaricando classes')
      classesGlobal = await axios.get("http://www.dnd5eapi.co/api/classes/");
      return classesGlobal;
    }
  },
  getRaces: async function () {
    if (racesGlobal) {
      //console.log('races cachato')
      return racesGlobal;
    } else {
      //console.log('sto scaricando races')
      racesGlobal = await axios.get("http://www.dnd5eapi.co/api/races/");
      return racesGlobal;
    }
  },
  getSkills: async function () {
    if (skillsGlobal) {
      //console.log('skills cachato')
      return skillsGlobal;
    } else {
      //console.log('sto scaricando skills')
      skillsGlobal = await axios.get("http://www.dnd5eapi.co/api/skills/");
      return skillsGlobal;
    }
  },
  getSpells: async function () {
    if (spellsGlobal) {
      //console.log('skills cachato')
      return spellsGlobal;
    } else {
      //console.log('sto scaricando skills')
      spellsGlobal = await axios.get("http://www.dnd5eapi.co/api/spells/");
      return spellsGlobal;
    }
  },
  getTraitData: async function (url) {
    if (traitsGlobalArray[url]) {
      //console.log('tratto cachato')
      return traitsGlobalArray[url];
    } else {
      //console.log('scarico il tratto')
      traitsGlobalArray[url] = (
        await axios.get("http://www.dnd5eapi.co" + url)
      ).data;
      return traitsGlobalArray[url];
    }
  },
};
