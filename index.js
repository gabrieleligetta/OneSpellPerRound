const telegraf = require('telegraf')
//const cron = require('node-cron')
const express = require('express')
const path = require('path')
const randomFile = require('select-random-file')
require('dotenv').config()
const token = process.env.BOT_TOKEN
const PORT = process.env.PORT || 5000
const quotes = require("./quotes")
const persona = require("./persona")
const spell = require("./spell");
const utils = require("./utils")
const image = require("./images");


//Heroku deploy port
express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
//Heroku deploy port
if (token === undefined) {
    throw new Error('BOT_TOKEN must be provided!')
}
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
    let reply = await spell.getSpell('random')
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.help(async ctx => {
    await ctx.reply("This bot can do the following command:\n - /help\n - /randomchar\n - /randomspell\n -/randomrolledchar\n -/randombestchar")
})


//TODO spostare la funzione in un file apposito
bot.on('text',async (ctx) => {
    let msg = ctx.message.text
    let msgArray = msg.split(' ')
    let tomoArray = ['diario','tomo','quaderno','libro']
    let araldoArray = ['nyarla','nyarlathotep','nyarlatothep',"araldo"]
    let fatherArray = ['adam', 'adamo','padre']
    let piagaArray  = ['piaga', 'reame','remoto']
    let tomoCounter = 0
    let araldoCounter = 0
    let fatherCounter = 0
    let piagaCounter = 0
    for (let word of msgArray) {
        for (let trigger of tomoArray) {
            if (word.toLowerCase() == trigger.toLowerCase() && tomoCounter < 1) {
                tomoCounter++
                if (utils.abstractDice(1,10) <= 7 ) {
                    let dir = './tomo_imgs/'
                    randomFile(dir, (err, file) => {
                        let messagePromise = ctx.replyWithPhoto({source: dir+file})
                    })
                } else {
                    let messagePromise = ctx.reply(quotes.getBookQuote())
                    console.log(messagePromise)
                }
            }
        }
        for (let trigger of araldoArray) {
            if (word.toLowerCase() == trigger.toLowerCase() && araldoCounter<1) {
                araldoCounter++
                if (utils.abstractDice(1,10) <= 6 ) {
                    let dir = './nyarla/'
                    randomFile(dir, (err, file) => {
                        let messagePromise = ctx.replyWithPhoto({source: dir+file})
                    })
                } else {
                    let messagePromise = ctx.reply("<i>" + quotes.getRandomQuote() + "</i>", {parse_mode: "HTML"})
                    console.log(messagePromise)
                }
            }
        }
        for (let trigger of piagaArray) {
            if (word.toLowerCase() == trigger.toLowerCase() && piagaCounter<1) {
                piagaCounter++
                if (utils.abstractDice(1, 10) <= 6) {
                    let dir = './piaga/'
                    randomFile(dir, (err, file) => {
                        let messagePromise = ctx.replyWithPhoto({source: dir + file})
                    })
                } else {
                    if (word.toLowerCase() == trigger.toLowerCase()) {
                        let messagePromise = ctx.reply("<i>" + quotes.getRandomQuote() + "</i>", {parse_mode: "HTML"})
                        console.log(messagePromise)
                    }
                }
            }
        }
        for (let trigger of fatherArray) {
            if (word.toLowerCase() == trigger.toLowerCase() && fatherCounter<1) {
                fatherCounter++
                if (utils.abstractDice(1,10) <= 8 ) {
                    let dir = './padre/galassie/'
                    randomFile(dir, (err, file) => {
                    ctx.replyWithPhoto({source: dir + file} , { caption: "<b> ̴͉̰̯̎͑͋ ̶̹̇̑ ̵̜̞̭̏ ̸̣̺́̇ ̷͈͕̪͉̀͠ ̶̦͖́͌ ̷̝͕͚̍ ̵̱̼͗̎̃̒ ̸̭̍̍̚ ̵̨͈̠̓̊͆ ̵̜̥̔̔ ̷͚͠ ̴̛̙̥́̔́ ̸̠̌̒̐͛ ̶̮̼͋̾͝ ̷̧͚̭̖̅̒F̴̠͈̻̈͜ā̶̞͙͈͛́t̶͉̀̔h̴̨̩̲̙͂̍͐e̸̡͈̥̯̒͑r̴͕͈̗͠ͅ ̶̹̬͍̟̅́̈́͝ǐ̸͇̹̝ṣ̴̤̥̄ ̸̲̱̫͝w̶̛̘̠̭̥͌a̷̺͚͚̮͌͛͒̒t̶̠̤̓c̸̮͔̐͠h̵̜͌̑͝i̶̞͓̿̔n̴̬̤̦̾̿͜͝g̴̨̰̃̄ ̷̠͔̩̫̀̓ ̶̖͔̖̺͠ ̴̤͘ͅ ̵̬̳̞̖̓̀̀̿ ̶̞̲̋̈́̈́ ̴̬̙̞̝̿ ̴̨̛̤͓ ̶͎͎̰͎̆ ̶͈͠ ̸̭̘̬̎́ ̷̤̗̯͈͊͐ ̵̞̖̍͝ ̸̜͚̱̺̇ ̷̢͎̼̥̀̚ ̶̡̖̜̀͌͝ ̵̻͖̪̘̒͌̊͝ ̴̧͈̎ ̸̬̓ ̵̧̝̫̉͐̄͠ ̶̧̠͔͉̈́͆̚</b>" ,parse_mode: "HTML"})
                })
                } else {
                    await ctx.reply(quotes.getFatherQuote())
                }
            }
        }

    }
})


bot.launch()
