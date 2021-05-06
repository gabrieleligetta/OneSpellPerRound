const formatter = require("./formatter")
const factory = require("./factory")
const scoresClass = require("./scores")


module.exports = {
    getStandardChar:async function(msg,level,mode) {
        let name = factory.getName(msg)
        let classe = await factory.getClass(level) //cachato
        let race = await factory.getRace() //cachato
        let subrace = await factory.getSubrace(race) //cachato
        let traits = await factory.getTraits(race,subrace,level)
        let scores //cachato
        switch (mode) {
            case 'standard':
                scores = await scoresClass.getStandardScores(race,subrace)
                break
            case 'rolled':
                scores = await scoresClass.getRolledScores(race,subrace)
                break
            case 'best':
                scores = await scoresClass.getBestScores(race,subrace,classe)
                break
            default:
                scores = await scoresClass.getStandardScores(race,subrace)
        }
        let background =  factory.getBackground() //locale
        let proficiencies = await factory.getProficiencies(background.char_background,classe,race) //cachato
        let character = {
            name : name,
            level: level,
            classe : classe,
            race : race,
            traits : traits,
            subrace : subrace,
            scores : scores,
            background : background,
            proficiencies : proficiencies
        }
        return formatter.getFormattedReply(character);
    }
};
