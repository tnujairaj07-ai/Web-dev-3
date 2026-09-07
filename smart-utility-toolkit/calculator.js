// calculator.js
const args = process.argv.slice(2);

const operation = args[0]?.toLowerCase();
const num1 = parseFloat(args[1]);
const num2 = parseFloat(args[2]);

if (!operation || isNaN(num1) || isNaN(num2)) {
  console.log("Usage: node calculator.js <add|sub|mult|div> <num1> <num2>");
  process.exit(1);
}

let result;

switch (operation) {
  case "add":
    result = num1 + num2;
    break;
  case "sub":
    result = num1 - num2;
    break;
  case "mult":
    result = num1 * num2;
    break;
  case "div":
    if (num2 === 0) {
      console.log("Error: Division by zero is not allowed.");
      process.exit(1);
    }
    result = num1 / num2;
    break;
  default:
    console.log(`Error: Unknown operation "${operation}". Use add, sub, mult, or div.`);
    process.exit(1);
}

console.log(`Result: ${result}`);