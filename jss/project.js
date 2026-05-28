const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

const diagnosisInput = document.querySelector("#crop-photo");
const diagnosisResult = document.querySelector("#diagnosis-result");

if (diagnosisInput && diagnosisResult) {
  diagnosisInput.addEventListener("change", async () => {
    const file = diagnosisInput.files[0];
    if (!file) return;

    diagnosisResult.innerHTML = `<p class="loading-text">Uploading image and checking crop health...</p>`;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const result = await apiFetch("/api/diagnose", {
        method: "POST",
        body: formData
      });

      const preview = URL.createObjectURL(file);
      diagnosisResult.innerHTML = `
        <h3>${escapeHtml(result.status)}</h3>
        <p><strong>Model:</strong> ${escapeHtml(result.model || "Crop disease ML model")}</p>
        <p><strong>Crop:</strong> ${escapeHtml(result.crop || "Unknown")}</p>
        <p><strong>Confidence:</strong> ${escapeHtml(result.confidence)}</p>
        <p><strong>Severity:</strong> ${escapeHtml(result.severity || "Unknown")}</p>
        <p><strong>File:</strong> ${escapeHtml(result.fileName)} (${escapeHtml(String(result.imageSizeKb))} KB)</p>
        <p><strong>Symptoms:</strong> ${escapeHtml(result.symptoms || "Not available")}</p>
        ${renderTreatment(result.treatment)}
        ${renderPredictions(result.predictions)}
        <p class="note">${escapeHtml(result.note)}</p>
        <img class="preview-img" src="${preview}" alt="Uploaded crop preview">
      `;
    } catch (error) {
      showError(diagnosisResult, error.message);
    }
  });
}

const weatherForm = document.querySelector("#weather-form");
const weatherResult = document.querySelector("#weather-result");

if (weatherForm && weatherResult) {
  weatherForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = new FormData(weatherForm).get("city").trim();

    if (!city) {
      showError(weatherResult, "Please enter a city name.");
      return;
    }

    weatherResult.innerHTML = `<p class="loading-text">Fetching live weather...</p>`;

    try {
      const weather = await apiFetch(`/api/weather?city=${encodeURIComponent(city)}`);
      weatherResult.innerHTML = `
        <h3>${escapeHtml(weather.location)}</h3>
        <p><strong>${escapeHtml(weather.temperature)}</strong> and ${escapeHtml(weather.condition)}</p>
        <p>Humidity: ${escapeHtml(weather.humidity)} | Wind: ${escapeHtml(weather.wind)}</p>
        <p>Precipitation: ${escapeHtml(weather.precipitation)}</p>
        <p>${escapeHtml(weather.advice)}</p>
      `;
    } catch (error) {
      showError(weatherResult, error.message);
    }
  });
}

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitJsonForm(contactForm, "/api/contact", "#contact-message");
  });
}

const feedbackForm = document.querySelector("#feedback-form");

if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitJsonForm(feedbackForm, "/api/feedback", "#feedback-message");
  });
}

const chatbotForm = document.querySelector("#chatbot-form");
const chatMessages = document.querySelector("#chat-messages");

if (chatbotForm && chatMessages) {
  chatbotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = chatbotForm.elements.message;
    const message = input.value.trim();
    if (!message) return;

    addChatMessage(message, "user");
    input.value = "";
    const loadingMessage = addChatMessage("Thinking...", "bot");

    try {
      const result = await apiFetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      loadingMessage.textContent = result.reply;
    } catch (error) {
      loadingMessage.textContent = error.message;
      loadingMessage.classList.add("error-text");
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

const policiesContainer = document.querySelector("#policies-list");

if (policiesContainer) {
  loadCards("/api/policies", "policies", policiesContainer, (policy) => `
    <article class="info-card">
      <h3>${escapeHtml(policy.title)}</h3>
      <p>${escapeHtml(policy.description)}</p>
      <p><strong>Documents:</strong> ${policy.documents.map(escapeHtml).join(", ")}</p>
    </article>
  `);
}

const vlogContainer = document.querySelector("#vlog-list");

if (vlogContainer) {
  loadCards("/api/vlogs", "topics", vlogContainer, (topic) => `
    <article class="info-card">
      <h3>${escapeHtml(topic.title)}</h3>
      <p>${escapeHtml(topic.description)}</p>
    </article>
  `);
}

async function submitJsonForm(form, endpoint, messageSelector) {
  const message = document.querySelector(messageSelector);
  const payload = Object.fromEntries(new FormData(form).entries());

  if (message) {
    message.textContent = "Saving...";
    message.className = "loading-text";
  }

  try {
    const result = await apiFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (message) {
      message.textContent = result.message;
      message.className = "success-text";
    }
    form.reset();
  } catch (error) {
    if (message) {
      message.textContent = error.message;
      message.className = "error-text";
    }
  }
}

async function loadCards(endpoint, key, container, renderCard) {
  container.innerHTML = `<p class="loading-text">Loading...</p>`;

  try {
    const data = await apiFetch(endpoint);
    container.innerHTML = data[key].map(renderCard).join("");
  } catch (error) {
    container.innerHTML = `<p class="error-text">${escapeHtml(error.message)}</p>`;
  }
// }

// async function apiFetch(endpoint, options = {}) {
//   const response = await fetch(endpoint, options);
//   const contentType = response.headers.get("content-type") || "";
//   const data = contentType.includes("application/json") ? await response.json() : {};

//   if (!response.ok) {
//     throw new Error(data.error || "Request failed.");
//   }

//   return data;
// }
const API_BASE = "https://agrocare-6bn8.onrender.com";

async function apiFetch(endpoint, options = {}) {

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    options
  );

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : {};

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}
function showError(element, message) {
  element.innerHTML = `<p class="error-text">${escapeHtml(message)}</p>`;
}

function renderTreatment(treatment) {
  if (!Array.isArray(treatment) || treatment.length === 0) return "";
  return `
    <div class="result-section">
      <strong>Treatment:</strong>
      <ul>${treatment.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
  `;
}

function renderPredictions(predictions) {
  if (!Array.isArray(predictions) || predictions.length === 0) return "";
  return `
    <div class="result-section">
      <strong>Top predictions:</strong>
      <ul>${predictions.map((item) => `<li>${escapeHtml(item.label || item.className || "Class")} - ${escapeHtml(item.confidence || item.score || "")}</li>`).join("")}</ul>
    </div>
  `;
}

function addChatMessage(message, type) {
  const element = document.createElement("div");
  element.className = `chat-message ${type === "user" ? "user-message" : "bot-message"}`;
  element.textContent = message;
  chatMessages.appendChild(element);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return element;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
