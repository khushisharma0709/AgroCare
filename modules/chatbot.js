const { readJson, sendJson } = require("./common");

const intents = [
  {
    name: "crop disease",
    keywords: ["disease", "bimari", "leaf", "leaves", "patta", "patti", "spot", "spots", "yellow", "pila", "fungal", "sukha", "wilting", "curl", "keeda", "pest", "insect"],
    answer: diseaseAnswer
  },
  {
    name: "weather and spraying",
    keywords: ["weather", "rain", "barish", "temperature", "spray", "spraying", "hawa", "wind", "mosam", "mausam"],
    answer: "Spray tab karein jab rain chance na ho, hawa kam ho, aur temperature zyada high na ho. Best time early morning ya evening hota hai. Weather page me city daal kar live humidity, wind, rain aur temperature check karein."
  },
  {
    name: "soil and fertilizer",
    keywords: ["soil", "mitti", "fertilizer", "khaad", "npk", "urea", "dap", "potash", "compost", "nutrition", "nutrient"],
    answer: "Fertilizer bina soil test ke guess nahi karna chahiye. Pehle soil test karayein, phir crop stage ke hisaab se NPK dose rakhein. Organic compost/FYM soil structure improve karta hai. Urea ko split dose me dena better hota hai."
  },
  {
    name: "irrigation",
    keywords: ["irrigation", "water", "pani", "drip", "sinchai", "moisture", "sukhi", "dry"],
    answer: "Sinchai morning ya evening me karein. Mitti ko 5-7 cm depth tak check karein: agar mitti dry aur crumbly hai to irrigation ki zarurat ho sakti hai. High humidity ya rain forecast me paani delay karein. Drip irrigation water saving ke liye useful hai."
  },
  {
    name: "policy",
    keywords: ["policy", "subsidy", "scheme", "yojana", "insurance", "pm-kisan", "loan", "sarkari", "government"],
    answer: "Government schemes ke liye Aadhaar/ID, land proof, bank details, crop details aur photos/documents ready rakhne hote hain. Policy page par basic checklist di hai. Final eligibility official portal ya agriculture office se verify karein."
  },
  {
    name: "crop selection",
    keywords: ["crop", "fasal", "best crop", "which crop", "kaunsi fasal", "kya ugana", "kya bona", "kya lagana", "is time", "abhi", "ugana", "bona", "boye", "lagana", "sow", "grow", "plant", "season", "kharif", "rabi", "zayed"],
    answer: cropSelectionAnswer
  },
  {
    name: "market",
    keywords: ["market", "mandi", "price", "rate", "bhav", "sell", "bechna"],
    answer: "Crop bechne se pehle nearby mandi rate, quality grade, transport cost aur storage condition compare karein. Agar price low hai aur crop storage-safe hai, to short storage se better rate mil sakta hai."
  }
];

async function handleChatbot(req, res) {
  const payload = await readJson(req);
  const message = String(payload.message || "").trim();

  if (!message) {
    sendJson(res, 400, { error: "Please type a farming question." });
    return;
  }

  const match = findBestIntent(message);
  const reply = match ? buildReply(match, message) : defaultAnswer(message);

  sendJson(res, 200, {
    reply,
    source: match ? `AgroCare ${match.name} module` : "AgroCare general assistant module"
  });
}

