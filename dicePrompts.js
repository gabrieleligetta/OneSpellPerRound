const generateDiceRollPrompt = (roll, difficulty, ctx) => {
  if (!ctx.session[ctx.chat.id]?.overallSuccess) {
    ctx.session[ctx.chat.id]["overallSuccess"] = 0;
  }
  const degree = roll - difficulty;
  if (degree >= 0) {
    console.log("ctx.session[ctx.chat.id].dungeonData");
    console.log(ctx.session[ctx.chat.id].dungeonData);
    if (ctx.session[ctx.chat.id].dungeonData === 1) {
      ctx.session[ctx.chat.id].overallSuccess++;
    } else if (ctx.session[ctx.chat.id].dungeonData === 2) {
      ctx.session[ctx.chat.id].overallSuccess =
        ctx.session[ctx.chat.id].overallSuccess + 2;
    } else if (ctx.session[ctx.chat.id].dungeonData === 3) {
      ctx.session[ctx.chat.id].overallSuccess =
        ctx.session[ctx.chat.id].overallSuccess + 4;
    }
  }
  const pezzoFrase = getAggettivo(roll, difficulty);
  return (
    "Raccontami nel dettaglio di come" +
    pezzoFrase +
    ", impersonando il game Master, utilizza al massimo 150 parole"
  );
};

const getAggettivo = (roll, difficulty) => {
  const degree = getDegree(roll, difficulty);
  if (roll === 20) {
    return "la prova è stata brillantemente superata, un successo critico sotto ogni aspetto con ritrovamento di loot, grazie alla abilità eccelse di chi ha effettuato la prova";
  } else if (roll === 1) {
    return "la prova è stata un fallimento totale critico, con feriti, danni all'ambiente e equipaggiamento danneggiato, a causa delle scarse abilità di chi ha effettuato la prova";
  } else if (degree === "barely_positive") {
    return "la prova è stata superata di un soffio,con molta fatica grazie a un evento inaspettato o un colpo di fortuna";
  } else if (degree === "positive") {
    return "la prova è stata superata, con una buona dose di impegno grazie alle abilità di chi ha effettuato la prova";
  } else if (degree === "extremely_positive") {
    return "la prova è stata superata senza fatica, grazie alla abilità eccelse di chi ha effettuato la prova";
  } else if (degree === "barely_negative") {
    return "la prova è fallita di un soffio, a causa di un evento inaspettato o della sfortuna";
  } else if (degree === "negative") {
    return "la prova è fallita, nonostante l'impegno le abilità di chi ha effettuato la prova non sono bastate";
  } else if (degree === "extremely_negative") {
    return "la prova è stata un fallimento, con danni all'ambiente e equipaggiamento danneggiato";
  }
};

const getDegree = (roll, difficulty) => {
  const degree = roll - difficulty;
  if (degree >= 0 && degree < 5) {
    return "barely_positive";
  } else if (degree >= 5 && degree < 10) {
    return "positive";
  } else if (degree >= 10) {
    return "extremely_positive";
  } else if (degree < 0 && degree < -5) {
    return "barely_negative";
  } else if (degree <= -5 && degree < -10) {
    return "negative";
  } else if (degree <= -10) {
    return "extremely_negative";
  }
};

module.exports = {
  generateDiceRollPrompt,
};
