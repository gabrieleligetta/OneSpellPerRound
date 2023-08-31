const WizardScene = require("telegraf/scenes/wizard");
const Composer = require("telegraf/composer");
const { createCharacter } = require("../game/characters");

const step1 = async (ctx) => {
  ctx.reply("Come si chiamerà il tuo personaggio?");
  return ctx.wizard.next();
};

const step2 = new Composer();

step2.on("text", async (ctx) => {
  ctx.reply("Oh, splendido nome.");
  const name = ctx.update.message.text;
  const chat_id = ctx.chat.id;
  const owner = ctx.message.from.id;
  const char = await createCharacter(chat_id, owner, name);
  if (!!char) {
    await ctx.replyWithHTML(
      `Il personaggio appena creato: \n nome: <b>${char.name}</b>\n livello: <b>${char.level}</b>`
    );
    leaveScene();
  } else {
    ctx.reply(`c'è stato un errore durante la creazione del tuo personaggio`);
    ctx.reply("Lets try this again");
    const currentStepIndex = ctx.wizard.cursor;
    return ctx.wizard.selectStep(currentStepIndex);
  }
});

const leaveScene = (ctx) => {
  ctx.reply("Bye !!!");
  return ctx.scene.leave();
};

step2.command("cancel", (ctx) => {
  ctx.reply("Bye bye");
  return ctx.scene.leave();
});

const cs = new WizardScene("characterScene", (ctx) => step1(ctx), step2);

module.exports = { cs };
