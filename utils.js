const faker = require('faker')

const Prompts = {
    MartaLaPapera: "MartaLaPapera",
    BattuteDnD: "BattuteDnD",
    EpisodePromptValues: "EpisodePromptValues",
}

function extractStringBetweenCharacters(inputString, char1, char2) {
    const regex = new RegExp(`${char1}.*?${char2}`);
    const result = inputString.match(regex);

    return result ? result[0] : null;
}

function getRandomElementsFromArray(arr, number) {
    if (number< 1) {
        number = 2
    }
    if (!Array.isArray(arr) || typeof number !== 'number' || number < 1) {
        throw new Error('Invalid input. The first argument should be an array, and the second argument should be a positive number.');
    }

    if (arr.length <= 2) {
        throw new Error('The input array should have at least two elements.');
    }

    const selectedElements = [];

    while (selectedElements.length < number) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        const randomElement = arr[randomIndex];

        if (!selectedElements.includes(randomElement)) {
            selectedElements.push(randomElement);
            arr = arr.filter(el => el !== randomElement)
        }
    }

    return selectedElements;
}

const removeCharExceptFirstAndLast = (inputString, character) => {
    const firstIndex = inputString.indexOf(character);
    const lastIndex = inputString.lastIndexOf(character);

    if (firstIndex === -1 || firstIndex === lastIndex) {
        return inputString;
    }

    const charactersToRemove = inputString.slice(firstIndex + 1, lastIndex).split(character).join('');
    return inputString.slice(0, firstIndex + 1) + charactersToRemove + inputString.slice(lastIndex);
}

const chunk = (str, size) =>
    Array.from({ length: Math.ceil(str.length / size) }, (v, i) =>
        str.slice(i * size, i * size + size)
    );

module.exports = {
    Prompts,
    extractStringBetweenCharacters,
    chunk,
    getRandomElementsFromArray,
    removeCharExceptFirstAndLast,
    getRandomName:function() {
    return faker.name.findName();
    },
    abstractDice:function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
    },
    makeUpperCaseAfterCommas:function(str) {
    return str.replace(/,\s*([a-z])/g, function(d,e) { return ", "+e.toUpperCase() });
    },
    replyEscaper:function(reply) {
    reply = reply.split("-").join("\-")
    reply = reply.split(".").join("\.")
    reply = reply.split("(").join("\(")
    reply = reply.split(")").join("\)")
    return reply
    },
    removeFromArray: function(array,value) {
    let index = array.indexOf(value)
    return array.splice(index,1)
},
    removeSmallest:function(arr) {
    const smallest = Math.min(...arr);
    const index = arr.indexOf(smallest);

    return arr.filter((_, i) => i !== index);
    }

};
