# Crop Disease ML Model

Place your trained crop disease model files here.

Supported project flow:

1. Built-in public trained model option:

This project can call a Hugging Face PlantVillage trained model:

```bash
set USE_PUBLIC_HF_MODEL=true
set CROP_DISEASE_MODEL_ID=linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification
npm start
```

For more reliable Hugging Face inference, also set a token:
The Hugging Face router requires an API token for model inference.

```bash
set HUGGINGFACE_API_TOKEN=your_token_here
```

2. Preferred for production: run your own trained model as an API and set:

```bash
DISEASE_MODEL_URL=http://localhost:5000/predict
```

The API should accept JSON:

```json
{
  "fileName": "leaf.jpg",
  "imageBase64": "..."
}
```

And return JSON:

```json
{
  "model": "Crop disease CNN",
  "crop": "Tomato",
  "status": "Late blight",
  "confidence": "91%",
  "severity": "High",
  "symptoms": "Dark spots on leaves",
  "treatment": ["Remove infected leaves", "Avoid overhead watering"],
  "predictions": [
    { "label": "Tomato - Late blight", "confidence": "91%" }
  ]
}
```

3. Local model files can be stored here as:

- `model.json`
- `labels.txt`

Local TensorFlow inference needs a runtime such as `@tensorflow/tfjs-node`, which is not installed by default in this dependency-free Node project.
