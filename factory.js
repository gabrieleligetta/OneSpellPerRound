//Global Variables caching system
import * as fs from "fs";
import randomItem from "random-item";
import { getClasses, getRaces, getSkills, getTraitData } from "./cache.js";
import axios from "axios";
import { getRandomName, makeUpperCaseAfterCommas } from "./utils.js";

let rawbackgrounds = fs.readFileSync("backgrounds.json");
let backgroundsGlobal = JSON.parse(rawbackgrounds.toString());
let classGlobalArray = [];
let raceGlobalArray = [];
let subracesGlobalArray = [];
let spellsGlobalArray = [];
//Global Variables caching system

export const getBackground = function () {
  let backgrounds = backgroundsGlobal;
  //console.log(backgrounds)
  let vanillaback = [];
  let true_back;
  backgrounds.background.forEach((element) => {
    if (element.source === "PHB") {
      if (element.name !== "Variant Guild Artisan (Guild Merchant)") {
        //console.log(element.name)
        vanillaback.push(element);
      }
    }
  });
  let char_background = randomItem(vanillaback);

  if (char_background.name.includes("Variant")) {
    //console.log(char_background)
    true_back = char_background._copy.name;
    let feature;
    let back;
    for (back of vanillaback) {
      if (back.name === true_back) {
        true_back = char_background;
        char_background = back;
        if (Array.isArray(true_back._copy._mod.entries)) {
          feature = true_back._copy._mod.entries[1].items;
        } else {
          feature = true_back._copy._mod.entries.items;
        }
        return {
          true_back: true_back,
          feature: feature,
          char_background: char_background,
        };
      }
    }
  } else {
    let feature = char_background.entries[1];
    return {
      true_back: char_background,
      feature: feature,
      char_background: char_background,
    };
  }
};
export const getClass = async function (charLevel) {
  let classesArray = await getClasses();
  let tempClass = randomItem(classesArray.data.results).index;
  let tempStore = classGlobalArray[tempClass];
  //console.log(tempStore)
  if (tempStore) {
    //console.log('class cachato')
    return tempStore;
  } else {
    //console.log('sto scaricando class')
    classGlobalArray[tempClass] = await axios.get(
      "http://www.dnd5eapi.co/api/classes/" + tempClass
    );
    //console.log(raceGlobalArray[tempRace])
    return classGlobalArray[tempClass];
  }
};
export const getName = function (msg) {
  let nameArray = msg.split(" ");
  nameArray.shift();
  let name = nameArray.join(" ");
  name = name.replace(/\s+/g, " ");
  if (!name) {
    name = getRandomName();
  }
  return name;
};
export const getProficiencies = async function (background, classe, race) {
  let profs = Object.keys(background.skillProficiencies[0]);
  if (profs.includes("animal handling")) {
    profs = profs.map((item) =>
      item === "animal handling" ? "Animal Handling" : item
    );
  }
  if (profs.includes("sleight of hand")) {
    profs = profs.map((item) =>
      item === "sleight of hand" ? "Sleight of Hand" : item
    );
  }
  let stringa = profs.toString().replace(/,/g, ", ");
  stringa = stringa.charAt(0).toUpperCase() + stringa.slice(1);
  stringa = makeUpperCaseAfterCommas(stringa);
  let choose;
  let profArray;
  choose = classe.data.proficiency_choices[0].choose;
  profArray = classe.data.proficiency_choices[0].from;
  profArray = profArray?.options.map((element) => element?.item);
  for (let prof of profs) {
    if (profArray?.length) {
      profArray = profArray.filter(function (obj) {
        return (
          obj.name !== "Skill: " + prof.charAt(0).toUpperCase() + prof.slice(1)
        );
      });
    }
  }
  let chosenChoices;
  if (profArray?.length) {
    const shuffled = profArray.sort(() => 0.5 - Math.random());
    chosenChoices = shuffled.slice(0, choose);
    chosenChoices = chosenChoices.map((e) => e.name.replace("Skill: ", ""));
  }
  if (race.data.name === "Half-Elf") {
    let skills = await getSkills();
    skills = skills.data.results;
    for (let prof of chosenChoices) {
      skills = skills.filter(function (obj) {
        return obj.name !== prof.charAt(0).toUpperCase() + prof.slice(1);
      });
    }
    for (let prof of profs) {
      skills = skills.filter(function (obj) {
        return obj.name !== prof.charAt(0).toUpperCase() + prof.slice(1);
      });
    }
    const shuffled2 = skills.sort(() => 0.5 - Math.random());
    let he_profs = shuffled2.slice(0, 2);
    return {
      background: stringa,
      classe: chosenChoices.join(", "),
      race: he_profs.map((e) => e.name).join(", "),
    };
  } else {
    return {
      background: stringa,
      classe: chosenChoices.join(", "),
      race: false,
    };
  }
};
export const getRace = async function () {
  let racesArray = await getRaces();
  let tempRace = randomItem(racesArray.data.results).index;
  let tempStore = raceGlobalArray[tempRace];
  //console.log(tempStore)
  if (tempStore) {
    //console.log('race cachato')
    return tempStore;
  } else {
    //console.log('sto scaricando race')
    raceGlobalArray[tempRace] = await axios.get(
      "http://www.dnd5eapi.co/api/races/" + tempRace
    );
    //console.log(raceGlobalArray[tempRace])
    return raceGlobalArray[tempRace];
  }
  //let race = await axios.get("http://www.dnd5eapi.co/api/races/half-elf")
};
export const getSpellByIndex = async function (index) {
  if (spellsGlobalArray[index]) {
    //console.log('tratto cachato')
    return spellsGlobalArray[index];
  } else {
    //console.log('scarico il tratto')
    spellsGlobalArray[index] = await axios.get(
      "http://www.dnd5eapi.co/api/spells/" + index
    );
    return spellsGlobalArray[index];
  }
};
export const getSubrace = async function (race) {
  if (race.data.subraces.length) {
    let possibleraces = [];
    let random = Math.round(Math.random() * 10);
    race.data.subraces.forEach((subrace) => {
      possibleraces.push(subrace.url);
    });
    if (random > 5) {
      let tempSubrace = randomItem(possibleraces);
      let tempStore = subracesGlobalArray[tempSubrace];
      if (tempStore) {
        //console.log('subrace cachato')
        return tempStore;
      } else {
        //console.log('sto scaricando subrace')
        subracesGlobalArray[tempSubrace] = await axios.get(
          "http://www.dnd5eapi.co" + tempSubrace
        );
        return subracesGlobalArray[tempSubrace];
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};
export const getTraits = async function (race, subrace, level) {
  let traitsArray = [];
  let name;
  let desc;
  let raceTrait;
  let subraceTrait;
  let racename;
  let subracename;
  if (race) {
    if (race.data.traits.length !== 0) {
      for (let trait of race.data.traits) {
        raceTrait = await getTraitData(trait.url);
        name = raceTrait.name;
        desc = raceTrait.desc.join(" ");
        racename = race.data.name;
        traitsArray.push({ race: racename, name: name, desc: desc });
      }
    }
  }
  if (subrace) {
    if (subrace.data.racial_traits.length !== 0) {
      for (let trait of subrace.data.racial_traits) {
        subraceTrait = await getTraitData(trait.url);
        name = subraceTrait.name;
        desc = subraceTrait.desc.join(" ");
        subracename = subrace.data.name;
        traitsArray.push({ subrace: subracename, name: name, desc: desc });
      }
    }
  }
  //console.log(traitsArray)
  return traitsArray;
};
