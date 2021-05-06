const axios = require("axios");

//Global Variables caching system
let classesGlobal
let scoresGlobal
let skillsGlobal
let spellsGlobal
let racesGlobal
let traitsGlobalArray = []
//Global Variables caching system



module.exports = {
    getAbilityScores:async function() {
        if (scoresGlobal) {
            //console.log('abilities cachato')
            return scoresGlobal
        } else {
            //console.log('sto scaricando abilities')
            return scoresGlobal = await axios.get("http://www.dnd5eapi.co/api/ability-scores/")
        }
    },
    getClasses:async function() {
        if (classesGlobal) {
            //console.log('classes cachato')
            return classesGlobal
        } else {
            //console.log('sto scaricando classes')
            classesGlobal = await axios.get("http://www.dnd5eapi.co/api/classes/")
            return classesGlobal
        }
    },
    getRaces:async function() {
        if (racesGlobal) {
            //console.log('races cachato')
            return racesGlobal
        } else {
            //console.log('sto scaricando races')
            racesGlobal = await axios.get("http://www.dnd5eapi.co/api/races/")
            return racesGlobal
        }
    },
    getSkills:async function () {
        if (skillsGlobal) {
            //console.log('skills cachato')
            return skillsGlobal
        } else {
            //console.log('sto scaricando skills')
            skillsGlobal = await axios.get("http://www.dnd5eapi.co/api/skills/")
            return skillsGlobal
        }
    },
    getSpells:async function(){
        if (spellsGlobal) {
            //console.log('skills cachato')
            return spellsGlobal
        } else {
            //console.log('sto scaricando skills')
            spellsGlobal = await axios.get("http://www.dnd5eapi.co/api/spells/")
            return spellsGlobal
        }
    },
    getTraitData:async function(url) {
        if (traitsGlobalArray[url]) {
            //console.log('tratto cachato')
            return traitsGlobalArray[url]
        } else {
            //console.log('scarico il tratto')
            traitsGlobalArray[url] = (await axios.get("http://www.dnd5eapi.co" + url)).data
            return traitsGlobalArray[url]
        }
    },

};
