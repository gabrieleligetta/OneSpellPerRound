const telegraf = require('telegraf')
const cron = require('node-cron')
const express = require('express')
const path = require('path')
const randomFile = require('select-random-file')
require('dotenv').config()
const token = process.env.BOT_TOKEN
const PORT = process.env.PORT || 5000
const quotes = require("./quotes")
const persona = require("./persona")
const spell = require("./spell")
const utils = require("./utils")
let USERS_CACHE = [481189001,-1001845883499];
require("./images");
const chatgpt = require("./chatgpt");
const {generateMartaPrompt} = require("./chatgpt");
const {generateEpisodeFormat} = require("./chatgpt");
const {Prompts, chunk} = require("./utils");
let MARTA_EPISODE_PROMPT = null;
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
    let msg = ctx.message.text
    let charLevel = 1
    let reply = await persona.getStandardChar(msg,charLevel,'standard')
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

bot.command('beSilly', async (ctx) => {
    if (!MARTA_EPISODE_PROMPT) {
        MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
        console.log("MARTA_EPISODE_PROMPT")
        console.log(MARTA_EPISODE_PROMPT)
    }
    console.log("sono nel beSilly")
    console.log("MARTA_EPISODE_PROMPT")
    console.log(MARTA_EPISODE_PROMPT)
    const richiesta = generateMartaPrompt(MARTA_EPISODE_PROMPT);
    console.log("richiesta")
    console.log(richiesta)
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    let reply = await chatgpt.prompt({text: richiesta, temperature: 1.0}, Prompts.MartaLaPapera, "gpt-3.5-turbo-16k");
    await ctx.telegram.sendMessage(ctx.chat.id,
        "Le avventure di Marta, la papera col cappello da strega:")
    for (const part of chunk(reply, 4096)) {
        await ctx.telegram.sendMessage(ctx.chat.id,part);
    }
})
bot.command('bSB', async (ctx) => {
    await raccontoDiMartaBroadcast();
})

bot.command('PromptUpdate', async (ctx) => {
    MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
    console.log("MARTA_EPISODE_PROMPT")
    console.log(MARTA_EPISODE_PROMPT)
    await ctx.telegram.sendMessage(ctx.chat.id,JSON.stringify(MARTA_EPISODE_PROMPT));
})


bot.help(async ctx => {
    await ctx.reply("This bot can do the following commands:\n" +
        " - /help\n" +
        " - /randomchar\n" +
        " - /randomspell\n" +
        " -/randomrolledchar\n" +
        " -/randombestchar")
})

cron.schedule('0 10 * * *', async () => {
    await randomSpellBroadcast();
});

cron.schedule('30 16 * * *', async () => {
    console.log("sono nel chron di Marta")
    await raccontoDiMartaBroadcast();
});

cron.schedule('0 1 * * *', async () => {
    console.log("sono nel chron di MARTA_EPISODE_PROMPT")
    MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
    console.log("MARTA_EPISODE_PROMPT")
    console.log(MARTA_EPISODE_PROMPT)
});

const randomSpellBroadcast = async () => {
    const richiesta = "rispondimi solo con una battuta divertente a tema fantasy senza che sembri la risposta di un bot"
    if (USERS_CACHE.length) {
        let battuta = await chatgpt.prompt({text: richiesta, temperature: 1.1},Prompts.BattuteDnD);
        if (!battuta) {
            battuta = "Oh no! Qualcosa non ha funzionato!"
        }
        for (const chatId of USERS_CACHE) {
            await bot.telegram.sendMessage(chatId, "Ecco la battuta cringe del giorno!")
            await bot.telegram.sendMessage(chatId,battuta)
            await bot.telegram.sendMessage(chatId, "Ecco la spell del giorno!")
            await bot.telegram.sendChatAction(chatId, 'typing')
            let reply = await spell.getSpell('random')
            await bot.telegram.sendMessage(chatId, reply, {parse_mode: "HTML"})
        }
    }
}

const raccontoDiMartaBroadcast = async () => {
    console.log("sono nel raccontoDiMartaBroadcast")
    if (!MARTA_EPISODE_PROMPT) {
        MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
        console.log("MARTA_EPISODE_PROMPT")
        console.log(MARTA_EPISODE_PROMPT)
    }
    console.log("MARTA_EPISODE_PROMPT")
    console.log(MARTA_EPISODE_PROMPT)
    const richiesta = generateMartaPrompt(MARTA_EPISODE_PROMPT);
    console.log("richiesta")
    console.log(richiesta)
    console.log("USERS_CACHE")
    console.log(USERS_CACHE)
    if (USERS_CACHE.length) {
        let reply = await chatgpt.prompt({text: richiesta, temperature: 1.0}, Prompts.MartaLaPapera, "gpt-3.5-turbo-16k");
        if (!reply) {
            reply = "Oh no! Qualcosa non ha funzionato!"
        }
        for (const chatId of USERS_CACHE) {
            await bot.telegram.sendChatAction(chatId, 'typing')
            await bot.telegram.sendMessage(chatId,
                "Le avventure di Marta, la papera col cappello da strega")
            for (const part of chunk(reply, 4096)) {
                await bot.sendMessage(chatId, part);
            }
        }
    }
}

//TODO spostare la funzione in un file apposito
bot.on('text',async (ctx) => {
    USERS_CACHE.push(ctx.chat.id);
    USERS_CACHE = [...new Set(USERS_CACHE)];
    console.log("aggiungo " + ctx.chat.id + " alla cache!");
    console.log("chache:  " + USERS_CACHE);
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
            if (word.toLowerCase() === trigger.toLowerCase() && tomoCounter < 1) {
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
            if (word.toLowerCase() === trigger.toLowerCase() && araldoCounter<1) {
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
            if (word.toLowerCase() === trigger.toLowerCase() && piagaCounter<1) {
                piagaCounter++
                if (utils.abstractDice(1, 10) <= 6) {
                    let dir = './piaga/'
                    randomFile(dir, (err, file) => {
                        let messagePromise = ctx.replyWithPhoto({source: dir + file})
                    })
                } else {
                    if (word.toLowerCase() === trigger.toLowerCase()) {
                        let messagePromise = ctx.reply("<i>" + quotes.getRandomQuote() + "</i>", {parse_mode: "HTML"})
                        console.log(messagePromise)
                    }
                }
            }
        }
        for (let trigger of fatherArray) {
            if (word.toLowerCase() === trigger.toLowerCase() && fatherCounter<1) {
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
