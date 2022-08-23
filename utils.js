const faker = require('faker')

module.exports = {

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
