async function getWeatherUpdates() {
    const weatherInfo = document.getElementById('current-weather');
    const cityInput = document.getElementById('city-input');
    const city = cityInput && cityInput.value.trim() !== '' ? cityInput.value.trim() : null;
  
    if (!city) {
      weatherInfo.innerHTML = `<p style="color:red;">Please enter a city name.</p>`;
      return;
    }
  
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=c5cd27434c394cd48d794300252304&q=${city}&aqi=yes`);
      if (!response.ok) throw new Error("Weather API error");
      const data = await response.json();
  
      const temperature = `${data.current.temp_c}°C`;
      const condition = data.current.condition.text;
      const humidity = `${data.current.humidity}%`;
  
      weatherInfo.innerHTML = `
        <h3>Current Weather in ${city}</h3>
        <p>Temperature: ${temperature}</p>
        <p>Condition: ${condition}</p>
        <p>Humidity: ${humidity}</p>
      `;
    } catch (error) {
      console.error(error);
      weatherInfo.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
  }
  