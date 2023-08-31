import randomItem from "random-item";

module.exports = {
  getRandomQuote: function () {
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
      "Ph'nglui mglw'nafh ���� R'lyeh wgah'nagl fhtagn",
    ];

    return randomItem(quotes);
  },
  getBookQuote: function () {
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
    ];
    return randomItem(book);
  },
  getFatherQuote: function () {
    let father = [
      " ̷̫̝̟̫̫̤̐̒͒͑ͅ ̸͔͈͓̪̙͓̪̄͛̂̚͘͘͠ ̶̡̗̮̯̍ ̸̡̣̪̻̣̭̱̑̃͂̑͘ ̷̪̻̍ ̶̼͇̩̻͖͆ ̷̮͉̤̳̦̦̈́͗̈́̊̀͒ ̴͍̱͇̬̖͇́̌͆͑͝F̸͓͚̹̼̠̆͜a̵̡̬̺͔͈̤̒t̷̪͖̟̀͊̍h̷̰͙͉͍̾̾e̸̛͚̞̝̝̳̹͗͜r̷͇̟̯̉̔ ̵̙̪͛̾̄̓̅͝ͅ ̵̛̭̺̥̦̙̠͙̓͑̈ ̵̻̐̇ ̸̠͙́̃̈́̾̎̚ ̵͍̰̲̹͓̹̾ ̶̢̲̙̪̖̮͇̆̀̀͊̕͝ ̴̨̱̲̩̳̬͑͑̀̐̀͐̓ ̸̢̢̺͕̼̘̾̓͆̈́̎̏ ̷̨̣̬̰̙̝͈̑͊w̵̹͇͖̟͐͜a̵̧̬̣̩̘̓͋̿͑t̵̢̧̬̙̤͍͆̋̒̓̕͜c̶̢̢̰͈̎h̴̹̪͌̈́̋̾̾͘͠ë̵̳́̌̇̓̈̀s̴̱̞͌̿ ̷̡̹̓̊́̓̋ ̸̖͔̖̀̈́̈ ̷͕̦̜̈͗̿̿̕̕ ̶̛̠̭̺̯̟̼̙͛̅́̀ ̶͙̌ ̸̢͚̫̦̜̿̂̚ ̶̦͚̲̘̦̹̋͊́͆͆͘͝ ̴͓̮̲͒̃ ̵̛̩̣͛̏̍́ ̷̨͔̜̰̯̩͂͋̑̉͌̉͐͜y̷͎̖͙͍͖͖̌̈͑͗̄̕͝o̶̩̣͋͑͑͘͝͠u̸̩̖͓̳̱̭͚͒̃́̈́ ̷̗̗̗̐̈̏͊ͅ ̷͎̞͓̹͔̬̈͌́́̓̃ ̷̠̱͔̪̰̂̊̃̽̉͜͝ͅ ̷̧̛̱͉̬̓̐̏̈́̕͘ ̸̘̲͒\n" +
        "̷͓͍͓͐̔̔͝ͅ ̵̼̃ ̶̟̋ ̵̹̺̭͙̦̫͐̿̄ ̵̫͈̬̫̀̒̂͛͝ ̵̪̣͈̙̖͉̫̓͋͝ ̴͇͍̱͌͊̃́͜ ̶̻͈̍̃͆ ̴͈͈͂͘ ̸͉͚̬̏̒ ̴̣̘͇̦̤̬̓́̾̔̅͠͝ ̶̝̭͉̜͇͇̣̾̈́̈́́̀̌ ̴̺͛̈́̈̓͌ ̵̼̳̳͎̪̇̃̔̆͛ ̷͔̮͊͗̓͛ ̴͇̜̇̈́͛̓̉̄ ̷̨̬͙̂͜ ̶̨͓̠̫̮̹̦̈́ ̸͖͚͕̭̣̙̣̀́ ̴͙̈̑̿̊̕ ̷̳̯̖̈́́͌̎ͅ ̶̱̬͊ ̸̞̘̣̪͑̋͌͋̌͌ ̵̖̹̐ ̸̯̰̪͍̝͎̘̽̔͛ ̶̡̧̛̤͙̱̪͍̃͠ ̵̯̠͋̃͛͠ ̸̦̫̘̞̣̊̉͑ ̸̡͍̖͕̣̄̿ ̴̃͛ͅ ̴͕̈͋̽͗̊̽ ̴̛̝͖̮̞̮̹̓̄͗̄̔ ̷̩̀ ̶̫̇̇ ̶̡͓͚͔̯͗̃̀̆̆ ̴̛̗̽̀́̕͝ ̴̧̪̼̱̤̟̒̈́͐̉̈͜ ̷͉͆͂̔̑͠͠ ̴̡̣͙͎͐́̇̏̿̎͠ ̵̝̳̰̞̫̬͔̒̐ ̴̛̻͔̱͇͉͎̺̃͊̃̾͆͛ ̸̛̻̩̈́͆͋͂͐͌͜ͅ ̴̳̱͖͈̹͋̆̃̒͒̇ ̵͔̰͍̥̞̲͆́ ̵̟̯̟̖͙̎͆̒̈́̀͝͝ ̵̗͋̏ ̴̛͓́̾̈́̿͝ͅ ̸̫̺̎̈̋͐̚ ̸̟̘̓ͅ ̵̧̈́̀͐ ̷̮̱̏̕͜ ̸̪̬̎ ̵̩͕̾̈́̿͊̒ ̴͉̽̒́́̈̚͜ ̷̺͔͙̘̅͊̈́̔́ ̴͔̺͕̍͜ ̶̹̝͔͙͔̄̋ͅ ̷̘̊͑̓̊ ̸̗̹͈̜͇̩̹̇͝ ̴͈͝ ̵̧̹͓͇̱͍͌͒͗͛͐̓ͅ ̶̼̻͍̆ ̴̨̙͈̳̮̯̆̔͑̀̍\n" +
        "̴͚̒͊̆̌ ̸̟͔̖̩̯̣̈́̈́͆͐̚ ̴̢̰̹͉̜͖̝̿̎͌̒̎͗͘f̸̝̠̂́r̴̪͙͑o̷̩͇̿͐m̸̛͇͑̑ ̴͖͍̰͍̝͉̯̈͂̕ ̶̢͗̋̑̆͠ ̷̮͕̣̓ ̶̨͈͉͉̞̹̏͂ ̵̪̠͎͇̮̑̏͠͝ ̴̡̦̍̅̎̉̈́͝ ̸̧͍͙͙͖̄́̊͌̚̚ ̵͎͌͛ ̷̟̯̌̔͂̽̇̍͠ ̶͇̜͉͚͈̬̈͑͘ţ̶̲̌h̸̦͎̥͊̓̌̐e̶̝̜̯̗͌ͅ ̴̙̈́̃͌̆͝͝ ̵̧̧̛̮͔̮̲͗̏̔̾ ̵̻͆̏̂͆̕̚͘ ̵̧̦͍̮̮̖̞͛̈́͊̿̄ ̸̡̞͈̥̖̲̦̀́̕ ̵̞̮͛͒̃́̏̍ͅ ̴̨̽̅͗̍̈́͜͝ ̴̝̞̠̬̭̣̈́͊̒̒̀̈́ ̶̘̇̂̍ ̷̰͎̞̮̽͋̾ ̶̩̯͒̃̀̎͠ ̵̤͒́ ̵̞̥͆̇̈͘N̶̪͗͘į̷̩̞̲̉g̶̨͎̈́̓h̵̲̣̬͈͂̑͠t̶̡̗̠̳̟̪̋͊̓͋͋̎͜m̵̬͍̠̍͗̃̓̌͠ä̴̖̼͎̺͎̳́͒͜͠r̸̛̗̞̜̺̆̇͒̋̚͘͜e̵̼̼͇̼̪͂̀̒̓͋͒ ̶̺̝͎̙̋͘͘͜ ̷̡̠̈ ̸̬͙̺̲̼͊̀͛̿̊͐̚͜ ̴̦̺̲͚͎̬̫͌̃̀́͑ ̶̡̢̟̬͍͚͂̌͆̏ ̸̳͆̈́̀ ̶̧̜̟͙͖͖̬̍̾͑ ̶̯͓̜̯̮̈" +
        "̴̧̩̫̾̀̓̈́̚̕",
    ];
    return randomItem(father);
  },
};
