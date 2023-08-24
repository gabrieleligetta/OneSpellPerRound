const telegraf = require("telegraf");
const cron = require("node-cron");
const express = require("express");
const path = require("path");
const randomFile = require("select-random-file");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const quotes = require("./quotes");
const persona = require("./persona");
const spell = require("./spell");
const utils = require("./utils");
let USERS_CACHE = [481189001, -1001845883499];
require("./images");
const chatgpt = require("./chatgpt");
const {
  generateMartaPrompt,
  generateNewMartaPrompt,
  generateIntroducktion,
  generateTrial,
  generateEpisodeFinale,
} = require("./chatgpt");
const { generateEpisodeFormat } = require("./chatgpt");
const { Prompts, chunk, makeid, abstractDice } = require("./utils");
const { Markup, session } = require("telegraf");
const { tr } = require("faker/lib/locales");
let MARTA_EPISODE_PROMPT = {
  episodeFormat: "autoconclusivo",
  enemy: " Dragonne",
  boss: " Tiamat",
  supportCharacters: ["Leo il lupo coraggioso", "Lucia la gatta ballerina"],
  events: [
    "Incendio distrugge mercato nel Villaggio delle Streghe",
    " Invasione di draghi nel Villaggio delle Streghe",
    " Crollo di una torre a causa di una dragone nel Villaggio delle Streghe",
    " Fuga di massa a causa di un attacco di dragone nel Villaggio delle Streghe",
    " Distruzione di una casa a causa di un dragone nel Villaggio delle Streghe",
    " Panico generale causato da un dragone nel Villaggio delle Streghe",
    " Attacco di dragone al castello nel Villaggio delle Streghe",
    " Danni alle coltivazioni a causa di un dragone nel Villaggio delle Streghe",
    " Feriti a seguito di un attacco di dragone nel Villaggio delle Streghe",
    " ",
  ],
  startPlace: " Villaggio delle Streghe",
  enemyPlace: " Aokigahara Forest",
  trialsOfHeroes: [
    "Caduta da altezza",
    " combattimento con spade",
    " furia distruttiva",
    " abilità di volo",
    " controllo del fuoco",
    " teletrasporto",
    " manipolazione mentale",
    " invisibilità",
    " guarigione istantanea",
    " controllo elementale",
  ],
};
let uniqueAction = makeid(8);
let uniqueActionArray = [];
//Heroku deploy port
express()
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
//Heroku deploy port
const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}
const bot = new telegraf(token);

bot.use(session());

bot.command("randomchar", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let msg = ctx.message.text;
  let charLevel = 1;
  let reply = await persona.getStandardChar(msg, charLevel, "standard");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("randomrolledchar", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  //name
  let msg = ctx.message.text;
  let charLevel = 1;
  //name
  let reply = await persona.getStandardChar(msg, charLevel, "rolled");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("randombestchar", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  //name
  let msg = ctx.message.text;
  let charLevel = 1;
  //name
  let reply = await persona.getStandardChar(msg, charLevel, "best");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("randomspell", async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let reply = await spell.getSpell("random");
  await ctx.telegram.sendMessage(ctx.chat.id, reply, { parse_mode: "HTML" });
});

bot.command("beSilly", async (ctx) => {
  if (!MARTA_EPISODE_PROMPT) {
    MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
  }
  const richiesta = generateNewMartaPrompt(MARTA_EPISODE_PROMPT);
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let reply = await chatgpt.prompt(
    { text: richiesta, temperature: 1.0 },
    Prompts.MartaLaPapera,
    "gpt-4"
  );
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    "Le avventure di Marta, la papera col cappello da strega:"
  );
  for (const part of chunk(reply, 4096)) {
    await ctx.telegram.sendMessage(ctx.chat.id, part);
  }
});

bot.command("enterDungeon", async (ctx) => {
  if (!MARTA_EPISODE_PROMPT) {
    MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
  }
  ctx.session.dungeonData = 0;
  const richiesta = generateIntroducktion(MARTA_EPISODE_PROMPT);
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  let reply = await chatgpt.promptForMarta(
    richiesta,
    1,
    "gpt-3.5-turbo",
    ctx.session.dungeonData,
    ctx.chat.id,
    true
  );
  for (const part of chunk(reply, 4096)) {
    await ctx.telegram.sendMessage(ctx.chat.id, part);
  }
  const difficulty = abstractDice(5, 15);
  uniqueAction = makeid(8);
  uniqueActionArray.push(uniqueAction);
  ctx.session.dungeonData = 1;
  const firstTrial = generateTrial(
    MARTA_EPISODE_PROMPT,
    "la prima prova",
    difficulty,
    ctx.session.dungeonData
  );
  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  reply = await chatgpt.promptForMarta(
    firstTrial,
    1,
    "gpt-3.5-turbo",
    ctx.session.dungeonData,
    ctx.chat.id
  );
  for (const part of chunk(reply, 4096)) {
    await ctx.telegram.sendMessage(ctx.chat.id, part);
  }
  await ctx.reply(
    "La Difficolta della prova è : " +
      (difficulty + ctx.session.dungeonData) +
      " (" +
      difficulty +
      "+" +
      ctx.session.dungeonData +
      ")"
  );
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    "Cosa Vuoi Fare?",
    Markup.inlineKeyboard([
      Markup.callbackButton("Tira Il Dado", "rollDice", false),
      // Markup.callbackButton("Suggerisci Azione", "ActionPrompt", false),
    ]).extra()
  );
});

