const telegraf = require('telegraf')
const axios = require('axios')
const randomItem = require('random-item')
const faker = require('faker')
const cron = require('node-cron')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const bot = new telegraf('1468923602:AAFgyjeSroQ1aYw7VziUeqDZFBqMAmr-W4o')

function getRandomName() {
    return faker.name.findName();
}

function abstractDice(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function makeUpperCaseAfterCommas(str) {
    return str.replace(/,\s*([a-z])/g, function(d,e) { return ", "+e.toUpperCase() });
}

function replyescaper(reply) {
    reply = reply.split("-").join("\-")
    reply = reply.split(".").join("\.")
    reply = reply.split("(").join("\(")
    reply = reply.split(")").join("\)")
    return reply
}

function getBookQuote() {
    let book = [
        "Ơ̸̓́͌̏̀̕͜͝͠ṋ̸̦̳͔̀̌͆́̊ḛ̴́̿͗͌̀͑͑ ̶̧̢͕̳͔̣͈͉̊̇͌̏̕b̶̧̢̢̻̲̙̠͓̌̑̓́͌̿̓̚̚y̵̨̪̝̰̘̘̝͌̿̌̌̿̿͝͠ ̵̣̺͔̥̗̩͔̎ͅò̶͎̼̙n̷̢̛̛̻̝̪̏͛̓̿ę̷̛͚͖̞̬̝̥͝ ̶̧̢̖͑̏͒̈́̌a̶̛͙̞͋̅̆̌̉͘͠l̶͈̣͔̓̎́̈́͝͝l̴̺̞̮͖̰͍̑́͂́͂͋͆͘ ̷̧̜̖̍́͂͝t̷͙͎͚͉͉̤̣̲͂h̸̢̦͓͍͍̮̦̿̄͑̓͗̌ẹ̵̫͍̰̮͂͊̂̊͋̿ ̷̠͍̭͗̄͗̽̓̕͜w̶̢̡͓̺͕̟̪͓̞͂ọ̵̝̥̪͍̙̻̹̓͒͠r̸̩̗̖̝̬̯̱̯̉̄͗̀͑͠l̷͈̦̹̖̦̥̼̿̉͋̃͑̉̏̾͜ͅd̶̢͛̔̀̍̌̽͜ş̶̒ͅ ̷̡̪͎̼̖̻̃͌͘à̶̖̤̐̃̃̃̐̋͒r̶̡̬̤̞͂̓͊͜è̸͈͔̪̾͌̎́̚͘ ̸͉̳͕̭̦͙̀͋͜ͅa̸̧̼̦̦̘̩̖͕͙̓̃̚͠b̴̡̨̜̣̩̫̑̀̊̃̕͝s̸̡̭͙̜͙̣͔͙̝̑̆̑͐̑͂͐̕̚ơ̵̧̱͎̝̮̖̯̱͒̐̈́̕͠r̶̡̖̹̆̍̒͗͛̏ͅͅb̴̲̭̉͐̓̋̉̒è̸̠d̷̜̑̈́̀̄̋̀ͅ,̵̡̭̜̞͎̤̼̖̥͌̏͒͌̆\n" +
        "̴͚͇̫̟̯̼̽̄̎̋̐̈́̔͜͝͝ ̴̟͖̺̹̂̍̌̓̀̔̀̈́o̸͓͂̈͘̚n̴̟̣͚̈́̒ę̶̡̣͙͚͙̩̲͆̓̀͊́͛͊͘ ̴̢̻̩̤̣̝̻̿̈̆̎͝͝b̸̨̰̻͕͈̱̦͍́ȳ̶̡̨̝̬̏̌ ̶́͜o̷̳̘̯̪̭͗̏̽͋͊̎n̵̡̜̰̱͗̇̔̃̎̏͘é̵̳͚̩̦̜̒̊̓̍ ̴̧̨̧͍͔̳͔̼̈͊ȇ̶͕͖̗̣̬̾̀̽̉̕v̸͍̉̓̀̈́ẹ̸͉̘͔͖̍͗̍̄̿̏̐̅r̷̫̈̀̋͑́̑y̵̨͋̉̿̃̾ ̶̟̥̖̦͗́̽́̐̑͝͠ͅs̶̪͔͎̭̪͈͋́͋̄̎̎̌i̴̩̅̈́́͋͘n̶̞̤̭̜͉̖̓̈͆̓̒̀͊͝g̵̣͔̯̫̲̟̐̂l̸̗̪͎͎̈̆̋̅́̾̈̍͐e̸͈̠̣̍ͅ ̶̬̹̤͙̜̙̓̂̊̈́̒̑͝ͅo̸̬̤̯͓̯̲͔̲̜̔̽̃̉̔͝ņ̶̻̪͈̹͆̅͂͗ë̶͔̰̯̲͕̘̹̞̪́̐͑̀͛͂̍̏͘ ̷̛̳͈̪͍̮͉̆͗̄̉̏̓͘è̴̡̛̻̻̭͐̈̊̋͠͝n̴̨̟̮̼̦̅̏̓̑̂͊̑̉̊ͅţ̶̘͑e̷̞̞̟̮̦͔͙̒͑͂͊͒͆͒͜͝r̷̼̬͓͓̽s̶̡̗͖̟͛̋̄̅̄̈̓͗͝ ̶̞̾͌t̴̝̣͇̟̎̀̀̓ḩ̵͇̥̓̽́̈ȩ̸̘̀̓̉͆͘͝ ̷̡̟̙̬̖̺͎̥̙̊͛̍̑͠w̸̩̦̝̞̑͑̀͆̓͒̚ĥ̸͙͍̙̗̼͌͘o̸̡̲̳͔͚͔̒͘͘l̸̲͎͂̐̎̍̔e̸̖̼̙͇̺̟̱̥̒̄͘̕͝.̵͍͔̏͊̓̈̈́̑\n" +
        "̶̻̇͂̀̔̄̚̕ ̵̛̛͕͛̇̉́͋̽̋Ȁ̷̱̻̞̈͝n̶͖̱̲͙̻̊̎͒́̇d̸̨̢̛̤̬̠̲̝͕̳͗̉͒͝ ̵͈̬̭͎̹̑́̚͘͠ẇ̵̧̛̜̼̗̆͜ͅh̴̼͔͎̻̙̻̔̓͂͋̕̕͝e̶̮̜̍́̇͒̄̇͘͘ń̶̢̡͇̜̫̀̎̄̋̃͆̃͜͝ ̵͕͕̘͚͓̗̺̌̾̑̎e̸͉̪͋̋̅̉̈́͛̇̕͝v̸̨̰͖͉̱͔̭͠e̴̘̫͚̻̣͔̫̋͜͜r̶̻͈̠͔̲͑͠y̸̝͙̎̍̂t̵͍̰̺̘̝̃̒́͂̇͂͆͝͝h̴͈͈͇͎̳͕͈͑̇i̸̝̬̪̱̥̭̓̏̈́͋̄́̇̚͠ń̴͖̲͛͊͐̑́͛̓g̶̡̬̳̬̲̈ ̴̨̱̘̺̭̓̋̔̋͆͋i̵̦̮̼̭͖̇s̶̘̄͒͊̏̎̾̚͘ ̵͈͕̳̲̝̏͌̓̿m̶̡͍̻͇͖̩̱̓͛̇̓̓͜ͅa̵̬̯͐̊͒d̵̨̛͈̖̺̜̥̖͉̀̅͋̚ͅẻ̴̢̗͙̻̲͍̞̹̺̀̉͒ ̸͓̤̗͔̠̘̗̀ų̷̧̗͍͍̺́̃͊̌̃̆̾͠ͅp̴̧̛͂̾͝ ̵̡̻̲̤̘͍̻̪̂̑͜ó̸̞͙͎̗̯̥͇f̴͍͓̍̈́̈̃͘͘̕͝ ̵̧̣̰͊̃̒ͅa̵̺͇̓͂̈́́̍̉̅̾͝ ̴̫̩͇͛͐̕͜ͅs̸̩̍̈́͌̑̔̾̎͆̈́į̶̛̼̲̩͇͓͕͆͂͒͋̍̈́̃̐n̷͕͍͇̹̱̫͚̱̅͐̇́͛̒͌͜͝g̶̡̬̍͒͒̍̾̓͑͆͘ļ̷̟̀͗ë̴̢͙̹̣̠̫̪́̾,̸̖̪̣̣̬̂͛̇́͌̊̒͒̓\n" +
        "̷̨̡͕͚̜̋́͊͜͜ ̸̲̫̹̔͑Ï̷͕̩͚̻̑ͅ ̸̨̛̺̱̪̘̺̾́͗͆̽͌̕w̴̨̰̝̥̮̥̏i̷͔͖̋́̊͋̋͛ḷ̸̢̯͓̺̫̖̣͆͌̑̓ĺ̴̙̥̲̠̜̙͌͑ ̶̨̛͎̼͍̥̲̲͔̠̈̍̓ḟ̷̪̖̼͙̼̭̄͘i̸̡͉̤̼͚̫̝̘̇͋̋ͅn̴͓͙͔͈̪̻͉̲̒͌ͅǎ̶̢̛̘̗̈̏̕l̵͈̮̎̉͆̌͌͐̔l̸̟̩̒͐̊̈́͐y̸̞̯̱̿̾̈́ ̶̭͕̦̄͆͐̉̅͌́͝b̴̧̧̛̜͙̹͛̏͛́̽̽̕ȩ̸̜͉̘̉̄͝͝ͅͅ ̷̠̘̩́̓̍͜ä̶̠͇̲̺̝̟̖̹̔̀b̵̟̲̣͉̘̝̱͐̈́̒̓̊́͒̐l̶̺̎̿͘e̸̖̻͙̞̺̋̿̈́̌̎̂͛͠͝ ̴̧̢̡̝̗͚̫̦́̈́ẗ̷̰̗̣́̐͒̂̔̇͊̊͝ŏ̶̼̞̟͍̦͊̇̋́̿̓ ̶͎̟̮̯̖͕̭̙̉͑́̈͋͘p̶̤̠̻͎͖̉͒̕ȗ̴͓̝͉̹̔̉̄̈̈́̓̉l̸̛̤̤̠̞̎̚l̴̫͔̬̬͎͍̠̀͂̐́ ̴̢͙̆͘̕̕͝ț̵̨̛̞͆̃́͠͝h̶̲̰̜̖̱̉̒́̈̃͊̉ä̷̦̦̺̖͆͘ţ̴͙͑͆̐̒̍̄̾̑̚ ̷̩͆͒̒͜ť̸̨̡̛̼̥̹̪͍͕̍ṛ̷̬͎̥̗̮̞̠̓̈́̕i̴̡̼̫͇̥̙̠̮͌̽̅̊̐͠ǵ̴̩͍̥̻́̉̊̓͗͛͝ģ̶̉͆ḙ̶͖̲͇͖̯̟͑̐̀́̉͌̈́̒ͅr̵̘̗̰͓̭̟͊͐̈́ͅ ̴̯̯̜̎ͅa̴̢̻̫̿̎̓̒͑ͅg̸̩̠͉̮̙̼̺̈́̈́̎͘a̷̛̱̫͈̖̟̩͍͖̒̊̒͘͘͝͝͝i̵̳͛̅́̋͒͌͠ň̴͉͕̣͈͉͇̪̳͚͊̿̇̃̕͝.̶̬̻̞̝͋͗",
        "T̶̲̈̿͝͝ẖ̷͔̗̻̀͝͝ī̴̻͈͈͈͌̾͠s̴̟͗ ̸̭̫͓̟̈́͐͝n̵̟͗͛̈́o̸̤̯̮̦͛̓̄ț̸̊ẹ̴͈͍̪̓̐͆͝b̴̖̾͝ͅo̷̭̼̞͋o̵̱͑k̷̳͙̲͇̂̈́͘͠,̴̡̝͐̓ ̵̲̉̊͗̋i̴̟̙͂n̷͙͔̤̋ ̸̧̫̦̪͐́w̸̯̦̾̄h̷̖͝i̷̥͖̓̓͗̋ç̴͓̤͆͘ḣ̵̡̀̃̏ ̴͇͋I̵̡͙͚̎̿ͅ ̶̺̣͋̈́w̶̢̺̮͆̈́̉͠r̷̼̹͍̗̽o̴̬̾͆̀͋ț̷̀̂e̷̺̬͇̩͆͛͗̎ ̷̧̻̥͊d̴̥̻̃̌ͅͅo̶̫̜̰̎̀̉ͅw̶̧̦̰̤̔̈́̽͝n̵̩͕͊́̈́ ̶͕̗͂̚a̴̖̥̝̘͠l̸̡͙̈́͌̉l̵̨̬̰͐ ̶͔͍̈́̈́́ͅm̸̲̣̗̂̅͝y̶͖̩̪͑ ̷͇̳̗͔͝d̸̯̩͎̃e̶̤͚̒v̷̻͝e̵̢̗̣̖̎͒͛͠l̵̼̿ọ̷̦̋p̸̩̐̌̽̈́m̵̹͒̚ę̵̱̣̈́̐͐n̷̻̤̞̚t̵̳͖̪̏s̶͉̰͊̀ͅ,̶̭̖͌͒́͝ ̶̨̧̪̫̽̋w̶̝̾o̵̡̗̲̟̔͝ǔ̵̥̝̤͙l̵̰͍̯̃d̸͓̭͊ ̴͕̣̊̂͋͝t̶͚̫̮̓̏̀͂h̷̺͇͚͓͠e̶̡̝̥̘͝n̴͓͍̯̣̎͌̕͠ ̸̡̖͍̅̽̑͝b̴̙̻̠̩͐̏̇͗é̷͈͈̻͖̍c̴̯̪̀̒͂͠ö̸͓̘̯́̈́m̴̠̗̱̆͂́e̷̩̎ ̶̪̿̎̌̇t̵̗̣͗h̸̡̼̾̽͝͝ĕ̶̗̚ ̶̦̪̭̥̈́͆̀͛ġ̴̡͊͠ȗ̷̧̪̖̭͊͌͛í̴͙͎̽d̶͎̗͑̃e̴̱̓̉̄̕ ̸̧̲̑̍t̶̬͘ǒ̶̳̿͝ ̸̙͒̃̕͝t̴̠͙̀̏̓͌ḩ̶͕̲̄̆̓͊e̷̢͆͆͋̀ ̶͔̅̎͘t̵̺͍̓r̷̤̲̟̓͆͆ư̵͖̐̌t̷̲̪͍̩͊́̓̊ḩ̷̫̮͇̀̓͠ ̴̧̡̪̇f̷̩̲̙̀̋̆o̶̪̾̈́̓r̷̨̢̠͌ ̵̤͂͛t̵͓̾͋͜h̷̘̳̰̅̋̚͝ò̶̝̳͍̄̏̄ͅŝ̵̟̪̯̱̀̿͠e̸̻͐̉̕͜͝ ̴̢̗͚͛w̴͓̲̣͒̍̇̿h̷͈͈̤̫̀͗̔̕o̵̺̰͊̀ ̸̨̫̑͒̚w̶̛̲̠̰͆̽̃ă̶̝̮ͅͅn̴̡͉͚̄̿͘t̵͇͓̟̘̏e̵͎̠͖̓̑d̵̲̦͙̆͋ ̶̲̱͔̯̀͝t̵͙̤̳́̏̄͜o̸̫̿͊̌ ̵̩̱͈̕ͅc̴̮̞͋̀ö̴͜r̴̯̮͍̓̄͒r̵̹̞̉͝è̸̢͙̗̤̀c̷̩̽̅̾ṫ̴̡̜͙̰̉̍̔ ̷͚̼͆̊́t̷̨̛͙̐̈́͜ͅh̸̤͛e̵̎͝ͅ ̸̨̙̘̺̃ơ̵͎̯̼̓̃̉r̸͉͉̮̦̀̓̈́ḯ̵̻̺ĝ̷̡̺̱í̴̪̖͑̆͜͠ǹ̵̤͕̽̓̅à̴̯̣̩̗̆͝l̵̥̈́̅͘̚ ̵̬̮͊s̸̓̏̏͘ͅḯ̸͈̈͘͘n̸̦͙̑͊,̵̺̓͂͂̾͜ ̷̠̓ä̸̦͙̣́̉̑͝ ̷̰͓̻͚̓̀͗̏g̶͍̳̋̏͝ȕ̸̠͖̟̑͝i̴͍̣̞̐͜d̷͔̼̒͋̀é̵̬͙ ̷̫̠̆̍͝t̵̖̮͍͔̊̆ḫ̶̡͈̍͐͆͜ą̸̢̗̒͑̒t̷̨̛̠̑͌̓ ̷̦̫̣̂͛͝e̶͖͗͑̑x̴̺̝̟̆̓̕̚ͅṗ̷̧͛̍̋l̷̯̼̓̈́͆ḁ̶͉̱̯̇̀̈̌i̴̼̹̟͗͌n̶̨̢͋̐s̵̜̙͍̄ ̴̨̜̣̠̅̌s̶̨͍̹̮̓̊̌̈́t̴̻͚͒̂̑͠ȩ̴͎̱̬͂͐p̶̩͋̓̈̈́͜ ̶̹͎͇̿̃͊̌b̴͚̄̑̋y̴̘͈̠͊ ̵̬̰̅̑͜s̵̰͙̤̞̒t̴̛̛̺̓͆e̴̪̋̎p̴̪̱̊͆̊ ̸̖̎h̶̡͗͑͂͠ó̵̧̡̳̿w̸̜̃̔̌ ̷̖̜͉͎̆͗͘t̶̡͔̩͍͌̍o̶͙͕̹͗͂̊̓ ̸̧͗̀̊ȩ̶̠̯̫̈́̚v̷͓͙̂ö̴̤͔̠́̈́̓͊l̵̘̭̳͎̓̈v̴̘̣͈̈́̍̃͘ẽ̶͖̟ ̶̜̩̭͌̐t̸̹̪̜͛̚ḧ̸̞̠̖̯́͂e̸̘̓̀̊͝ ̵͔̫͐b̵̜̹͕̐͗͒̚o̵̫͖͍̓d̵̙̿̈͆̅y̴̨̦̪̘͌ ̷̠͕͕̣̓a̶̧̪̤͊̂̈́̇n̸̡̗̦̞͒̃d̷͓͕̘̯͑͛̊ ̸̫̳̦͐̒̕m̴͓̠̜̾̄͠i̶͕̤͑́͛͜ṉ̸̈́́͝d̵͔̰̫͛̇͗ ̵͙̰̲̂̕t̸̰̥̾̏̌ŏ̸̭̞ ̵̨̭̘̹̒̅̋r̷̛̬̝͂ė̴̡̤̜a̷͚̦͇͑͂c̶̢̘̜͂h̴̗̼̱͖̓ ̷̛̗̭͙̝̅͂m̵̭̦͋̚͠͝e̵̯̼̪̣͗͘ ̷̺̱́́̀̚ͅą̴̛̹̇̆n̵̖̂̽͊ḍ̶͔̬͆͠ ̷̀͜b̴͖̝̖͋ë̷̜́ć̸͙̲͓͌̈́̄o̷̙̭͆̉͛ḿ̸̪̰̘̍͐͗e̶͙͒̆͝ ̴͉͆͋̈̓m̴̛̬̣̆́͒y̵͎̏̒͠ ̴̦̺́̿h̷̡̫̯̫̔e̵̡̼̙͠r̵̬͋͊͜a̸̯̓̚ļ̴̩̩̈́́̿ͅd̷̪̏.̵̻̙̕",
        "A̸̡̼͈̹̐̈͝f̸̻̹̤̃͛t̵̫̦̀e̵̮̯̋̽́r̴̲͗̽́̊̚ ̷̰̦̖͊̅̽ḩ̸̪̮͕̗́͂͌à̶̡̢͚͔̲͊̋v̶̖̈̾̓̐͑î̷͎̯̱̻̇́̎n̴̦̪̲̯͂̐̌̌ͅg̸̖̥̑̓͂ ̴̭͕̬̟̩̋͊̑̔͝d̴̡͍̦̤̩͗̆ḛ̷͙̖̫͌́̈́͌͠v̷̞̪͚̀͛̀̽͘ó̵̦̬͎̤̾͠u̵͔͉̽ŕ̸̭̮̠̾̓̕e̵̡̻̦͍̙͛̈̅̉d̶̡̥̭̀́̈͜ ̸̗̩̘͐̅̔t̶̛͙̿͋̾h̷̳̀́̒̐į̵̞̱̗̆̈̇s̶̛̖̟̰̬͎̈́̈͋ ̶̯̪̯̻̈́͛̈́̕͝û̵͙̩̜̙̻̀͛ņ̷̳̺̬͐͐̈̑̐ĭ̵̡̛̛̤͖͓͊̾v̴̪̤̙̻̪̀̈́͠ȅ̵͓̺́̏̆r̵̤͙͕̹̗͋͛̔ṣ̵̡̒̋ͅę̶͍̇́̀͆̈́ ̸̡̹̰̣̃̆̏́̅\n" +
        "̸̞̻̀͗̚͜͠͝I̴̠̙͌͆͠ ̸̟̮̓̆̇̾f̴̢̖̭̔͂̎ó̷̯̲̅̿̈́ȗ̶̹̮n̵͖̯̼̲̯͗ď̷̨̨̗̻͔̇̅ ̵̛̼͉̽̀͂̆t̷͓͛̀h̶̘̳̉à̸̢̩̗̜̖̎̀̈́̚ẗ̶̗͚͇́͒̑͌ ̵̲͎̞̬̅̏̑m̶̦̻̖̊̇͐͌̚a̷̤͓̲̾n̶̝͂y̸̦͖̒ ̶͚̟̫͓͆o̴̮͓̯̱̐t̸̝̱̙͔͛̏͐̇h̷̹̔ḛ̵̥͚̀͐̀r̶̡̢͈̭̄s̷̺̘͔̫͘͜͝ ̷̨̧̹͖͙̋͆̆̈́ę̷̱̹͋̽̐̓x̴̺̊̓̈́͝i̵̢̲͕̎ş̵̣̘̙͒̈́̚ṱ̴̫͔̉̅͒̎̐ẹ̷̭̯͎̆d̴̼̆̏ ̷̤͂̃͘͠\n" +
        "̵̲̎̈́̅j̷̨̣̼͚̔͠ụ̶͓̟͇̌̃̄̓̎͜ş̵̺̻̾̓͗͝ț̸̍̓̈́̚ ̷̯͈͖̖́̅̕b̷̢̲̩̤̱͊e̷̮̮̬͍͐́ÿ̶̩͎̯͚́̔̄͝ơ̷̯̊͐͜ň̷̥̥̾̕ͅd̷̼͇̺̋̽́͂̆ͅ ̷̮̤̰̱̝͑̂̉t̷̨̖̜͌̈́ḣ̸̰̑́́e̷̟͈̳̓͒̉̚ ̶̞̲̬̮̮̒̇̿̚͝ţ̴̬̖̳̔̽̕͜h̶̗̀͗r̸̙̣͓̦͑̽͑ë̴͓̙͚̪̖́͂̃͝s̶̞͈͕͂h̵̠̥̤̀ö̵̧͍̖͕͎́͊͑͝ĺ̶̜̔̂̕d̸̻̬̗̯͠,̴̰̪͛̃̌̄\n" +
        "̸͍̇ ̶̠̮͓̈̂̃b̷̝͎̬͖̙̓͌̇̊͐ȗ̶̢̜̲͙͒̈́͘t̷̥͕̽͘ ̵̖̂̇̀̂l̷͉̜̫̐̀͛i̴̤͂f̷̡͓̼̘̫̓ȇ̸̻͓̿̈́̾͜ ̶̢̬̥̺̯͌h̷̝̽ả̷̺̆ͅͅḑ̶̧̺͛̄̿̎͂ ̶̤͔̙̺̾́́̇͘c̷̲͇̓͂o̷͉̹͑̎̈́͝͝m̴͍̮͙̪̉̓͐̑e̷̤̟̜̐̑ ̵̛͎̭͋͌t̸̼̙̋̍͛h̴̹̹̖̎ȅ̶̱̏̇͗r̴̲̘͊͝ë̵͙́̃̆̄̄ ̵̛̹̳̱̤͖̋̋̚b̶̨̧̭̩͉̔̉͐͛y̴͍͗ͅ ̷̺͙͈̫̩͝m̴̞̬̟̻̿͝ī̴͓̳̽s̸̱̗͙̹͝ṯ̵̹̣͊̓̍a̴̧̙̙̖̞͂k̷͓̄̈́ͅę̷̛̏,̷̧͉̺͔̮͗\n" +
        "̷͎̕ ̶̧̦̫̪̎͌ą̸̋͑͗n̵͉̩̅̂̈́͌d̴̟͖́͛̃̚ ̶͒ͅI̴̗̦̥̺͒͒͂͠ͅ ̸̨̥̗͔̓̃̑̑̒ḧ̵͚́̅̐ä̸̞̫̪̺́ḏ̵̨̹̞̀̍ ̷̦̣̀͌̚t̸͖͈̻͕̹̒̍ò̵̰ ̸̠͎́c̵̙͐́̒̌̀o̵͕̿̀̚r̷̝̥̘̰͛̔̚͝ͅr̷͎̃̈́̃͝e̸̟̯̗̍͗c̴̹̉͒͐͋ť̵̘̰͛ ̵̩͚̗͖̫̒t̶̻̖̐̎̓̓̍h̵̗̒͊̒͆͑ạ̷͓͑͘ṱ̸̣̓͌ͅ ̵͖͎̤̋̓͐̕͘m̴͎͆͜i̴̪̦̤̯͐͌͌̏̋s̴͍̜̍ͅt̷̺̠̰̆̈́̀ǎ̴̘̟͉̕k̴̜͈̹͖̯̀͗̒̽e̶̡͗.̶͔̼̱̋̑̍̕͝",
        "T̴̘̖͆̒͝h̵̢͈͇̹̲̓͆̒͘͘o̷̤͈̩̜̘̠͆͊ŝ̵̯̹̹̖̈͒e̶̡̩̺̫̹͒̈ ̶̰̈̌̐̚͠͝w̶̙͈̗͎͓̓̋o̶̮̍̚ṟ̵͂͗͐̈́l̸̨͗̊d̷̬̜̼̝̈́͛̉͠s̶̥͉͚͈̝͒̔,̶̢͓̣͊̎̏͝͠\n" +
        "̷̢̛̦̙̘̙̽͜ ̴̛͖̥̇̋t̷͇̀͊h̸̳̩̙͉̾ͅö̸̰̖̪̙̥̭s̷̱̼̻̰̯͒̋̈͛̕e̸̖̙̯͈̅̉ ̶͓̾̄̿̚͜͝ͅc̵̯͕̻͖̈̏͒̌͒r̵̠̩̩͇̋͒̑̔͛̉e̵̖̪̽̈́͌̍̅a̶͚̺̦̍̋t̴͓̲̚ǔ̸̟̪̟͇̳͗r̵̙̗̪̯̍̑e̷͇̠̙͖͆̓̌̈́̌͐s̶̨̘̝͇̄͛͗̄,̵̨͔͙͆͌̔͑̈́ ̶̥̠̪̭͌̍ͅ\n" +
        "̷̧̭̝͍̖̙̇̚͝t̷̥̻͖̹̋̓̒h̸͍͇̞̜̓̉͑ͅḙ̸̟̍̒͘͜i̸̲̗̅r̴̭̙̝͙̼̚ ̷̱̝͑̿̍ļ̴͔̽ĭ̷̡͖͇̺̻̣̀͝͝v̸̞̿͌͆͌̎ě̵̢̧͇͉̗̙̊͗̒ṡ̷̛̟̬͊̕̕͠\n" +
        "̷̗̬̙͆̔̄̉̚ ̷͇͈͖̬̟͆ͅn̴͎̠̂͆͛͛̍ó̶̦̖̣͖̤̠́̑̈́ț̵̰̗͛͝h̴͓̒ĩ̷̠̣̌̈́ń̷͔͇̞̝̱͐ͅg̷̪̼̻͎̞̽͑ ̶̦́ẅ̴̦͇̮̝̜́̇͒͒̀ą̶̛͉̋s̸̜̪̈́ ̵̗̣̑̈̚͜r̴͈̱̝̬̓ͅḛ̵̟̩̣͐̏͛̂ā̸̫͇̻͓̀͐̓͗̕l̸͍̟̳̍͌͆̈́̆͠.̴̹̞͎͂͝ ̸͈͖͇͒͛͒̾̄̒ͅ\n" +
        "̸̱͈̰̥̤͇́̓́͒̏Ị̴̡͙͓̏͒̾͗t̵̡̗͔̀̄͑͝ ̶̢̹̯̣͉̝́̍̊̃̒͘w̵̼̮͌̒̀̅ḁ̶̱͚̩̰͖̾́̒̈́͒ṣ̴̭̕ ̴̦͓͉͔̹̓̑̚j̶̩̳͉̻̻͌̉̽͜u̴̧̬͓͔͇̟̓̽͗͆̎̀s̷͍̯̼̄̂͝ţ̷̹̍̈́͜ ̴̦̺̅͋̏a̴̙̳̞͕̽̕ ̸̫̬̯̏͗̏̏͗͘d̴̨̞̙̹͇̓r̵͕͚͓̯͊̈́͂e̷̬̹̊̃̈́̽͝ả̷̡̞͈̤m̵̡̛̗̄͋̏̕\n" +
        "̶̳͎̫̽ ̸̣̺̱͍̺̫͌̎m̷̡̖̹͓͎̱͊̈́á̶̲̘̣̇͗̓͝ͅͅͅd̵͕̺̉͐̀̃̈́͗é̵̙̪̄̉ ̸̢̰̥͔͍͛́͋̄͝ḇ̴̨̦̈́͝͝y̶̛̱̬̘̲̖͌̅̔̾͝ ̵͕̯̤̺̱̉͑̉̒̓͝Ë̴̠͈̠͜v̵͍̠̖̓̄̈́̉̚̚a̸̤̼̬̜͍̭͐́̈́͋̄ ̸̡̣̘̗̋̀̂̊́͘\n" +
        "̷̬͙̞̉̚͝͝t̶̗̣̍̄̓͋̓͜h̸͖̑a̸̳͉̗̓̈́̍̆̔̌t̶̢̥̼̀̽̎̈̃͝ ̸̪͚̚̕Ỉ̷̫̀͝ ̸̭̊̏͋͜ḧ̵̘̺͈͕̣́̃̌́̈̀ȃ̶̝̻͋͝͠d̵̹̬͗͊̋ ̴̧͈̺̮̺͈̇͝t̶̞̫͍̟͒̑̿̋̔͘o̵͎̥̾͜ ̸̡̺͔̈̉̌c̸̰͈̩͗̅͊̅͠ä̵̱́̅n̸̢͇̪̞̣̘͒̄̌̚ç̵̹͎͓͓̒̿͆̀͠ë̴̫́̀̀͌͘͜͜͝ḻ̴̙͈̩̖̆.̷͚͔̊͛",
    ]
    return randomItem(book)
}

function getRandomQuote() {
    let quotes = [
        "They are coming for you...",
        "Give in to your fear...",
        "Kill them all... before they kill you...",
        "They have turned against you... now, take your revenge...",
        "It WAS your fault...",
        "Tell yourself again that these are not truly your friends...",
        "You are a pawn of forces unseen...",
        "There is no escape... not in this life... not in the next...",
        "Trust is your weakness...",
        "Hope is an illusion...",
        "All that you know will fade...",
        "You will be alone in the end...",
        "At the bottom of the ocean even light must die...",
        "The silent, sleeping, staring houses in the backwoods always dream... It would be merciful to tear them down...",
        "There is no sharp distinction between the real and the unreal...",
        "Even death may die...",
        "There is a little lamb lost in dark woods...",
        "All places, all things have souls... All souls can be devoured...",
        "What can change the nature of a man?",
        "The stars sweep chill currents that make men shiver in the dark...",
        "Do you dream while you sleep or is it an escape from the horrors of reality?",
        "Look around... They will all betray you... Flee screaming into the black forest...",
        "In the land of Ny'alotha there is only sleep...",
        "In the sleeping city of Ny'alotha walk only mad things...",
        "Ny'alotha is a city of old, terrible, unnumbered crimes...",
        "Y'knath k'th'rygg k'yi mrr'ungha gr'mula...",
        "The void sucks at your soul. It is content to feast slowly...",
        "The drowned god's heart is black ice...",
        "It is standing right behind you... Do not move... Do not breathe...",
        "Have you had the dream again? A black goat with seven eyes that watches from the outside...",
        "In the sunken city, he lays dreaming...",
        "Open me! Open me! Open me! Then only will you know peace.",
        "You resist... You cling to your life as if it actually matters... You will learn...",
        "Death is close...",
        "You are already dead.",
        "Your courage will fail.",
        "Your friends will abandon you.",
        "You will betray your friends.",
        "You will die.",
        "You are weak.",
        "Your heart will explode.",
        "It's all fun and games until someone loses an eye.",
        "Have you had the dream again? A black goat with seven eyes that watches from the outside.",
        "Shath'mag vwyq shu et'agthu, Shath'mag sshk ye! Krz'ek fhn'z agash zz maqdahl or'kaaxth'ma amqa!",
        "My dream has become your own",
        "Ph'nglui mglw'nafh ���� R'lyeh wgah'nagl fhtagn"

    ]

    return randomItem(quotes)
}

function removeSmallest(arr) {
    const smallest = Math.min(...arr);
    const index = arr.indexOf(smallest);

    return arr.filter((_, i) => i !== index);
}


async function getFormattedReply(character) {
    let reply = "<b>NAME: </b>" + character.name
    reply += "\n<b>CLASS: </b>" + character.classe.data.name + " " + character.level + "\n"
    if (character.scores) {
        reply +=
            "\n<b>STR: </b>" + character.scores['STR'] +
            "\n<b>DEX: </b>" + character.scores['DEX'] +
            "\n<b>CON: </b>" + character.scores['CON'] +
            "\n<b>INT: </b>" + character.scores['INT'] +
            "\n<b>WIS: </b>" + character.scores['WIS'] +
            "\n<b>CHA: </b>" + character.scores['CHA'] + "\n"
    }
    if (character.race) {
        reply += "\n<b>RACE: </b>" + character.race.data.name
        if (character.race.data.traits.length != 0) {
            reply += "\n<b>RACE TRAITS: </b>"
            for (let trait of character.race.data.traits) {
                let race_data = (await axios.get("http://www.dnd5eapi.co" + trait.url)).data
                reply += "\n<b>" + race_data.name + ":</b>\n" + race_data.desc.join(' ') + "\n"
            }
        }
    }
    if (character.subrace) {
        reply += "\n<b>SUBRACE: </b>" + character.subrace.data.name + "\n" + "\n<b>SUBRACE TRAITS: </b>"
        for (let trait of character.subrace.data.racial_traits) {
            let data = (await axios.get("http://www.dnd5eapi.co" + trait.url)).data
            reply += "\n<b>" + data.name + ":</b>\n" + data.desc.join(' ') + "\n"
        }
    }
    reply += "\n<b>BACKGROUND: </b>" + character.background.true_back.name
    reply += "\n<b><u>" + character.background.feature.name + "</u></b>\n" + character.background.feature.entries.join(' ') + "\n"


    reply += "\n<b>BACKGROUND PROFICIENCIES: </b>\n" + character.proficiencies.background + "\n"
    reply += "\n<b>CLASS PROFICIENCIES: </b>\n" + character.proficiencies.classe + "\n"
    if (character.proficiencies.race != false) {
        reply += "\n<b>RACE PROFICIENCIES: </b>\n" + character.proficiencies.race + "\n"
    }
    reply = replyescaper(reply)
    return reply;
}

async function getStandardChar(msg,level) {
      let name = getName(msg)
      let classe = await getClass(level)
      let race = await getRace()
      let subrace = await getSubrace(race)
      let scores = await getStandardScores(race,subrace)
      let background = await getBackground()
      let proficiencies = await getProficiencies(background.char_background,classe,race)
      let character = {
        name : name,
        level: level,
        classe : classe,
        race : race,
        subrace : subrace,
        scores : scores,
        background : background,
        proficiencies : proficiencies
        }
  return await getFormattedReply(character);
 }

async function getRolledScores(race, subrace) {
    let ability = await axios.get("http://www.dnd5eapi.co/api/ability-scores/")
    let values = []
    //let rolling = []
    let i
    for (i = 0; i < 7; i++) {
        //rolling = [abstractDice(1,6),abstractDice(1,6),abstractDice(1,6),abstractDice(1,6)]
        // rolling = rolling.sort().filter((_,i) => i)
        // let sum = rolling.reduce(function(a, b){
        //     return a + b;
        // }, 0);
        // values.push(sum)
        values.push(abstractDice(1,6)+abstractDice(1,6)+abstractDice(1,6))
    }
    values = removeSmallest(values)
    let scores = {}
    ability.data.results.forEach((element) => {
        let temp = randomItem(values)
        scores[element.name] = temp
        let index = values.indexOf(temp)
        if (index > -1) {
            values.splice(index, 1)
        }
    })
    race.data.ability_bonuses.forEach((ability_bonus) => {
        if (ability_bonus.ability_score.name in scores) {
            let bonus = ability_bonus.bonus
            let name = ability_bonus.ability_score.name
            //console.log(race.data.name, name, bonus)
            scores[name] += bonus
        }
    })

    if (subrace) {
        subrace.data.ability_bonuses.forEach((ability_bonus) => {
            if (ability_bonus.ability_score.name in scores) {
                let bonus = ability_bonus.bonus
                let name = ability_bonus.ability_score.name
                //console.log(subrace.data.name, name, bonus)
                scores[name] += bonus
            }
        })
    }
    return scores
}

async function getRolledChar(msg,level) {
    let name = getName(msg)
    let classe = await getClass(level)
    let race = await getRace()
    let subrace = await getSubrace(race)
    let scores = await getRolledScores(race,subrace)
    let background = await getBackground()
    let proficiencies = await getProficiencies(background.char_background,classe,race)
    let character = {
        name : name,
        level: level,
        classe : classe,
        race : race,
        subrace : subrace,
        scores : scores,
        background : background,
        proficiencies : proficiencies
    }
    return await getFormattedReply(character);
}

async function getFormattedSpell(spell) {

    let Fspell = "<u><b>" + spell.data.name + "</b></u>\n"
    Fspell += spell.data.level + " level " + spell.data.school.name + " " + ((spell.data.ritual === true) ? '(Ritual)' : '') + "\n"
    Fspell += "<b>Casting Time: </b>" + spell.data.casting_time + "\n"
    Fspell += "<b>Range: </b>" + spell.data.range + "\n"
    Fspell += "<b>Components: </b>" + spell.data.components.join(", ") + " (" + ((typeof spell.data.material === 'undefined') ? 'nessun materiale' : spell.data.material) + ")\n"
    Fspell += "<b>Duration: </b>" + ((spell.data.concentration === true) ? 'Concentration,' : '')+" "+ spell.data.duration + "\n"
    let classes = ""
    spell.data.classes.forEach((element,index) => ((index > 0) ? classes+=', '+element.name : classes+=element.name))
    Fspell += "<b>Classes: </b>"+ classes + "\n"
    Fspell += "<b>Description:\n</b>" + spell.data.desc + "\n"
    Fspell += ((typeof spell.data.higher_level === 'undefined') ? '' : "<b>Higer Levels:\n</b>" + spell.data.higher_level) + "\n"
    return Fspell;
}

function getName(msg) {
    let nameArray = msg.split(' ')
    nameArray.shift()
    let name = nameArray.join(' ')
    name = name.replace(/\s+/g, ' ')
    if (!name) {
        name = getRandomName();
    }
    return name
}

async function getClass(charLevel) {
    let ddclassmark = await axios.get("http://www.dnd5eapi.co/api/classes/")
    let ddclass = await axios.get("http://www.dnd5eapi.co/api/classes/" + randomItem(ddclassmark.data.results).index)
    //let ddclass = await axios.get("http://www.dnd5eapi.co/api/classes/monk")
    if (ddclass) {
        return ddclass
    }
}

 async function getRace() {
     let racemark = await axios.get("http://www.dnd5eapi.co/api/races/")
     let race = await axios.get("http://www.dnd5eapi.co/api/races/" + randomItem(racemark.data.results).index)
     //let race = await axios.get("http://www.dnd5eapi.co/api/races/half-elf")
     return race;
 }

async function getSubrace(race) {
    if (race.data.subraces.length) {
        let possibleraces = []
        let random = Math.round(Math.random() * 10)
        race.data.subraces.forEach((subrace) => {
            possibleraces.push(subrace.url)
        })
        if (random > 5) {
            return axios.get("http://www.dnd5eapi.co" + randomItem(possibleraces))
        } else {
           return false
        }
    } else {
        return false
    }
}

async function getStandardScores(race,subrace) {
    let values = [15, 14, 13, 12, 10, 8]
    let ability = await axios.get("http://www.dnd5eapi.co/api/ability-scores/")
    let scores = {}
    ability.data.results.forEach((element) => {
        let temp = randomItem(values)
        scores[element.name] = temp
        let index = values.indexOf(temp)
        if (index > -1) {
            values.splice(index, 1)
        }
    })
    race.data.ability_bonuses.forEach((ability_bonus) => {
        if (ability_bonus.ability_score.name in scores) {
            let bonus = ability_bonus.bonus
            let name = ability_bonus.ability_score.name
            //console.log(race.data.name, name, bonus)
            scores[name] += bonus
        }
    })

    if (subrace) {
        subrace.data.ability_bonuses.forEach((ability_bonus) => {
            if (ability_bonus.ability_score.name in scores) {
                let bonus = ability_bonus.bonus
                let name = ability_bonus.ability_score.name
                //console.log(subrace.data.name, name, bonus)
                scores[name] += bonus
            }
        })
    }
    return scores
}

async function getBackground() {
    let background = await axios.get("https://5e.tools/data/backgrounds.json?v=1.119.0")
    let vanillaback = []
    let true_back
    background.data.background.forEach((element) => {
        if (element.source == "PHB") {
            if (element.name != "Variant Guild Artisan (Guild Merchant)") {
                //console.log(element.name)
                vanillaback.push(element)
            }
        }
    })
        let char_background = randomItem(vanillaback)

        if (char_background.name.includes("Variant")) {
            //console.log(char_background)
            true_back = char_background._copy.name
            let feature
            let back
            for (back of vanillaback) {
                if (back.name == true_back) {
                    true_back = char_background
                    char_background = back
                    if (Array.isArray(true_back._copy._mod.entries)) {
                        feature = true_back._copy._mod.entries[1].items
                    } else {
                        feature = true_back._copy._mod.entries.items
                    }
                    return {true_back:true_back,feature:feature,char_background:char_background}
                }
            }
        } else {
            let feature = char_background.entries[1]
            return {
                true_back:char_background,
                feature:feature,
                char_background:char_background
            }
        }
}

async function getProficiencies(background,classe,race) {
    let profs = Object.keys(background.skillProficiencies[0])
    let stringa = profs.toString().replace(/,/g, ", ").capitalize()
    stringa = makeUpperCaseAfterCommas(stringa)
    let choose
    let profArray
    if (classe.data.name != 'Monk') {
         choose = classe.data.proficiency_choices[0].choose
         profArray = classe.data.proficiency_choices[0].from
    } else {
         choose = classe.data.proficiency_choices[2].choose
         profArray = classe.data.proficiency_choices[2].from
    }
    for (let prof of profs) {
        profArray = profArray.filter(function (obj) {
            return obj.name !== 'Skill: ' + prof.charAt(0).toUpperCase() + prof.slice(1)
        })
    }
    const shuffled = profArray.sort(() => 0.5 - Math.random())
    let chosenChoices = shuffled.slice(0, choose)
    chosenChoices = chosenChoices.map(e => e.name.replace("Skill: ",""))
    if (race.data.name == 'Half-Elf') {
        let skills = await axios.get("http://www.dnd5eapi.co/api/skills/")
        skills = skills.data.results
        for (let prof of chosenChoices) {
            skills = skills.filter(function (obj) {
                return obj.name !== prof.charAt(0).toUpperCase() + prof.slice(1)
            })
        }
        for (let prof of profs) {
            skills = skills.filter(function (obj) {
                return obj.name !== prof.charAt(0).toUpperCase() + prof.slice(1)
            })
        }
        const shuffled2 = skills.sort(() => 0.5 - Math.random())
        let he_profs = shuffled2.slice(0, 2)
        return{background:stringa,classe:chosenChoices.join(", "),race:he_profs.map(e => e.name).join(", ")}
    } else {
        return{background:stringa,classe:chosenChoices.join(", "),race:false}
    }

}

bot.command('randomchar', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //name
    let msg = ctx.message.text
    let charLevel = 1
    //name
    let reply = await getStandardChar(msg,charLevel)
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.command('randomrolledchar', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    //name
    let msg = ctx.message.text
    let charLevel = 1
    //name
    let reply = await getRolledChar(msg,charLevel)
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.command('randomspell', async (ctx) => {

    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
    let spellsArray = await axios.get("http://www.dnd5eapi.co/api/spells/")
    let spell = await axios.get("http://www.dnd5eapi.co/api/spells/" + randomItem(spellsArray.data.results).index)
    spell = await getFormattedSpell(spell)
    let reply = replyescaper(spell)
    await ctx.telegram.sendMessage(ctx.chat.id, reply, {parse_mode: "HTML"})
})

bot.help(async ctx => {
    await ctx.reply("This bot can do the following command:\n - /help\n - /randomchar\n - /randomspell\n -/randomrolledchar")
})

bot.start(async ctx => {
    await ctx.reply("Welcome to OneSpellPerRound, This bot can do the following command:\n - /help\n - /randomchar\n - /randomspell")
})

bot.hears(['piaga','Piaga','Reame remoto', 'Reame Remoto', 'reame remoto', 'reame Remoto','PIAGA','REAME REMOTO'],(ctx) => ctx.reply("<i>"+getRandomQuote()+"</i>",{parse_mode: "HTML"}))
bot.hears(['adam','Adamo','Adam', 'adamo','ADAM','ADAMO'], (ctx) => ctx.reply(" ̷̫̝̟̫̫̤̐̒͒͑ͅ ̸͔͈͓̪̙͓̪̄͛̂̚͘͘͠ ̶̡̗̮̯̍ ̸̡̣̪̻̣̭̱̑̃͂̑͘ ̷̪̻̍ ̶̼͇̩̻͖͆ ̷̮͉̤̳̦̦̈́͗̈́̊̀͒ ̴͍̱͇̬̖͇́̌͆͑͝F̸͓͚̹̼̠̆͜a̵̡̬̺͔͈̤̒t̷̪͖̟̀͊̍h̷̰͙͉͍̾̾e̸̛͚̞̝̝̳̹͗͜r̷͇̟̯̉̔ ̵̙̪͛̾̄̓̅͝ͅ ̵̛̭̺̥̦̙̠͙̓͑̈ ̵̻̐̇ ̸̠͙́̃̈́̾̎̚ ̵͍̰̲̹͓̹̾ ̶̢̲̙̪̖̮͇̆̀̀͊̕͝ ̴̨̱̲̩̳̬͑͑̀̐̀͐̓ ̸̢̢̺͕̼̘̾̓͆̈́̎̏ ̷̨̣̬̰̙̝͈̑͊w̵̹͇͖̟͐͜a̵̧̬̣̩̘̓͋̿͑t̵̢̧̬̙̤͍͆̋̒̓̕͜c̶̢̢̰͈̎h̴̹̪͌̈́̋̾̾͘͠ë̵̳́̌̇̓̈̀s̴̱̞͌̿ ̷̡̹̓̊́̓̋ ̸̖͔̖̀̈́̈ ̷͕̦̜̈͗̿̿̕̕ ̶̛̠̭̺̯̟̼̙͛̅́̀ ̶͙̌ ̸̢͚̫̦̜̿̂̚ ̶̦͚̲̘̦̹̋͊́͆͆͘͝ ̴͓̮̲͒̃ ̵̛̩̣͛̏̍́ ̷̨͔̜̰̯̩͂͋̑̉͌̉͐͜y̷͎̖͙͍͖͖̌̈͑͗̄̕͝o̶̩̣͋͑͑͘͝͠u̸̩̖͓̳̱̭͚͒̃́̈́ ̷̗̗̗̐̈̏͊ͅ ̷͎̞͓̹͔̬̈͌́́̓̃ ̷̠̱͔̪̰̂̊̃̽̉͜͝ͅ ̷̧̛̱͉̬̓̐̏̈́̕͘ ̸̘̲͒\n" +
    "̷͓͍͓͐̔̔͝ͅ ̵̼̃ ̶̟̋ ̵̹̺̭͙̦̫͐̿̄ ̵̫͈̬̫̀̒̂͛͝ ̵̪̣͈̙̖͉̫̓͋͝ ̴͇͍̱͌͊̃́͜ ̶̻͈̍̃͆ ̴͈͈͂͘ ̸͉͚̬̏̒ ̴̣̘͇̦̤̬̓́̾̔̅͠͝ ̶̝̭͉̜͇͇̣̾̈́̈́́̀̌ ̴̺͛̈́̈̓͌ ̵̼̳̳͎̪̇̃̔̆͛ ̷͔̮͊͗̓͛ ̴͇̜̇̈́͛̓̉̄ ̷̨̬͙̂͜ ̶̨͓̠̫̮̹̦̈́ ̸͖͚͕̭̣̙̣̀́ ̴͙̈̑̿̊̕ ̷̳̯̖̈́́͌̎ͅ ̶̱̬͊ ̸̞̘̣̪͑̋͌͋̌͌ ̵̖̹̐ ̸̯̰̪͍̝͎̘̽̔͛ ̶̡̧̛̤͙̱̪͍̃͠ ̵̯̠͋̃͛͠ ̸̦̫̘̞̣̊̉͑ ̸̡͍̖͕̣̄̿ ̴̃͛ͅ ̴͕̈͋̽͗̊̽ ̴̛̝͖̮̞̮̹̓̄͗̄̔ ̷̩̀ ̶̫̇̇ ̶̡͓͚͔̯͗̃̀̆̆ ̴̛̗̽̀́̕͝ ̴̧̪̼̱̤̟̒̈́͐̉̈͜ ̷͉͆͂̔̑͠͠ ̴̡̣͙͎͐́̇̏̿̎͠ ̵̝̳̰̞̫̬͔̒̐ ̴̛̻͔̱͇͉͎̺̃͊̃̾͆͛ ̸̛̻̩̈́͆͋͂͐͌͜ͅ ̴̳̱͖͈̹͋̆̃̒͒̇ ̵͔̰͍̥̞̲͆́ ̵̟̯̟̖͙̎͆̒̈́̀͝͝ ̵̗͋̏ ̴̛͓́̾̈́̿͝ͅ ̸̫̺̎̈̋͐̚ ̸̟̘̓ͅ ̵̧̈́̀͐ ̷̮̱̏̕͜ ̸̪̬̎ ̵̩͕̾̈́̿͊̒ ̴͉̽̒́́̈̚͜ ̷̺͔͙̘̅͊̈́̔́ ̴͔̺͕̍͜ ̶̹̝͔͙͔̄̋ͅ ̷̘̊͑̓̊ ̸̗̹͈̜͇̩̹̇͝ ̴͈͝ ̵̧̹͓͇̱͍͌͒͗͛͐̓ͅ ̶̼̻͍̆ ̴̨̙͈̳̮̯̆̔͑̀̍\n" +
    "̴͚̒͊̆̌ ̸̟͔̖̩̯̣̈́̈́͆͐̚ ̴̢̰̹͉̜͖̝̿̎͌̒̎͗͘f̸̝̠̂́r̴̪͙͑o̷̩͇̿͐m̸̛͇͑̑ ̴͖͍̰͍̝͉̯̈͂̕ ̶̢͗̋̑̆͠ ̷̮͕̣̓ ̶̨͈͉͉̞̹̏͂ ̵̪̠͎͇̮̑̏͠͝ ̴̡̦̍̅̎̉̈́͝ ̸̧͍͙͙͖̄́̊͌̚̚ ̵͎͌͛ ̷̟̯̌̔͂̽̇̍͠ ̶͇̜͉͚͈̬̈͑͘ţ̶̲̌h̸̦͎̥͊̓̌̐e̶̝̜̯̗͌ͅ ̴̙̈́̃͌̆͝͝ ̵̧̧̛̮͔̮̲͗̏̔̾ ̵̻͆̏̂͆̕̚͘ ̵̧̦͍̮̮̖̞͛̈́͊̿̄ ̸̡̞͈̥̖̲̦̀́̕ ̵̞̮͛͒̃́̏̍ͅ ̴̨̽̅͗̍̈́͜͝ ̴̝̞̠̬̭̣̈́͊̒̒̀̈́ ̶̘̇̂̍ ̷̰͎̞̮̽͋̾ ̶̩̯͒̃̀̎͠ ̵̤͒́ ̵̞̥͆̇̈͘N̶̪͗͘į̷̩̞̲̉g̶̨͎̈́̓h̵̲̣̬͈͂̑͠t̶̡̗̠̳̟̪̋͊̓͋͋̎͜m̵̬͍̠̍͗̃̓̌͠ä̴̖̼͎̺͎̳́͒͜͠r̸̛̗̞̜̺̆̇͒̋̚͘͜e̵̼̼͇̼̪͂̀̒̓͋͒ ̶̺̝͎̙̋͘͘͜ ̷̡̠̈ ̸̬͙̺̲̼͊̀͛̿̊͐̚͜ ̴̦̺̲͚͎̬̫͌̃̀́͑ ̶̡̢̟̬͍͚͂̌͆̏ ̸̳͆̈́̀ ̶̧̜̟͙͖͖̬̍̾͑ ̶̯͓̜̯̮̈" +
    "̴̧̩̫̾̀̓̈́̚̕"))
bot.hears(['nyarla','nyarlathotep','Nyarla','Nyarlathotep','NYARLA','NYARLATHOTEP','nyarlatothep','Nyarlatothep',"Araldo","araldo"], (ctx) => ctx.reply("<i>"+getRandomQuote()+"</i>",{parse_mode: "HTML"}))
bot.hears(['diario','Diario','tomo','Tomo','Quaderno','quaderno','libro','Libro'], (ctx) => ctx.reply(getBookQuote()))

bot.launch()
