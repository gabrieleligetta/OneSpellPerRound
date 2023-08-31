import faker from "faker";

export const Prompts = {
  MartaLaPapera: "MartaLaPapera",
  BattuteDnD: "BattuteDnD",
  EpisodePromptValues: "EpisodePromptValues",
};

export function extractStringBetweenCharacters(inputString, char1, char2) {
  const regex = new RegExp(`${char1}.*?${char2}`);
  const result = inputString.match(regex);

  return result ? result[0] : null;
}

export function getRandomElementsFromArray(arr, number) {
  if (number < 1 || typeof number !== "number") {
    number = 2;
  }
  if (!Array.isArray(arr)) {
    throw new Error(
      "Invalid input. The first argument should be an array, and the second argument should be a positive number."
    );
  }

  if (arr.length <= 2) {
    throw new Error("The input array should have at least two elements.");
  }

  const selectedElements = [];

  while (selectedElements.length < number) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    const randomElement = arr[randomIndex];

    if (!selectedElements.includes(randomElement)) {
      selectedElements.push(randomElement);
      arr = arr.filter((el) => el !== randomElement);
    }
  }

  return selectedElements;
}

export function getRandomAndRemove(arr) {
  // Check if the array is empty
  if (arr.length === 0) {
    return undefined; // Return undefined if the array is empty
  }

  // Generate a random index within the array length
  const randomIndex = Math.floor(Math.random() * arr.length);

  // Get the randomly selected element
  const randomElement = arr[randomIndex];

  // Remove the selected element from the array
  arr.splice(randomIndex, 1);

  return randomElement;
}

export const removeCharExceptFirstAndLast = (inputString, character) => {
  const firstIndex = inputString.indexOf(character);
  const lastIndex = inputString.lastIndexOf(character);

  if (firstIndex === -1 || firstIndex === lastIndex) {
    return inputString;
  }

  const charactersToRemove = inputString
    .slice(firstIndex + 1, lastIndex)
    .split(character)
    .join("");
  return (
    inputString.slice(0, firstIndex + 1) +
    charactersToRemove +
    inputString.slice(lastIndex)
  );
};

export const chunk = (str, size) =>
  Array.from({ length: Math.ceil(str.length / size) }, (v, i) =>
    str.slice(i * size, i * size + size)
  );

export const abstractDice = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomName = () => {
  return faker.name.findName();
};
export const makeUpperCaseAfterCommas = (str) => {
  return str.replace(/,\s*([a-z])/g, function (d, e) {
    return ", " + e.toUpperCase();
  });
};
export const replyEscaper = (reply) => {
  reply = reply.split("-").join("-");
  reply = reply.split(".").join(".");
  reply = reply.split("(").join("(");
  reply = reply.split(")").join(")");
  return reply;
};
export const removeFromArray = (array, value) => {
  let index = array.indexOf(value);
  return array.splice(index, 1);
};
export const removeSmallest = (arr) => {
  const smallest = Math.min(...arr);
  const index = arr.indexOf(smallest);

  return arr.filter((_, i) => i !== index);
};
export const makeid = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
