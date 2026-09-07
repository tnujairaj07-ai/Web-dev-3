// fileManager.js
const fs = require("fs/promises");
const path = require("path");

const filePath = path.join(__dirname, "test.txt");

async function manageFiles() {
  try {
    // 1. Create File
    console.log("Creating File...");
    await fs.writeFile(filePath, "Hello Node.js\n");
    console.log("File Created");

    // 2. Read File
    console.log("Reading File");
    let content = await fs.readFile(filePath, "utf-8");
    process.stdout.write(content);

    // 3. Update File (Append)
    await fs.appendFile(filePath, "Learning FS Module\n");
    console.log("File Updated");

    // 4. Read File Again
    content = await fs.readFile(filePath, "utf-8");
    process.stdout.write(content);

    // 5. Delete File
    await fs.unlink(filePath);
    console.log("File Deleted");
  } catch (err) {
    console.error("File Operation Error:", err.message);
  }
}

manageFiles();