import { Composer } from "telegraf";
import { createCharacter } from "../game/characters.js";
import { WizardScene } from "telegraf/scenes";
import { message } from "telegraf/filters";

const step1 = async (ctx) => {
  ctx.reply("Come si chiamerà il tuo personaggio?");
  console.log("ctx.wizard.next()");
  console.log(ctx.wizard.next());
  return ctx.wizard.next();
};

const step2 = new Composer();

step2.on(message("text"), async (ctx) => {
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
    ctx.reply("Proviamo di nuovo");
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

export const cs = new WizardScene("characterScene", (ctx) => step1(ctx), step2);
