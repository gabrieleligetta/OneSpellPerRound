// noinspection DuplicatedCode
const cache = require("./cache")
const randomItem = require("random-item")
const utils = require("./utils")

function addRaceScores(race,subrace,scores) {
    race.data.ability_bonuses.forEach((ability_bonus) => {
        if (ability_bonus.ability_score.name in scores) {
            let bonus = ability_bonus.bonus
            let name = ability_bonus.ability_score.name
            //console.log(race.data.name, name, bonus)
            scores[name] += bonus
        }
    })

    if (subrace) {
        subrace.data.ability_bonuses.forEach((ability_bonus) => {
            if (ability_bonus.ability_score.name in scores) {
                let bonus = ability_bonus.bonus
                let name = ability_bonus.ability_score.name
                //console.log(subrace.data.name, name, bonus)
                scores[name] += bonus
            }
        })
    }
    return scores
}

module.exports = {
    getBestScores: async function(race,subrace,classe) {
        let values = [12, 10, 8]
        let ability = await cache.getAbilityScores()
        let scores = {}
        let abilitiesObj = ability.data.results
        let abone
        let abtwo
        let abthree
        switch (classe.data.name) {

            case 'Barbarian':
                abone = 'STR'
                abtwo = 'CON'
                abthree = randomItem(['DEX','CHA','WIS'])
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Bard':
                abone = 'CHA'
                abtwo = 'DEX'
                abthree = randomItem(['CON','INT','WIS'])
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Cleric':
                abone = 'WIS'
                abtwo = 'CON'
                abthree = randomItem(['DEX','CHA','STR'])
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Druid':
                abone = 'WIS'
                abtwo = 'CON'
                abthree = randomItem(['DEX','INT','CHA'])
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Fighter':
                let figabi = ['STR','DEX']
                let figabitwo = ['COS','INT']
                abone = randomItem(figabi)
                figabi = figabi.filter(v => v !== abone);
                abtwo = randomItem(figabitwo)
                figabitwo = figabitwo.filter(v => v !== abtwo);
                abthree = randomItem([...figabi,...figabitwo])
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Monk':
                let monkabi = ['STR','DEX']
                abone = randomItem(monkabi)
                monkabi =  monkabi.filter(v => v !== abone);
                abtwo = 'WIS'
                abthree = randomItem(monkabi.concat(['INT','CON']))
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Paladin':
                abone = 'STR'
                abtwo = 'CHA'
                abthree = randomItem(['DEX','INT','CON'])
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Ranger':
                let rangerabi = ['DEX','STR']
                abone = randomItem(rangerabi)
                abtwo = 'WIS'
                abthree = randomItem(rangerabi.concat(['CON']))
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Rogue':
                let rogueabi = ['INT','CHA']
                abone = 'DEX'
                abtwo = randomItem(rogueabi)
                abthree = 'CON'
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Sorcerer':
                abone = 'CHA'
                abtwo = 'CON'
                abthree = randomItem(['DEX','INT','WIS'])
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Warlock':
                abone = 'CHA'
                abtwo = 'CON'
                abthree = randomItem(['DEX','INT','WIS'])
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
            case 'Wizard':
                let wizabi = ['COS','DEX','CAR']
                abone = 'INT'
                abtwo = randomItem(wizabi)
                wizabi = wizabi.filter(v => v !== abtwo);
                abthree = randomItem(wizabi)
                scores[abone] = 15
                scores[abtwo] = 14
                scores[abthree] = 13
                abilitiesObj = abilitiesObj.filter(function( obj ) {
                    return obj.name !== abone && obj.name !== abtwo && obj.name !== abthree
                })
                break;
        }
        abilitiesObj.forEach((element) => {
            let temp = randomItem(values)
            scores[element.name] = temp
            let index = values.indexOf(temp)
            if (index > -1) {
                values.splice(index, 1)
            }
        })
        return addRaceScores(race,subrace,scores)
    },
    getRolledScores:async function(race, subrace) {
        let ability = await cache.getAbilityScores()
        let values = []
        //let rolling = []
        let i
        let scores = {}
        for (i = 0; i < 7; i++) {
            //rolling = [abstractDice(1,6),abstractDice(1,6),abstractDice(1,6),abstractDice(1,6)]
            // rolling = rolling.sort().filter((_,i) => i)
            // let sum = rolling.reduce(function(a, b){
            //     return a + b;
            // }, 0);
            // values.push(sum)
            values.push(utils.abstractDice(1,6)+utils.abstractDice(1,6)+utils.abstractDice(1,6))
        }
        values = utils.removeSmallest(values)
        ability.data.results.forEach((element) => {
            let temp = randomItem(values)
            scores[element.name] = temp
            let index = values.indexOf(temp)
            if (index > -1) {
                values.splice(index, 1)
            }
        })

        return addRaceScores(race,subrace,scores)
    },
    getStandardScores:async function(race,subrace) {
        let values = [15, 14, 13, 12, 10, 8]
        let ability = await cache.getAbilityScores()
        let scores = {}
        ability.data.results.forEach((element) => {
            let temp = randomItem(values)
            scores[element.name] = temp
            let index = values.indexOf(temp)
            if (index > -1) {
                values.splice(index, 1)
            }
        })
        return addRaceScores(race,subrace,scores)
    }
};