function findBestIntent(message) {
  const normalized = normalize(message);
  const sentence = normalized.join(" ");
  const scored = intents
    .map((intent) => ({
      ...intent,
      score: intent.keywords.reduce((total, keyword) => total + keywordScore(normalized, sentence, keyword), 0)
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0].score > 0 ? scored[0] : null;
}

function normalize(message) {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function keywordScore(words, sentence, keyword) {
  if (keyword.includes(" ")) {
    return sentence.includes(keyword) ? 4 : 0;
  }

  return words.some((word) => word === keyword || word.startsWith(keyword)) ? 2 : 0;
}

function buildReply(intent, message) {
  return typeof intent.answer === "function" ? intent.answer(message) : intent.answer;
}

function cropSelectionAnswer(message) {
  const month = new Date().getMonth() + 1;
  const season = getIndianCropSeason(month);
  const cropHint = detectCrop(message);

  if (cropHint) {
    return `${cropHint.name} ke liye ${cropHint.guidance} Agar aap location, soil type aur irrigation bata denge to main more exact suggestion de sakta hoon.`;
  }

  return `Abhi ${season.label} ke hisaab se aap ${season.crops.join(", ")} consider kar sakte hain. Final choice ke liye 4 cheezein check karein: aapka district/climate, mitti type, irrigation available hai ya nahi, aur local mandi demand. Agar paani kam hai to maize, soybean, bajra ya pulses safer ho sakte hain; paani achha hai to paddy/rice option ho sakta hai.`;
}

function diseaseAnswer(message) {
  const cropHint = detectCrop(message);
  const cropText = cropHint ? `${cropHint.name} me ` : "Crop me ";
  return `${cropText}disease ya pest doubt ho to leaf par spots/yellowing, leaf ke neeche insects, aur soil moisture check karein. Affected leaves ki clear photo Disease Identifier page par upload karein. Tab tak overhead watering avoid karein, infected leaves alag karein, aur chemical spray local agriculture expert se confirm karke hi karein.`;
}

function getIndianCropSeason(month) {
  if (month >= 6 && month <= 9) {
    return {
      label: "Kharif season",
      crops: ["paddy/rice", "maize", "soybean", "cotton", "bajra", "tur/arhar"]
    };
  }

  if (month >= 10 || month <= 2) {
    return {
      label: "Rabi season",
      crops: ["wheat", "mustard", "chana/gram", "peas", "barley", "potato"]
    };
  }

  return {
    label: "Zaid/pre-Kharif time",
    crops: ["moong", "urad", "fodder maize", "vegetables", "watermelon", "cucumber"]
  };
}

function detectCrop(message) {
  const text = message.toLowerCase();
  const crops = [
    { keys: ["wheat", "gehu", "gehun"], name: "Wheat", guidance: "Rabi crop hai. Sowing usually Oct-Nov me hoti hai; May-June me harvest/storage/market planning hoti hai, nayi sowing nahi." },
    { keys: ["rice", "paddy", "dhan", "dhaan"], name: "Rice/Paddy", guidance: "Kharif crop hai. Nursery/transplanting monsoon ke aas-paas hoti hai; water availability important hai." },
    { keys: ["maize", "corn", "makka"], name: "Maize/Makka", guidance: "Kharif aur Zaid dono me possible hai. Medium irrigation aur well-drained soil me achha option hai." },
    { keys: ["soybean", "soya"], name: "Soybean", guidance: "Kharif crop hai. Monsoon start ke baad well-drained black/cotton soil areas me common option hai." },
    { keys: ["cotton", "kapas"], name: "Cotton/Kapas", guidance: "Kharif crop hai. Warm climate, longer season aur pest monitoring zaruri hota hai." },
    { keys: ["mustard", "sarso", "sarson"], name: "Mustard/Sarson", guidance: "Rabi crop hai. Sowing usually Oct-Nov me hoti hai; cool season me better perform karti hai." },
    { keys: ["chana", "gram"], name: "Chana/Gram", guidance: "Rabi pulse crop hai. Low to medium irrigation me bhi useful option hota hai." }
  ];

  return crops.find((crop) => crop.keys.some((key) => text.includes(key)));
}

function defaultAnswer(message) {
  return `Is question par exact advice ke liye thoda detail chahiye: crop ka naam, aapka district/state, soil type, irrigation hai ya nahi, aur issue/sawal kya hai. Example: "Madhya Pradesh me black soil hai, paani kam hai, abhi kaunsi fasal ugau?"`;
}

module.exports = {
  handleChatbot
};
