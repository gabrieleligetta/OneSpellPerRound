const utils = require("./utils")

module.exports = {
    getFormattedSpell:function(spell) {
        let Fspell = "<u><b>" + spell.data.name + "</b></u>\n"
        Fspell += spell.data.level + " level " + spell.data.school.name + " " + ((spell.data.ritual === true) ? '(Ritual)' : '') + "\n"
        Fspell += "<b>Casting Time: </b>" + spell.data.casting_time + "\n"
        Fspell += "<b>Range: </b>" + spell.data.range + "\n"
        Fspell += "<b>Components: </b>" + spell.data.components.join(", ") + " (" + ((typeof spell.data.material === 'undefined') ? 'nessun materiale' : spell.data.material) + ")\n"
        Fspell += "<b>Duration: </b>" + ((spell.data.concentration === true) ? 'Concentration,' : '')+" "+ spell.data.duration + "\n"
        let classes = ""
        spell.data.classes.forEach((element,index) => ((index > 0) ? classes+=', '+element.name : classes+=element.name))
        Fspell += "<b>Classes: </b>"+ classes + "\n"
        Fspell += "<b>Description:\n</b>" + spell.data.desc + "\n"
        Fspell += ((typeof spell.data.higher_level === 'undefined' || spell?.data?.higher_level.length === 0) ? '' : "<b>Higer Levels:\n</b>" + spell.data.higher_level) + "\n"
        Fspell = utils.replyEscaper(Fspell)
        return Fspell;
    },
    getFormattedReply:function(character) {
    let reply = "<b>NAME: </b>" + character.name
    reply += "\n<b>CLASS: </b>" + character.classe.data.name + " " + character.level + "\n"
    if (character.scores) {
        reply +=
            "\n<b>STR: </b>" + character.scores['STR'] +
            "\n<b>DEX: </b>" + character.scores['DEX'] +
            "\n<b>CON: </b>" + character.scores['CON'] +
            "\n<b>INT: </b>" + character.scores['INT'] +
            "\n<b>WIS: </b>" + character.scores['WIS'] +
            "\n<b>CHA: </b>" + character.scores['CHA'] + "\n"
    }
    reply += "\n<b>RACE: </b>" + character.race.data.name
    if (character.traits) {
        reply += "\n<b>RACE TRAITS: </b>"
        for( let trait of character.traits) {
            if (trait.race) {
                reply += "\n<b>" + trait.name + ":</b>\n" + trait.desc + "\n"
            }
        }

        if (character.subrace) {
            reply += "\n<b>SUBRACE: </b>" + character.subrace.data.name + "\n" + "\n<b>SUBRACE TRAITS: </b>"
            for( let trait of character.traits) {
                if (trait.subrace) {
                    reply += "\n<b>" + trait.name + ":</b>\n" + trait.desc + "\n"
                }
            }
        }
    }
    reply += "\n<b>BACKGROUND: </b>" + character.background.true_back.name
    reply += "\n<b><u>" + character.background.feature.name + "</u></b>\n" + character.background.feature.entries.join(' ') + "\n"


    reply += "\n<b>BACKGROUND PROFICIENCIES: </b>\n" + character.proficiencies.background + "\n"
    reply += "\n<b>CLASS PROFICIENCIES: </b>\n" + character.proficiencies.classe + "\n"
    if (character.proficiencies.race != false) {
        reply += "\n<b>RACE PROFICIENCIES: </b>\n" + character.proficiencies.race + "\n"
    }
    reply = utils.replyEscaper(reply)
    return reply;
}
};
