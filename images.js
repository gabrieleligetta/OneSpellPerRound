//https://images-api.nasa.gov/search?q=black-hole

const randomItem = require("random-item");
const axios = require("axios");
let keywords = ['black-hole','galaxy']
let ImageGlobal = []


async function getRandomSpaceImage() {
    let keyword = randomItem(keywords);
    return await axios.get("https://images-api.nasa.gov/search?q="+keyword)

}

module.exports = {
    getSpaceImage:async function() {
        let images = await getRandomSpaceImage()
        images = images.data.collection.items
        let imageUrl =randomItem(images)
        console.log(imageUrl)
        imageUrl = imageUrl.links[0].href
        console.log(imageUrl)
        return imageUrl
    }
};
