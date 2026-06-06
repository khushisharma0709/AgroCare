const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const { loadEnv } = require("./modules/env");
const { handleWeather } = require("./modules/weather");
const { handleDiagnosis } = require("./modules/diagnosis");
const { getDiseaseModelStatus } = require("./modules/disease-model");
const { handleChatbot } = require("./modules/chatbot");
const { policies } = require("./modules/policies");
const { vlogTopics } = require("./modules/vlogs");
const { saveSubmission, readJson } = require("./modules/submissions");

loadEnv();

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    await serveStatic(url.pathname, res);
  } catch (error) {
    console.error(error);
    sendJson(res, error.statusCode || 500, { error: error.message || "Server error. Please try again." });
  }
});

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { status: "ok", app: "AgroCare API" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/model-status") {
    sendJson(res, 200, getDiseaseModelStatus());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/weather") {
    await handleWeather(url.searchParams.get("city"), res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/diagnose") {
    await handleDiagnosis(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/chatbot") {
    await handleChatbot(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/policies") {
    sendJson(res, 200, { policies });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/vlogs") {
    sendJson(res, 200, { topics: vlogTopics });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    const payload = await readJson(req);
    validateRequired(payload, ["name", "email", "message"]);
    await saveSubmission("contacts.json", payload);
    sendJson(res, 201, { message: "Contact message saved successfully." });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/feedback") {
    const payload = await readJson(req);
    validateRequired(payload, ["role", "rating", "comments"]);
    await saveSubmission("feedback.json", payload);
    sendJson(res, 201, { message: "Feedback saved successfully." });
    return;
  }

  sendJson(res, 404, { error: "API route not found." });
}

async function serveStatic(pathname, res) {
  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const type = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(file);
  } catch {
    const pageFallback = path.join(ROOT, "pages", path.basename(safePath));
    try {
      const file = await fs.readFile(pageFallback);
      const type = mimeTypes[path.extname(pageFallback).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(file);
    } catch {
      sendText(res, 404, "Page not found");
    }
  }
}

function validateRequired(payload, fields) {
  const missing = fields.filter((field) => !String(payload[field] || "").trim());
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

server.listen(PORT, () => {
  console.log(`AgroCare running at http://localhost:${PORT}`);
});
