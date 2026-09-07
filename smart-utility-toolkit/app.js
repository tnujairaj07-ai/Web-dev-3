// app.js
const isEven = require("./modules/isEven");
const { logInfo, logError } = require("./modules/logger");

logInfo("Application started.");

const numbers = [4, 7, 12, 19];

numbers.forEach((num) => {
  if (isEven(num)) {
    logInfo(`${num} is Even`);
  } else {
    logInfo(`${num} is Odd`);
  }
});

logError("Sample error logged successfully.");