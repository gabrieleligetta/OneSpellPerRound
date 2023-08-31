import randomItem from "random-item";

export const getSpell = async function (index) {
  switch (index) {
    case "random":
      let spellsArray = await getSpells();
      let index = randomItem(spellsArray.data.results).index;
      let spell = await factory.getSpellByIndex(index);
      return (spell = formatter.getFormattedSpell(spell));
  }
};
