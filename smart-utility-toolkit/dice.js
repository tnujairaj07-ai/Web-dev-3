// dice.js
const crypto = require("crypto");

function rollDice() {
  // Generates integer: min <= result < max
  return crypto.randomInt(1, 7);
}

// Single roll test
console.log(`Dice Rolled: ${rollDice()}`);

// Simulation using a loop
console.log("\nSimulating 5 Dice Rolls:");
for (let i = 1; i <= 5; i++) {
  console.log(`Roll ${i}: ${rollDice()}`);
}