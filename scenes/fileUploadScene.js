import { Composer } from "telegraf";
import { WizardScene } from "telegraf/scenes";
import { message } from "telegraf/filters";
import axios from "axios";

const step1 = async (ctx) => {
  ctx.reply("Ciao Giò! mandami pure la lista delle sostituzioni");
  return ctx.wizard.next();
};

const step2 = new Composer();

const step3 = new Composer();

step2.on(message("text"), async (ctx) => {
  ctx.reply("perfetto. ci vorrà qualche istante");
  const list = ctx.update.message.text;
  const chatId = ctx.chat.id;
  const owner = ctx.message.from.id;
  const JSONList = sostitutionsListToJSON(list);
  if (!!JSONList && typeof JSONList === "object") {
    await ctx.replyWithHTML(
      `La lista delle sostituzioni è stata creata correttamente`
    );
    console.log(JSONList);
    ctx.scene.session["JSONList"] = JSONList;
    ctx.reply("perfetto. ora mandami la formula");
    return ctx.wizard.next();
  } else {
    ctx.reply(
      `c'è stato un errore durante la creazione della lista delle sostituzioni`
    );
    ctx.reply("Proviamo di nuovo");
    const currentStepIndex = ctx.wizard.cursor;
    return ctx.wizard.selectStep(currentStepIndex);
  }
});

step3.on(message("document"), async (ctx) => {
  if (ctx.message.document) {
    const fileId = ctx.message.document.file_id;
    // Get file details
    const fileDetails = await ctx.telegram.getFile(fileId);
    // Download the file
    const fileLink = await ctx.telegram.getFileLink(fileId);
    // Download the file using axios
    const response = await axios.get(fileLink.href, {
      responseType: "arraybuffer",
    });
    const fileBuffer = Buffer.from(response.data);
    // Convert the file buffer to a string
    let fileContent = fileBuffer.toString("utf-8");
    // Do something with the file content (e.g., log it)
    console.log("File Content:", fileContent);
    // Respond to the user
    await ctx.reply("File content received and processed.");
    const chatId = ctx.chat.id;
    const owner = ctx.message.from.id;
    console.log("ctx.scene.session['JSONList']");
    console.log(ctx.scene.session["JSONList"]);
    const subFormula = sostitutionsInFormula(
      fileContent,
      ctx.scene.session["JSONList"]
    );
    if (!!subFormula && typeof subFormula === "string") {
      await ctx.replyWithHTML(`La formula è stata sostituita correttamente!`);
      // Convert the modified content back to a buffer
      const modifiedFileBuffer = Buffer.from(subFormula, "utf-8");
      // Send the modified file back to the chat
      await ctx.replyWithDocument({
        source: modifiedFileBuffer,
        filename: "replaced_formula.txt",
      });
    } else {
      await ctx.replyWithDocument(subFormula);
      await leaveScene(ctx);
      ctx.reply(
        `c'è stato un errore durante la sostituzione della tua formula delle sostituzioni`
      );
      ctx.reply("Proviamo di nuovo");
      const currentStepIndex = ctx.wizard.cursor;
      return ctx.wizard.selectStep(currentStepIndex);
    }
  }
});

const leaveScene = (ctx) => {
  ctx.reply("Ciao!");
  return ctx.scene.leave();
};

export const fileUploadScene = new WizardScene(
  "fileUploadScene",
  (ctx) => step1(ctx),
  step2,
  step3
);

const sostitutionsListToJSON = (list) => {
  const keyValueObject = {};

  // Split the input string into lines
  const lines = list.trim().split("\n");

  let currentKey = "";
  let currentDescription = "";

  // Process each line
  for (const line of lines) {
    // Extract the key and description
    const splittedLine = line.split(" ");
    let lineKey = "";
    let lineDescription = "";
    for (const word of splittedLine) {
      if (/^\d{10}$/.test(word)) {
        // If a key is found, update the current key and reset the current description
        lineKey = word;
      } else {
        // If not a key, append to the current description
        lineDescription += " " + word;
      }
    }
    // Update the key-value object
    keyValueObject[lineKey] = lineDescription.trimStart();
  }
  return keyValueObject;
};

const sostitutionsInFormula = (inputString, keyValueObject) => {
  // Create a regular expression to match all keys in the object
  const keysRegex = new RegExp(Object.keys(keyValueObject).join("|"), "g");

  // Replace all occurrences of keys with their values
  return inputString.replace(keysRegex, (match) => keyValueObject[match]);
};
