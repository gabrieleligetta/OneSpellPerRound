const telegraf = require('telegraf')
const axios = require('axios')
const randomItem = require('random-item')
//const cron = require('node-cron')
const express = require('express')
const path = require('path')
require('dotenv').config()
const token = process.env.BOT_TOKEN
const PORT = process.env.PORT || 5000
const quotes = require("./quotes")
const utils = require("./utils")
const persona = require("./persona");
const formatter = require("./formatter");

//Heroku deploy port
express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
//Heroku deploy port

const bot = new telegraf(token)

bot.command('randomchar', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //name
    let msg = ctx.message.text
    let charLevel = 1
    //name
    let reply = await persona.getStandardChar(msg,charLevel,'standard')
    //console.log(traitsGlobalArray)
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.command('randomrolledchar', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //name
    let msg = ctx.message.text
    let charLevel = 1
    //name
    let reply = await persona.getStandardChar(msg,charLevel,'rolled')
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.command('randombestchar', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //name
    let msg = ctx.message.text
    let charLevel = 1
    //name
    let reply = await persona.getStandardChar(msg,charLevel,'best')
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.command('randomspell', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //TODO cachare le spells
    let spellsArray = await axios.get("http://www.dnd5eapi.co/api/spells/")
    let spell = await axios.get("http://www.dnd5eapi.co/api/spells/" + randomItem(spellsArray.data.results).index)
    spell = await formatter.getFormattedSpell(spell)
    let reply = utils.replyEscaper(spell)
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
