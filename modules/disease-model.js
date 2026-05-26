const fs = require("node:fs/promises");
const path = require("node:path");

const MODEL_DIR = path.join(__dirname, "..", "models", "crop-disease");
const LABELS_PATH = path.join(MODEL_DIR, "labels.txt");
const MODEL_CONFIG_PATH = path.join(MODEL_DIR, "model.json");
const DEFAULT_HF_MODEL = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification";

function getDiseaseModelStatus() {
  return {
    usePublicHfModel: process.env.USE_PUBLIC_HF_MODEL === "true",
    hasHuggingFaceToken: Boolean(process.env.HUGGINGFACE_API_TOKEN),
    cropDiseaseModelId: process.env.CROP_DISEASE_MODEL_ID || DEFAULT_HF_MODEL,
    hasCustomModelUrl: Boolean(process.env.DISEASE_MODEL_URL)
  };
}

async function predictDisease({ fileName, imageBuffer }) {
  if (process.env.DISEASE_MODEL_URL) {
    return predictWithExternalModel({ fileName, imageBuffer });
  }

  if (process.env.HUGGINGFACE_API_TOKEN || process.env.USE_PUBLIC_HF_MODEL === "true") {
    return predictWithHuggingFace({ imageBuffer });
  }

  const localModel = await readLocalModelConfig();
  if (!localModel.ready) {
    const error = new Error(localModel.message);
    error.statusCode = 503;
    throw error;
  }

  return {
    model: localModel.name,
    status: "Model files found",
    crop: "Waiting for ML runtime",
    confidence: "0%",
    severity: "Unknown",
    symptoms: "Model configuration is present, but Node TensorFlow runtime is not installed in this dependency-free project.",
    treatment: [
      "Install a runtime such as @tensorflow/tfjs-node or expose your trained model through DISEASE_MODEL_URL.",
      "Then map the model output labels from models/crop-disease/labels.txt.",
      "Use clear close-up leaf images for accurate prediction."
    ],
    predictions: localModel.labels.map((label) => ({ label, confidence: "runtime needed" })).slice(0, 5),
    note: "This project is wired for a real ML model. Add DISEASE_MODEL_URL for immediate working predictions, or install TensorFlow runtime for local model inference."
  };
}

