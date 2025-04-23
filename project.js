
// Chat functionality
function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (message) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    // Add AI response simulation
    setTimeout(() => {
      chatMessages.innerHTML += `<p><strong>AI:</strong> I'm here to help with your farming questions.</p>`;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
    input.value = '';
  }
}

// Weather updates
async function getWeatherUpdates() {
  const weatherInfo = document.getElementById('current-weather');
  try {
    // Simulate weather data (replace with actual API call)
    const weatherData = {
      temperature: '25°C',
      condition: 'Sunny',
      humidity: '65%'
    };
    weatherInfo.innerHTML = `
      <h3>Current Weather</h3>
      <p>Temperature: ${weatherData.temperature}</p>
      <p>Condition: ${weatherData.condition}</p>
      <p>Humidity: ${weatherData.humidity}</p>
    `;
  } catch (error) {
    weatherInfo.innerHTML = 'Error loading weather data';
  }
}

// Disease detection
document.getElementById('image-upload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const diseaseResult = document.getElementById('disease-result');
      diseaseResult.innerHTML = `
        <h3>Analysis Result</h3>
        <p>Analyzing crop image...</p>
        <img src="${e.target.result}" style="max-width: 300px; margin-top: 1rem;">
      `;
      // Simulate analysis (replace with actual API call)
      setTimeout(() => {
        diseaseResult.innerHTML += '<p>No diseases detected. Crop appears healthy.</p>';
      }, 2000);
    };
    reader.readAsDataURL(file);
  }
});

// Initialize weather updates
getWeatherUpdates();
// Update weather every 30 minutes
setInterval(getWeatherUpdates, 1800000);

// Smooth scrolling for navigation
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const section = document.querySelector(this.getAttribute('href'));
    section.scrollIntoView({ behavior: 'smooth' });
    
    // Update active nav link
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
  });
});
