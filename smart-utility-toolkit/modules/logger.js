// modules/logger.js
function logInfo(message) {
  const timestamp = new Date().toISOString();
  console.log(`[INFO - ${timestamp}] ${message}`);
}

function logError(message) {
  const timestamp = new Date().toISOString();
  console.log(`[ERROR - ${timestamp}] ${message}`);
}

module.exports = { logInfo, logError };