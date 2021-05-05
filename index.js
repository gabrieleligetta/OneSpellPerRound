const telegraf = require('telegraf')
const axios = require('axios')
const randomItem = require('random-item')
const faker = require('faker')
//const cron = require('node-cron')
const express = require('express')
const path = require('path')
require('dotenv').config()
const token = process.env.BOT_TOKEN
const PORT = process.env.PORT || 5000
const fs = require('fs');
let rawbackgrounds = fs.readFileSync('backgrounds.json')
let quotes = require("./quotes")



//Global Variables caching system
let racesGlobal
let classesGlobal
let scoresGlobal
let skillsGlobal
let backgroundsGlobal = JSON.parse(rawbackgrounds.toString())
let traitsGlobalArray = []
let raceGlobalArray = []
let classGlobalArray = []
let subracesGlobalArray = []
//Global Variables caching system

//Heroku deploy port
express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
//Heroku deploy port

const bot = new telegraf(token)


function getRandomName() {
    return faker.name.findName();
}

function abstractDice(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function makeUpperCaseAfterCommas(str) {
    return str.replace(/,\s*([a-z])/g, function(d,e) { return ", "+e.toUpperCase() });
}

function replyescaper(reply) {
    reply = reply.split("-").join("\-")
    reply = reply.split(".").join("\.")
    reply = reply.split("(").join("\(")
    reply = reply.split(")").join("\)")
    return reply
}

function removeSmallest(arr) {
    const smallest = Math.min(...arr);
    const index = arr.indexOf(smallest);

    return arr.filter((_, i) => i !== index);
}

async function getFormattedReply(character) {
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
    if (character.race) {
        reply += "\n<b>RACE: </b>" + character.race.data.name
        if (character.race.data.traits.length != 0) {
            reply += "\n<b>RACE TRAITS: </b>"
            for (let trait of character.race.data.traits) {
                let race_data = (await axios.get("http://www.dnd5eapi.co" + trait.url)).data
                reply += "\n<b>" + race_data.name + ":</b>\n" + race_data.desc.join(' ') + "\n"
            }
        }
    }
    if (character.subrace) {
        reply += "\n<b>SUBRACE: </b>" + character.subrace.data.name + "\n" + "\n<b>SUBRACE TRAITS: </b>"
        for (let trait of character.subrace.data.racial_traits) {
            let data = (await axios.get("http://www.dnd5eapi.co" + trait.url)).data
            reply += "\n<b>" + data.name + ":</b>\n" + data.desc.join(' ') + "\n"
        }
    }
    reply += "\n<b>BACKGROUND: </b>" + character.background.true_back.name
    reply += "\n<b><u>" + character.background.feature.name + "</u></b>\n" + character.background.feature.entries.join(' ') + "\n"


    reply += "\n<b>BACKGROUND PROFICIENCIES: </b>\n" + character.proficiencies.background + "\n"
    reply += "\n<b>CLASS PROFICIENCIES: </b>\n" + character.proficiencies.classe + "\n"
    if (character.proficiencies.race != false) {
        reply += "\n<b>RACE PROFICIENCIES: </b>\n" + character.proficiencies.race + "\n"
    }
    reply = replyescaper(reply)
    return reply;
}

async function getStandardChar(msg,level,mode) {
      let name = getName(msg)
      let classe = await getClass(level) //cachato
      let race = await getRace() //cachato
      let subrace = await getSubrace(race) //cachato
      let scores //cachato
          switch (mode) {
              case 'standard':
                  scores = await getStandardScores(race,subrace)
                  break
              case 'rolled':
                  scores = await getRolledScores(race,subrace)
                  break
              case 'best':
                  scores = await getBestScores(race,subrace,classe)
                  break
              default:
                  scores = await getStandardScores(race,subrace)
          }
      let background = await getBackground() //locale
      let proficiencies = await getProficiencies(background.char_background,classe,race) //cachato
      let character = {
        name : name,
        level: level,
        classe : classe,
        race : race,
        subrace : subrace,
        scores : scores,
        background : background,
        proficiencies : proficiencies
        }
  return await getFormattedReply(character); //cachato
 }

async function getFormattedSpell(spell) {

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
    Fspell += ((typeof spell.data.higher_level === 'undefined') ? '' : "<b>Higer Levels:\n</b>" + spell.data.higher_level) + "\n"
    return Fspell;
}

function getName(msg) {
    let nameArray = msg.split(' ')
    nameArray.shift()
    let name = nameArray.join(' ')
    name = name.replace(/\s+/g, ' ')
    if (!name) {
        name = getRandomName();
    }
    return name
}

async function getClasses() {
    if (classesGlobal) {
        //console.log('classes cachato')
        return classesGlobal
    } else {
        //console.log('sto scaricando classes')
        classesGlobal = await axios.get("http://www.dnd5eapi.co/api/classes/")
        return classesGlobal
    }
}

async function getClass(charLevel) {
    let classesArray = await getClasses()
    let tempClass = randomItem(classesArray.data.results).index
    let tempStore = classGlobalArray[tempClass]
    //console.log(tempStore)
    if (tempStore) {
        //console.log('class cachato')
        return tempStore
    } else {
        //console.log('sto scaricando class')
        classGlobalArray[tempClass] =  await axios.get("http://www.dnd5eapi.co/api/classes/" + tempClass)
        //console.log(raceGlobalArray[tempRace])
        return classGlobalArray[tempClass]
    }
}

async function getRaces() {
    if (racesGlobal) {
        //console.log('races cachato')
        return racesGlobal
    } else {
        //console.log('sto scaricando races')
        racesGlobal = await axios.get("http://www.dnd5eapi.co/api/races/")
        return racesGlobal
    }
}

 async function getRace() {
    let racesArray = await getRaces()
     let tempRace = randomItem(racesArray.data.results).index
     let tempStore = raceGlobalArray[tempRace]
     //console.log(tempStore)
     if (tempStore) {
         //console.log('race cachato')
        return tempStore
     } else {
         //console.log('sto scaricando race')
         raceGlobalArray[tempRace] =  await axios.get("http://www.dnd5eapi.co/api/races/" + tempRace)
         //console.log(raceGlobalArray[tempRace])
         return raceGlobalArray[tempRace]
     }
     //let race = await axios.get("http://www.dnd5eapi.co/api/races/half-elf")

 }

async function getSubrace(race) {
    if (race.data.subraces.length) {
        let possibleraces = []
        let random = Math.round(Math.random() * 10)
        race.data.subraces.forEach((subrace) => {
            possibleraces.push(subrace.url)
        })
        if (random > 5) {
            let tempSubrace = randomItem(possibleraces)
            let tempStore = subracesGlobalArray[tempSubrace]
            if (tempStore) {
                //console.log('subrace cachato')
                return tempStore
            } else {
                //console.log('sto scaricando subrace')
                subracesGlobalArray[tempSubrace] =  await axios.get("http://www.dnd5eapi.co" + tempSubrace)
                return subracesGlobalArray[tempSubrace]
            }
        } else {
           return false
        }
    } else {
        return false
    }
}

async function getAbilityScores() {
    if (scoresGlobal) {
        //console.log('abilities cachato')
        return scoresGlobal
    } else {
        //console.log('sto scaricando abilities')
        return scoresGlobal = await axios.get("http://www.dnd5eapi.co/api/ability-scores/")
    }
}

async function getStandardScores(race,subrace) {
    let values = [15, 14, 13, 12, 10, 8]
    let ability = await getAbilityScores()
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

function removeFromArray(array,value) {
    let index = array.indexOf(value)
    return array.slice(index,1)
}

async function getBestScores(race,subrace,classe) {
    let values = [12, 10, 8]
    let ability = await getAbilityScores()
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
            figabi = removeFromArray(figabi,abone)
            abtwo = randomItem(figabitwo)
            figabitwo = removeFromArray(figabitwo,abtwo)
            abthree = randomItem(figabi.concat(figabitwo))
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
            monkabi = removeFromArray(monkabi,abone)
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
            wizabi = removeFromArray(wizabi,abtwo)
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
}

async function getRolledScores(race, subrace) {
    let ability = await getAbilityScores()
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
        values.push(abstractDice(1,6)+abstractDice(1,6)+abstractDice(1,6))
    }
    values = removeSmallest(values)
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

async function getBackground() {
    let backgrounds = backgroundsGlobal
    //console.log(backgrounds)
    let vanillaback = []
    let true_back
    backgrounds.background.forEach((element) => {
        if (element.source == "PHB") {
            if (element.name != "Variant Guild Artisan (Guild Merchant)") {
                //console.log(element.name)
                vanillaback.push(element)
            }
        }
    })
        let char_background = randomItem(vanillaback)

        if (char_background.name.includes("Variant")) {
            //console.log(char_background)
            true_back = char_background._copy.name
            let feature
            let back
            for (back of vanillaback) {
                if (back.name == true_back) {
                    true_back = char_background
                    char_background = back
                    if (Array.isArray(true_back._copy._mod.entries)) {
                        feature = true_back._copy._mod.entries[1].items
                    } else {
                        feature = true_back._copy._mod.entries.items
                    }
                    return {true_back:true_back,feature:feature,char_background:char_background}
                }
            }
        } else {
            let feature = char_background.entries[1]
            return {
                true_back:char_background,
                feature:feature,
                char_background:char_background
            }
        }
}

async function getSkills() {
    if (skillsGlobal) {
        //console.log('skills cachato')
        return skillsGlobal
    } else {
        //console.log('sto scaricando skills')
        skillsGlobal = await axios.get("http://www.dnd5eapi.co/api/skills/")
        return skillsGlobal
    }
}

async function getProficiencies(background,classe,race) {
    let profs = Object.keys(background.skillProficiencies[0])
    if (profs.includes('animal handling')) {
        profs = profs.map(item => item == 'animal handling' ? 'Animal Handling' : item)
    }
    if (profs.includes('sleight of hand')) {
        profs = profs.map(item => item == 'sleight of hand' ? 'Sleight of Hand' : item)
    }
    let stringa = profs.toString().replace(/,/g, ", ").capitalize()
    stringa = makeUpperCaseAfterCommas(stringa)
    let choose
    let profArray
    if (classe.data.name != 'Monk') {
         choose = classe.data.proficiency_choices[0].choose
         profArray = classe.data.proficiency_choices[0].from
    } else {
         choose = classe.data.proficiency_choices[2].choose
         profArray = classe.data.proficiency_choices[2].from
    }
    for (let prof of profs) {
        profArray = profArray.filter(function (obj) {
            return obj.name !== 'Skill: ' + prof.capitalize()
        })
    }
    const shuffled = profArray.sort(() => 0.5 - Math.random())
    let chosenChoices = shuffled.slice(0, choose)
    chosenChoices = chosenChoices.map(e => e.name.replace("Skill: ",""))
    if (race.data.name == 'Half-Elf') {
        let skills = await getSkills()
        skills = skills.data.results
        for (let prof of chosenChoices) {
            skills = skills.filter(function (obj) {
                return obj.name !== prof.capitalize() + prof.slice(1)
            })
        }
        for (let prof of profs) {
            skills = skills.filter(function (obj) {
                return obj.name !== prof.capitalize() + prof.slice(1)
            })
        }
        const shuffled2 = skills.sort(() => 0.5 - Math.random())
        let he_profs = shuffled2.slice(0, 2)
        return{background:stringa,classe:chosenChoices.join(", "),race:he_profs.map(e => e.name).join(", ")}
    } else {
        return{background:stringa,classe:chosenChoices.join(", "),race:false}
    }

}

bot.command('randomchar', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //name
    let msg = ctx.message.text
    let charLevel = 1
    //name
    let reply = await getStandardChar(msg,charLevel,'standard')
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.command('randomrolledchar', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //name
    let msg = ctx.message.text
    let charLevel = 1
    //name
    let reply = await getStandardChar(msg,charLevel,'rolled')
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.command('randombestchar', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //name
    let msg = ctx.message.text
    let charLevel = 1
    //name
    let reply = await getStandardChar(msg,charLevel,'best')
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.command('randomspell', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //TODO cachare le spells
    let spellsArray = await axios.get("http://www.dnd5eapi.co/api/spells/")
    let spell = await axios.get("http://www.dnd5eapi.co/api/spells/" + randomItem(spellsArray.data.results).index)
    spell = await getFormattedSpell(spell)
    let reply = replyescaper(spell)
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.help(async ctx => {
    await ctx.reply("This bot can do the following command:\n - /help\n - /randomchar\n - /randomspell\n -/randomrolledchar\n -/randombestchar")
})
//TODO trovare la parola trigger anche all'interno delle frasi, non solo quando scritta da sola
bot.hears(['piaga','Piaga','Reame remoto', 'Reame Remoto', 'reame remoto', 'reame Remoto','PIAGA','REAME REMOTO'],(ctx) => ctx.reply("<i>"+quotes.getRandomQuote()+"</i>",{parse_mode: "HTML"}))
bot.hears(['adam','Adamo','Adam', 'adamo','ADAM','ADAMO'], (ctx) => ctx.reply(quotes.getFatherQuote()))
bot.hears(['nyarla','nyarlathotep','Nyarla','Nyarlathotep','NYARLA','NYARLATHOTEP','nyarlatothep','Nyarlatothep',"Araldo","araldo"], (ctx) => ctx.reply("<i>"+quotes.getRandomQuote()+"</i>",{parse_mode: "HTML"}))
bot.hears(['diario','Diario','tomo','Tomo','Quaderno','quaderno','libro','Libro'], (ctx) => ctx.reply(quotes.getBookQuote()))

bot.launch()
