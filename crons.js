const cron = require("node-cron");
const {
  randomSpellBroadcast,
  raccontoDiMartaBroadcast,
} = require("./broadcasts");
const { generateEpisodeFormat } = require("./prompts");
const { setMartaEpisodePrompt } = require("./cache");
cron.schedule("0 10 * * *", async () => {
  await randomSpellBroadcast();
});

cron.schedule("00 16 * * *", async () => {
  console.log("sono nel chron di Marta");
  try {
    await raccontoDiMartaBroadcast();
  } catch (e) {
    console.log(e);
  }
});

cron.schedule("0 1 * * *", async () => {
  console.log("sono nel chron di MARTA_EPISODE_PROMPT");
  const episode = await generateEpisodeFormat();
  setMartaEpisodePrompt(episode);
});
