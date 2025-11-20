import { Composer } from "telegraf";
import { createCharacter } from "../game/characters.js";
import { WizardScene } from "telegraf/scenes";
import { message } from "telegraf/filters";

const step1 = async (ctx) => {
  await ctx.reply("Come si chiamerà il tuo personaggio?");
  return ctx.wizard.next();
};

const step2 = new Composer();

step2.on(message("text"), async (ctx) => {
  await ctx.reply("Oh, splendido nome. Sto forgiando il tuo eroe...");
  const name = ctx.update.message.text;
  const chatId = ctx.chat.id;
  const owner = ctx.message.from.id;
  const char = await createCharacter(chatId, owner, name);

  if (char) {
    await ctx.replyWithHTML(
      `Personaggio creato con successo!\n<b>Nome:</b> ${char.name}\n<b>Livello:</b> ${char.level}`
    );

    // Controlla se dobbiamo avviare l'avventura
    if (ctx.scene.state.startAdventureAfter) {
      console.log("Creazione personaggio completata, avvio avventura di Marta...");
      await ctx.reply("Ora ti porto nell'avventura di Marta!");
      
      // Imposta il lock e avvia la scena dell'avventura con il nuovo personaggio
      ctx.session.adventureLock = true;
      return ctx.scene.enter("martaAdventureScene", { character: char });
    } else {
      // Flusso normale: esce dalla scena
      return leaveScene(ctx);
    }
  } else {
    await ctx.reply(`C'è stato un errore durante la creazione del tuo personaggio. Riprova.`);
    return ctx.scene.reenter(); // Riavvia la scena corrente
  }
});

const leaveScene = (ctx) => {
  ctx.reply("Puoi vedere i tuoi personaggi con /mycharacters e crearne altri con /createcharacter.");
  return ctx.scene.leave();
};

step2.command("cancel", (ctx) => {
  ctx.reply("Creazione personaggio annullata.");
  return ctx.scene.leave();
});

export const characterScene = new WizardScene(
  "characterScene",
  step1,
  step2
);
