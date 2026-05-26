// // const cityName = document.getElementById("city-name");
// // const cityTime = document.getElementById("city-time");
// // const cityTemp = document.getElementById("city-temp");

// // async function getData(cityName) {
// //     const promise = await fetch(`https://api.weatherapi.com/v1/current.json?key=c5cd27434c394cd48d794300252304&q=${cityName}&aqi=yes`
// //     );
// //     return await promise.json();
// // };

// // button.addEventListener("click", async()=>{
// // const value = input.value;
// // const result = await getData(value);
// // cityName.innerText = `${result.location.name}, ${result.location}`;
// // cityTime.innerText = result.location.localtime;
// // cityTemp.innerText = result.current.temp_c;
// // });

// // Placeholder definitions for BASE_URL_1 and BASE_URL_1_part2
// const BASE_URL_1 = "https://api.example.com/location?q="; // Replace with actual base URL part 1
// const BASE_URL_1_part2 = "&format=json"; // Replace with actual base URL part 2

// const updateWeather = async (value) => {
//     try {
//         let URL1 = `${BASE_URL_1}${value}${BASE_URL_1_part2}`;
//         let response = await fetch(URL1);
//         let data = await response.json();

//         let lat = data.results[0].lat;
//         let lon = data.results[0].lon;
//         console.log(lat, " ", lon);
//         const BASE_URL_TEMP = `https://api.open-meteo.com/v1/forecast?&forecast_days=2&latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&hourly=temperature_2m&hourly=wind_speed_10m&hourly=precipitation&hourly=relative_humidity_2m&hourly=weathercode`;

//         let currentTime = await getCurrentTimeFromAPI(lat, lon);
//         currentTime = currentTime.slice(0, 13) + ":00";

//         let response1 = await fetch(BASE_URL_TEMP);
//         let data1 = await response1.json();

//         const timeIndex = data1.hourly.time.findIndex((time) => time === currentTime);
//         if (timeIndex === -1) {
//             alert("No Connection! Make sure to connect to an Internet");
//             return;
//         }
//         let stateIndex = data1.hourly.weathercode[timeIndex];
//         let time1 = currentTime.slice(11, 13);
//         time1 = parseInt(time1);
//         await changeState(time1, stateIndex);

//         const humidity = document.getElementById("humi");
//         const precipt = document.getElementById("preci");
//         const wind = document.getElementById("wind");
//         const Temperatur = document.querySelector(".cel");
//         const state = document.querySelector(".state");

//         humidity.innerHTML = `Humidity: ${data1.hourly.relative_humidity_2m[timeIndex]}%`;
//         precipt.innerHTML = `Precipitation: ${data1.hourly.precipitation[timeIndex]}%`;
//         Temperatur.innerHTML = `${parseInt(data1.hourly.temperature_2m[timeIndex])}°C`;
//         wind.textContent = `Wind Speed: ${data1.hourly.wind_speed_10m[timeIndex]}km/h`;

//         state.innerText = weatherConditions[stateIndex];
//     } catch (error) {
//         alert("No Connection! Make sure to connect to an Internet");
//         throw error;
//     }
// };

// const updateWeather = async (value) => {
//     try {
//         let URL1 = ${BASE_URL_1}${value}${BASE_URL_1_part2};
//         let response = await fetch(URL1);
//         if (!response.ok) {
//             throw new Error("Location API request failed");
//         }
//         let data = await response.json();
//         if (!data.results || !data.results[0]) {
//             throw new Error("Location not found");
//         }

//         let lat = data.results[0].lat;
//         let lon = data.results[0].lon;
        
//         const BASE_URL_TEMP = https://api.open-meteo.com/v1/forecast?forecast_days=2&latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&hourly=temperature_2m,wind_speed_10m,precipitation,relative_humidity_2m,weathercode;

//         let currentTime = await getCurrentTimeFromAPI(lat, lon);
//         currentTime = currentTime.slice(0, 13) + ":00";

//         let response1 = await fetch(BASE_URL_TEMP);
//         if (!response1.ok) {
//             throw new Error("Weather API request failed");
//         }
//         let data1 = await response1.json();

//         const timeIndex = data1.hourly.time.findIndex((time) => time === currentTime);
//         if (timeIndex === -1) {
//             throw new Error("Weather data not available for current time");
//         }
        
//         // Rest of the code with corrected DOM updates
//         humidity.innerHTML = Humidity: ${data1.hourly.relative_humidity_2m[timeIndex]}%;
//         precipt.innerHTML = Precipitation: ${data1.hourly.precipitation[timeIndex]}%;
//         Temperatur.innerHTML = ${parseInt(data1.hourly.temperature_2m[timeIndex])}°C;
//         wind.textContent = Wind Speed: ${data1.hourly.wind_speed_10m[timeIndex]}km/h;
//         state.innerText = weatherConditions[stateIndex];
//     } catch (error) {
//         alert(Failed to fetch weather data: ${error.message});
//         throw error;
//     }
// };


// Placeholder definitions for BASE_URL_1 and BASE_URL_1_part2
const BASE_URL_1 = "https://api.example.com/location?q="; // Replace with actual base URL part 1
const BASE_URL_1_part2 = "&format=json"; // Replace with actual base URL part 2
const updateWeather = async (value) => {
    try {
        let URL1 = ${BASE_URL_1}${value}${BASE_URL_1_part2};
        let response = await fetch(URL1);
        let data = await response.json();

        let lat = data.results[0].lat;
        let lon = data.results[0].lon;
        console.log(lat, " ", lon);
        const BASE_URL_TEMP = https://api.open-meteo.com/v1/forecast?&forecast_days=2&latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&hourly=temperature_2m&hourly=wind_speed_10m&hourly=precipitation&hourly=relative_humidity_2m&hourly=weathercode;

        let currentTime = await getCurrentTimeFromAPI(lat, lon);
        currentTime = currentTime.slice(0, 13) + ":00";

        let response1 = await fetch(BASE_URL_TEMP);
        let data1 = await response1.json();

        const timeIndex = data1.hourly.time.findIndex((time) => time === currentTime);
        if (timeIndex === -1) {
            alert("No Connection! Make sure to connect to an Internet");
            return;
        }
        let stateIndex = data1.hourly.weathercode[timeIndex];
        let time1 = currentTime.slice(11, 13);
        time1 = parseInt(time1);
        await changeState(time1, stateIndex);

        const humidity = document.getElementById("humi");
        const precipt = document.getElementById("preci");
        const wind = document.getElementById("wind");
        const Temperatur = document.querySelector(".cel");
        const state = document.querySelector(".state");

        humidity.innerHTML = Humidity: ${data1.hourly.relative_humidity_2m[timeIndex]}%;
        precipt.innerHTML = Precipitation: ${data1.hourly.precipitation[timeIndex]}%;
        Temperatur.innerHTML = ${parseInt(data1.hourly.temperature_2m[timeIndex])}°C;
        wind.textContent = Wind Speed: ${data1.hourly.wind_speed_10m[timeIndex]}km/h;

        state.innerText = weatherConditions[stateIndex];
    } catch (error) {
        alert("No Connection! Make sure to connect to an Internet");
        console.error("Error in updateWeather:", error);
        throw error;
    }
};