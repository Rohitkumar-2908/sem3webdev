const isEven = require("./modules/isEven");
const logger = require("./modules/logger");

logger("Application started.");

let number = 16;

console.log("Number:", number);
console.log("Is even?", isEven(number));

logger("Application finished.");