
const BASE_URL_1 = "https://geocoding-api.open-meteo.com/v1/search?name=";
const BASE_URL_1_part2 = "&count=1&language=en&format=json";

const updateWeather = async (value) => {
    try {

        let URL1 = `${BASE_URL_1}${value}${BASE_URL_1_part2}`;

        let response = await fetch(URL1);
        let data = await response.json();

        let lat = data.results[0].latitude;
        let lon = data.results[0].longitude;

        console.log(lat, lon);

        const BASE_URL_TEMP =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&hourly=temperature_2m,wind_speed_10m,precipitation,relative_humidity_2m,weathercode&forecast_days=2`;

        let currentTime = await getCurrentTimeFromAPI(lat, lon);

        currentTime = currentTime.slice(0, 13) + ":00";

        let response1 = await fetch(BASE_URL_TEMP);

        let data1 = await response1.json();

        const timeIndex = data1.hourly.time.findIndex(
            (time) => time === currentTime
        );

        if (timeIndex === -1) {
            alert("No Connection! Make sure to connect to Internet");
            return;
        }

        let stateIndex = data1.hourly.weathercode[timeIndex];

        let time1 = parseInt(currentTime.slice(11, 13));

        await changeState(time1, stateIndex);

        const humidity = document.getElementById("humi");
        const precipt = document.getElementById("preci");
        const wind = document.getElementById("wind");
        const Temperatur = document.querySelector(".cel");
        const state = document.querySelector(".state");

        humidity.innerHTML =
            `Humidity: ${data1.hourly.relative_humidity_2m[timeIndex]}%`;

        precipt.innerHTML =
            `Precipitation: ${data1.hourly.precipitation[timeIndex]}%`;

        Temperatur.innerHTML =
            `${parseInt(data1.hourly.temperature_2m[timeIndex])}°C`;

        wind.textContent =
            `Wind Speed: ${data1.hourly.wind_speed_10m[timeIndex]} km/h`;

        state.innerText = weatherConditions[stateIndex];

    } catch (error) {

        alert("No Connection! Make sure to connect to Internet");

        console.error("Error in updateWeather:", error);
    }
};