async function predictWithHuggingFace({ imageBuffer }) {
  const modelId = process.env.CROP_DISEASE_MODEL_ID || DEFAULT_HF_MODEL;
  if (!process.env.HUGGINGFACE_API_TOKEN) {
    const error = new Error("HUGGINGFACE_API_TOKEN is required to use the trained Hugging Face crop disease model.");
    error.statusCode = 401;
    throw error;
  }

  const headers = { "Content-Type": "application/octet-stream" };

  headers.Authorization = `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`;

  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${modelId}`, {
    method: "POST",
    headers,
    body: imageBuffer
  });

  const result = await readModelResponse(response);

  if (!response.ok || result.error) {
    const error = new Error(result.error || "Hugging Face crop disease model needs a valid HUGGINGFACE_API_TOKEN.");
    error.statusCode = response.status || 502;
    throw error;
  }

  return normalizeHuggingFaceResult(result, modelId);
}

async function readModelResponse(response) {
  const text = await response.text();
  if (text.trim().startsWith("<!DOCTYPE html") || text.trim().startsWith("<html")) {
    return {
      error: response.status === 401
        ? "Hugging Face returned 401 Unauthorized. Set a valid HUGGINGFACE_API_TOKEN."
        : `Hugging Face returned HTML error page with status ${response.status}.`
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: text || "Model provider returned a non-JSON response."
    };
  }
}

async function predictWithExternalModel({ fileName, imageBuffer }) {
  const response = await fetch(process.env.DISEASE_MODEL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName,
      imageBase64: imageBuffer.toString("base64")
    })
  });

  if (!response.ok) {
    const error = new Error("Configured disease ML model API is not responding.");
    error.statusCode = 502;
    throw error;
  }

  const result = await response.json();
  return normalizeModelResult(result);
}

async function readLocalModelConfig() {
  try {
    const [modelConfig, labelsRaw] = await Promise.all([
      fs.readFile(MODEL_CONFIG_PATH, "utf8"),
      fs.readFile(LABELS_PATH, "utf8")
    ]);
    const parsed = JSON.parse(modelConfig);
    const labels = labelsRaw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    return {
      ready: true,
      name: parsed.name || "Local crop disease ML model",
      labels
    };
  } catch {
    return {
      ready: false,
      message: "ML model missing. Add your trained crop disease model in models/crop-disease/ or set DISEASE_MODEL_URL in environment."
    };
  }
}

function normalizeModelResult(result) {
  return {
    model: result.model || "External crop disease ML model",
    status: result.status || result.disease || result.prediction || "Prediction received",
    crop: result.crop || "Unknown crop",
    confidence: String(result.confidence || "N/A"),
    severity: result.severity || "Unknown",
    symptoms: result.symptoms || "Symptoms depend on the detected class.",
    treatment: Array.isArray(result.treatment) ? result.treatment : [result.advice || "Consult a local agriculture expert before treatment."],
    predictions: Array.isArray(result.predictions) ? result.predictions : [],
    note: result.note || "Prediction returned by configured ML model API."
  };
}

function normalizeHuggingFaceResult(result, modelId) {
  const predictions = Array.isArray(result) ? result : [];
  const top = predictions[0] || {};
  const parsed = parsePlantVillageLabel(top.label || "Unknown");

  return {
    model: `Hugging Face: ${modelId}`,
    status: parsed.disease,
    crop: parsed.crop,
    confidence: formatConfidence(top.score),
    severity: getSeverity(top.score),
    symptoms: getSymptoms(parsed.disease),
    treatment: getTreatment(parsed.disease),
    predictions: predictions.slice(0, 5).map((item) => ({
      label: item.label,
      confidence: formatConfidence(item.score)
    })),
    note: "Prediction generated by a public trained PlantVillage crop disease image-classification model."
  };
}

function parsePlantVillageLabel(label) {
  const clean = String(label).replaceAll("___", " - ").replaceAll("_", " ");
  const healthyMatch = clean.match(/^Healthy\s+(.+?)\s+Plant$/i);
  if (healthyMatch) {
    return {
      crop: healthyMatch[1],
      disease: "Healthy"
    };
  }

  const withMatch = clean.match(/^(.+?)\s+with\s+(.+)$/i);
  if (withMatch) {
    return {
      crop: withMatch[1],
      disease: withMatch[2]
    };
  }

  const parts = clean.split(" - ");
  return {
    crop: parts[0] || "Unknown crop",
    disease: parts.slice(1).join(" - ") || clean
  };
}

function formatConfidence(score) {
  if (typeof score !== "number") return "N/A";
  return `${Math.round(score * 100)}%`;
}

function getSeverity(score) {
  if (typeof score !== "number") return "Unknown";
  if (score >= 0.85) return "High confidence";
  if (score >= 0.6) return "Medium confidence";
  return "Low confidence";
}

function getSymptoms(disease) {
  const text = disease.toLowerCase();
  if (text.includes("healthy")) return "The model detected a healthy class for this crop.";
  if (text.includes("blight")) return "Blight often appears as dark or brown lesions that spread across leaves.";
  if (text.includes("rust")) return "Rust often appears as orange, yellow, or brown powder-like spots.";
  if (text.includes("spot")) return "Leaf spot diseases commonly show circular or irregular spots on leaves.";
  if (text.includes("mildew")) return "Mildew often appears as white or powdery fungal growth on leaves.";
  if (text.includes("mold")) return "Leaf mold can show yellowing on top leaf surfaces and mold growth underneath.";
  return "Symptoms depend on the predicted disease class. Compare the uploaded leaf with field symptoms.";
}

function getTreatment(disease) {
  const text = disease.toLowerCase();
  if (text.includes("healthy")) {
    return ["Continue regular monitoring.", "Keep balanced irrigation and nutrition.", "Upload another clear image if symptoms appear."];
  }
  if (text.includes("virus") || text.includes("curl") || text.includes("mosaic")) {
    return ["Remove heavily infected plants if symptoms are severe.", "Control vector insects such as whitefly or aphids.", "Avoid using seed or cuttings from infected plants."];
  }
  if (text.includes("blight") || text.includes("spot") || text.includes("mildew") || text.includes("mold") || text.includes("rust")) {
    return ["Remove infected leaves and field debris.", "Avoid overhead watering and improve air circulation.", "Use a locally recommended fungicide only after expert confirmation."];
  }
  return ["Isolate affected plants if possible.", "Avoid unnecessary irrigation on leaves.", "Confirm treatment with a local agriculture expert before chemical use."];
}

module.exports = {
  getDiseaseModelStatus,
  predictDisease
};
