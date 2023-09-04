import randomItem from "random-item";
import { getSpells } from "./cache.js";
import { getSpellByIndex } from "./factory.js";
import { getFormattedSpell } from "./formatter.js";

export const getSpell = async function (index) {
  switch (index) {
    case "random":
      let spellsArray = await getSpells();
      let index = randomItem(spellsArray.data.results);
      let spell = await getSpellByIndex(index?.index);
      return (spell = getFormattedSpell(spell));
  }
};
