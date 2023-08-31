import { getFormattedReply } from "./formatter.js";
import {
  getBackground,
  getClass,
  getName,
  getProficiencies,
  getRace,
  getSubrace,
  getTraits,
} from "./factory.js";
import { getBestScores, getRolledScores, getStandardScores } from "./scores.js";

export const getStandardChar = async function (msg, level, mode) {
  let name = getName(msg);
  let classe = await getClass(level); //cachato
  let race = await getRace(); //cachato
  let subrace = await getSubrace(race); //cachato
  let traits = await getTraits(race, subrace, level);
  let scores; //cachato
  switch (mode) {
    case "standard":
      scores = await getStandardScores(race, subrace);
      break;
    case "rolled":
      scores = await getRolledScores(race, subrace);
      break;
    case "best":
      scores = await getBestScores(race, subrace, classe);
      break;
    default:
      scores = await getStandardScores(race, subrace);
  }
  let background = getBackground(); //locale
  let proficiencies = await getProficiencies(
    background.char_background,
    classe,
    race
  ); //cachato
  let character = {
    name: name,
    level: level,
    classe: classe,
    race: race,
    traits: traits,
    subrace: subrace,
    scores: scores,
    background: background,
    proficiencies: proficiencies,
  };
  return getFormattedReply(character);
};
