const { readBody, sendJson } = require("./common");
const { predictDisease } = require("./disease-model");

async function handleDiagnosis(req, res) {
  const body = await readBody(req);

  const contentType = req.headers["content-type"] || "";

  const boundaryMatch = contentType.match(/boundary=(.*)$/);

  if (!boundaryMatch) {
    return sendJson(res, 400, { error: "Invalid multipart form data" });
  }

  const boundary = boundaryMatch[1];

  const parts = body
    .toString("latin1")
    .split(`--${boundary}`);

  const filePart = parts.find((part) =>
    part.includes("filename=")
  );

  if (!filePart) {
    return sendJson(res, 400, { error: "No image uploaded" });
  }

  const fileNameMatch = filePart.match(/filename="([^"]+)"/);

  const fileName = fileNameMatch
    ? fileNameMatch[1]
    : "crop-image";

  const startIndex = filePart.indexOf("\r\n\r\n");

  const imageData = filePart.substring(startIndex + 4);

  const imageBuffer = Buffer.from(
    imageData.replace(/\r\n$/, ""),
    "latin1"
  );

  const prediction = await predictDisease({
    fileName,
    imageBuffer
  });

  sendJson(res, 200, {
    fileName,
    imageSizeKb: Math.max(
      1,
      Math.round(imageBuffer.length / 1024)
    ),
    ...prediction
  });
}

module.exports = {
  handleDiagnosis
};