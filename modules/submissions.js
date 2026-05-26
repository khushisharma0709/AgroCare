const fs = require("node:fs/promises");
const path = require("node:path");
const { readJson } = require("./common");

const DATA_DIR = path.join(__dirname, "..", "data");

async function saveSubmission(fileName, payload) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, fileName);
  let existing = [];

  try {
    existing = JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    existing = [];
  }

  existing.push({
    ...payload,
    createdAt: new Date().toISOString()
  });

  await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
}

module.exports = {
  readJson,
  saveSubmission
};