bot.action("rollDice", async (ctx, next) => {
  console.log("ctx.session.dungeonData");
  console.log(ctx.session.dungeonData);
  if (uniqueActionArray.includes(uniqueAction)) {
    uniqueActionArray = uniqueActionArray.filter((e) => e !== uniqueAction);
    const diceRoll = abstractDice(1, 20);
    await ctx.reply("Hai Rollato: " + diceRoll);
    const prompt = generateDiceRollPrompt(diceRoll);
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
    const reply = await chatgpt.promptForMarta(
      prompt,
      1,
      "gpt-3.5-turbo",
      ctx.session.dungeonData,
      ctx.chat.id
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    await sendFollowUpMessage(ctx);
  } else {
    return ctx.answerCbQuery("You already rolled the dice!");
  }
});

// bot.action("ActionPrompt", (ctx, next) => {
//   if (!uniqueActionArray.includes(uniqueAction)) {
//     uniqueAction = makeid(8);
//     uniqueActionArray.push(uniqueAction);
//     return ctx.reply("👟").then(() => next());
//   }
// });

bot.help(async (ctx) => {
  await ctx.reply(
    "This bot can do the following commands:\n" +
      " - /help\n" +
      " - /randomchar\n" +
      " - /randomspell\n" +
      " -/randomrolledchar\n" +
      " -/randombestchar"
  );
});

cron.schedule("0 10 * * *", async () => {
  await randomSpellBroadcast();
});

cron.schedule("0 16 * * *", async () => {
  console.log("sono nel chron di Marta");
  await raccontoDiMartaBroadcast();
});

cron.schedule("0 1 * * *", async () => {
  console.log("sono nel chron di MARTA_EPISODE_PROMPT");
  MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
  console.log("MARTA_EPISODE_PROMPT");
  console.log(MARTA_EPISODE_PROMPT);
});

const randomSpellBroadcast = async () => {
  const richiesta =
    "rispondimi solo con una battuta divertente a tema fantasy senza che sembri la risposta di un bot";
  if (USERS_CACHE.length) {
    let battuta = await chatgpt.prompt(
      { text: richiesta, temperature: 0.7 },
      Prompts.BattuteDnD
    );
    if (!battuta) {
      battuta = "Oh no! Qualcosa non ha funzionato!";
    }
    for (const chatId of USERS_CACHE) {
      await bot.telegram.sendMessage(
        chatId,
        "Ecco la battuta cringe del giorno!"
      );
      await bot.telegram.sendMessage(chatId, battuta);
      await bot.telegram.sendMessage(chatId, "Ecco la spell del giorno!");
      await bot.telegram.sendChatAction(chatId, "typing");
      let reply = await spell.getSpell("random");
      await bot.telegram.sendMessage(chatId, reply, { parse_mode: "HTML" });
    }
  }
};

const raccontoDiMartaBroadcast = async () => {
  console.log("sono nel raccontoDiMartaBroadcast");
  if (!MARTA_EPISODE_PROMPT) {
    MARTA_EPISODE_PROMPT = await generateEpisodeFormat();
    console.log("MARTA_EPISODE_PROMPT");
    console.log(MARTA_EPISODE_PROMPT);
  }
  console.log("MARTA_EPISODE_PROMPT");
  console.log(MARTA_EPISODE_PROMPT);
  const richiesta = generateNewMartaPrompt(MARTA_EPISODE_PROMPT);
  console.log("richiesta");
  console.log(richiesta);
  console.log("USERS_CACHE");
  console.log(USERS_CACHE);
  if (USERS_CACHE.length) {
    let reply = await chatgpt.prompt(
      {
        text: richiesta,
        temperature: 1.0,
      },
      Prompts.MartaLaPapera,
      "gpt-4"
    );
    if (!reply) {
      reply = "Oh no! Qualcosa non ha funzionato!";
    }
    for (const chatId of USERS_CACHE) {
      await bot.telegram.sendChatAction(chatId, "typing");
      await bot.telegram.sendMessage(
        chatId,
        "Le avventure di Marta, la papera col cappello da strega"
      );
      for (const part of chunk(reply, 4096)) {
        await bot.telegram.sendMessage(chatId, part);
      }
    }
  }
};

const sendFollowUpMessage = async (ctx) => {
  if (ctx.session.dungeonData === 1) {
    ctx.session.dungeonData++;
    uniqueAction = makeid(8);
    const difficulty = abstractDice(5, 15);
    uniqueAction = makeid(8);
    uniqueActionArray.push(uniqueAction);
    const secondTrial = generateTrial(
      MARTA_EPISODE_PROMPT,
      "la seconda prova",
      difficulty,
      ctx.session.dungeonData
    );
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
    const reply = await chatgpt.promptForMarta(
      secondTrial,
      1,
      "gpt-3.5-turbo",
      ctx.session.dungeonData,
      ctx.chat.id
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    await ctx.reply(
      "La Difficolta della prova è : " +
        (difficulty + ctx.session.dungeonData) +
        " (" +
        difficulty +
        "+" +
        ctx.session.dungeonData +
        ")"
    );
    await ctx.telegram.sendMessage(
      ctx.chat.id,
      "Cosa Vuoi Fare?",
      Markup.inlineKeyboard([
        Markup.callbackButton("Tira Il Dado", "rollDice", false),
        // Markup.callbackButton("Suggerisci Azione", "ActionPrompt", false),
      ]).extra()
    );
  } else if (ctx.session.dungeonData === 2) {
    ctx.session.dungeonData++;
    uniqueAction = makeid(8);
    const difficulty = abstractDice(5, 15);
    uniqueAction = makeid(8);
    uniqueActionArray.push(uniqueAction);
    const thirdTrial = generateTrial(
      MARTA_EPISODE_PROMPT,
      "la terza e ultima prova",
      difficulty,
      ctx.session.dungeonData
    );
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
    const reply = await chatgpt.promptForMarta(
      thirdTrial,
      1,
      "gpt-3.5-turbo",
      ctx.session.dungeonData,
      ctx.chat.id
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
    await ctx.reply(
      "La Difficolta della prova è : " +
        (difficulty + ctx.session.dungeonData) +
        " (" +
        difficulty +
        "+" +
        ctx.session.dungeonData +
        ")"
    );
    await ctx.telegram.sendMessage(
      ctx.chat.id,
      "Cosa Vuoi Fare?",
      Markup.inlineKeyboard([
        Markup.callbackButton("Tira Il Dado", "rollDice", false),
        // Markup.callbackButton("Suggerisci Azione", "ActionPrompt", false),
      ]).extra()
    );
  } else if (ctx.session.dungeonData === 3) {
    ctx.session.dungeonData++;
    uniqueAction = makeid(8);
    const finale = generateEpisodeFinale(MARTA_EPISODE_PROMPT);
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
    const reply = await chatgpt.promptForMarta(
      finale,
      1,
      "gpt-3.5-turbo",
      ctx.session.dungeonData,
      ctx.chat.id
    );
    for (const part of chunk(reply, 4096)) {
      await ctx.telegram.sendMessage(ctx.chat.id, part);
    }
  }
};

const generateDiceRollPrompt = (roll) => {
  return (
    "Raccontami nel dettaglio di come la prova è stata superata o fallita, impersonando il game Master, considerando che è stato tirato un d20 è il risultato è: " +
    roll +
    ", utilizza al massimo 150 parole"
  );
};

//TODO spostare la funzione in un file apposito
bot.on("text", async (ctx) => {
  USERS_CACHE.push(ctx.chat.id);
  USERS_CACHE = [...new Set(USERS_CACHE)];
  console.log("aggiungo " + ctx.chat.id + " alla cache!");
  console.log("chache:  " + USERS_CACHE);
  let msg = ctx.message.text;
  let msgArray = msg.split(" ");
  let tomoArray = ["diario", "tomo", "quaderno", "libro"];
  let araldoArray = ["nyarla", "nyarlathotep", "nyarlatothep", "araldo"];
  let fatherArray = ["adam", "adamo", "padre"];
  let piagaArray = ["piaga", "reame", "remoto"];
  let tomoCounter = 0;
  let araldoCounter = 0;
  let fatherCounter = 0;
  let piagaCounter = 0;
  for (let word of msgArray) {
    for (let trigger of tomoArray) {
      if (word.toLowerCase() === trigger.toLowerCase() && tomoCounter < 1) {
        tomoCounter++;
        if (utils.abstractDice(1, 10) <= 7) {
          let dir = "./tomo_imgs/";
          randomFile(dir, (err, file) => {
            let messagePromise = ctx.replyWithPhoto({ source: dir + file });
          });
        } else {
          let messagePromise = ctx.reply(quotes.getBookQuote());
          console.log(messagePromise);
        }
      }
    }
    for (let trigger of araldoArray) {
      if (word.toLowerCase() === trigger.toLowerCase() && araldoCounter < 1) {
        araldoCounter++;
        if (utils.abstractDice(1, 10) <= 6) {
          let dir = "./nyarla/";
          randomFile(dir, (err, file) => {
            let messagePromise = ctx.replyWithPhoto({ source: dir + file });
          });
        } else {
          let messagePromise = ctx.reply(
            "<i>" + quotes.getRandomQuote() + "</i>",
            { parse_mode: "HTML" }
          );
          console.log(messagePromise);
        }
      }
    }
    for (let trigger of piagaArray) {
      if (word.toLowerCase() === trigger.toLowerCase() && piagaCounter < 1) {
        piagaCounter++;
        if (utils.abstractDice(1, 10) <= 6) {
          let dir = "./piaga/";
          randomFile(dir, (err, file) => {
            let messagePromise = ctx.replyWithPhoto({ source: dir + file });
          });
        } else {
          if (word.toLowerCase() === trigger.toLowerCase()) {
            let messagePromise = ctx.reply(
              "<i>" + quotes.getRandomQuote() + "</i>",
              { parse_mode: "HTML" }
            );
            console.log(messagePromise);
          }
        }
      }
    }
    for (let trigger of fatherArray) {
      if (word.toLowerCase() === trigger.toLowerCase() && fatherCounter < 1) {
        fatherCounter++;
        if (utils.abstractDice(1, 10) <= 8) {
          let dir = "./padre/galassie/";
          randomFile(dir, (err, file) => {
            ctx.replyWithPhoto(
              { source: dir + file },
              {
                caption:
                  "<b> ̴͉̰̯̎͑͋ ̶̹̇̑ ̵̜̞̭̏ ̸̣̺́̇ ̷͈͕̪͉̀͠ ̶̦͖́͌ ̷̝͕͚̍ ̵̱̼͗̎̃̒ ̸̭̍̍̚ ̵̨͈̠̓̊͆ ̵̜̥̔̔ ̷͚͠ ̴̛̙̥́̔́ ̸̠̌̒̐͛ ̶̮̼͋̾͝ ̷̧͚̭̖̅̒F̴̠͈̻̈͜ā̶̞͙͈͛́t̶͉̀̔h̴̨̩̲̙͂̍͐e̸̡͈̥̯̒͑r̴͕͈̗͠ͅ ̶̹̬͍̟̅́̈́͝ǐ̸͇̹̝ṣ̴̤̥̄ ̸̲̱̫͝w̶̛̘̠̭̥͌a̷̺͚͚̮͌͛͒̒t̶̠̤̓c̸̮͔̐͠h̵̜͌̑͝i̶̞͓̿̔n̴̬̤̦̾̿͜͝g̴̨̰̃̄ ̷̠͔̩̫̀̓ ̶̖͔̖̺͠ ̴̤͘ͅ ̵̬̳̞̖̓̀̀̿ ̶̞̲̋̈́̈́ ̴̬̙̞̝̿ ̴̨̛̤͓ ̶͎͎̰͎̆ ̶͈͠ ̸̭̘̬̎́ ̷̤̗̯͈͊͐ ̵̞̖̍͝ ̸̜͚̱̺̇ ̷̢͎̼̥̀̚ ̶̡̖̜̀͌͝ ̵̻͖̪̘̒͌̊͝ ̴̧͈̎ ̸̬̓ ̵̧̝̫̉͐̄͠ ̶̧̠͔͉̈́͆̚</b>",
                parse_mode: "HTML",
              }
            );
          });
        } else {
          await ctx.reply(quotes.getFatherQuote());
        }
      }
    }
  }
});

bot.launch();
