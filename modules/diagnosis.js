const { readBody, sendJson } = require("./common");
const { predictDisease } = require("./disease-model");

async function handleDiagnosis(req, res) {
  const body = await readBody(req);
  const fileName = findMultipartFileName(req.headers["content-type"], body) || "crop-image";
  const prediction = await predictDisease({ fileName, imageBuffer: body });
  sendJson(res, 200, {
    fileName,
    imageSizeKb: Math.max(1, Math.round(body.length / 1024)),
    ...prediction
  });
}

function findMultipartFileName(contentType, body) {
  if (!contentType || !contentType.includes("multipart/form-data")) return null;
  const header = body.toString("latin1", 0, Math.min(body.length, 2000));
  const match = header.match(/filename="([^"]+)"/);
  return match ? match[1] : null;
}

module.exports = {
  handleDiagnosis
};
