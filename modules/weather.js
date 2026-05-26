const { sendJson } = require("./common");

async function handleWeather(city, res) {
  if (!city || city.trim().length < 2) {
    sendJson(res, 400, { error: "Please enter a valid city name." });
    return;
  }

  const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geoUrl.searchParams.set("name", city.trim());
  geoUrl.searchParams.set("count", "1");
  geoUrl.searchParams.set("language", "en");
  geoUrl.searchParams.set("format", "json");

  const geoResponse = await fetch(geoUrl);
  if (!geoResponse.ok) {
    sendJson(res, 502, { error: "Location service is not responding." });
    return;
  }

  const geoData = await geoResponse.json();
  const place = geoData.results && geoData.results[0];
  if (!place) {
    sendJson(res, 404, { error: "City not found." });
    return;
  }

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", place.latitude);
  weatherUrl.searchParams.set("longitude", place.longitude);
  weatherUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code");
  weatherUrl.searchParams.set("timezone", "auto");

  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) {
    sendJson(res, 502, { error: "Weather service is not responding." });
    return;
  }

  const weatherData = await weatherResponse.json();
  const current = weatherData.current;

  sendJson(res, 200, {
    location: [place.name, place.admin1, place.country].filter(Boolean).join(", "),
    temperature: `${Math.round(current.temperature_2m)} C`,
    humidity: `${current.relative_humidity_2m}%`,
    wind: `${Math.round(current.wind_speed_10m)} km/h`,
    precipitation: `${current.precipitation} mm`,
    condition: weatherCodeToText(current.weather_code),
    advice: createWeatherAdvice(current)
  });
}

function createWeatherAdvice(current) {
  if (current.precipitation > 0) {
    return "Rain is present. Delay spraying and avoid unnecessary irrigation.";
  }
  if (current.relative_humidity_2m > 75) {
    return "Humidity is high. Monitor crop leaves for fungal symptoms.";
  }
  if (current.wind_speed_10m > 20) {
    return "Wind is strong. Avoid pesticide spraying until conditions are calmer.";
  }
  return "Weather is suitable for routine field work. Prefer cooler hours for spraying.";
}

function weatherCodeToText(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Rain showers",
    95: "Thunderstorm"
  };
  return map[code] || "Changing weather";
}

module.exports = {
  handleWeather
};
