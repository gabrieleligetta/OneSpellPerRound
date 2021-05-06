const cache = require("./cache");
const formatter = require("./formatter");
const randomItem = require("random-item");
const factory = require("./factory")


module.exports = {
    getSpell:async function(index) {
        switch (index) {
            case 'random':
                let spellsArray = await cache.getSpells()
                let index = randomItem(spellsArray.data.results).index
                let spell = await factory.getSpellByIndex(index)
                return spell = formatter.getFormattedSpell(spell)
                break
        }
    }
};

