import './css files/main.css';
import Chart from 'chart.js/auto';

let weatherChart; // Declare a global variable to store the chart instance

// Function to fetch weather data from the backend
async function fetchWeather(city) {
    try {
        const response = await fetch('http://localhost:5001/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching weather: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Function to draw the chart
function drawChart(labels, data) {
    const ctx = document.getElementById('weather_chart').getContext('2d');

    // Destroy the existing chart instance if it exists
    if (weatherChart) {
        weatherChart.destroy();
    }

    // Create a new chart instance
    weatherChart = new Chart(ctx, {
        type: 'line', // Example: Line chart
        data: {
            labels: labels, // X-axis labels
            datasets: [{
                label: 'Temperature Forecast',
                data: data, // Y-axis data
                borderColor: 'blue',
                backgroundColor: 'rgba(135,206,250,0.5)', // Light blue background
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// Event listener for DOM content load
document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const searchButton = document.getElementById('classify_button'); // Button to trigger weather fetch
    const cityInput = document.getElementById('user_input'); // Input field for city name
    const resultsContainer = document.getElementById('weather_results'); // Container to display results

    // Attach click event listener to the button
    searchButton.addEventListener('click', async () => {
        const city = cityInput.value.trim(); // Get and sanitize city name
        if (!city) {
            alert('Please enter a city name!');
            return;
        }

        try {
            // Fetch weather data from the backend
            const weatherData = await fetchWeather(city);

            if (weatherData) {
                // Update the results container with fetched weather data
                resultsContainer.innerHTML = `
                    <h2>Weather in ${weatherData.city}</h2>
                    <p>Current Temperature: ${weatherData.currentTemperature}°C</p>
                    <p>Forecasted Temperature: ${weatherData.forecastTemperature}°C</p>
                    <p>Description: ${weatherData.description}</p>
                    <p>Humidity: ${weatherData.humidity}%</p>
                `;

                // Call drawChart to render the chart
                const labels = weatherData.forecast.labels || ["Day 1", "Day 2", "Day 3"];
                const data = weatherData.forecast.data || [0, 0, 0];
                drawChart(labels, data);
            } else {
                resultsContainer.innerHTML = '<p>Error fetching weather data. Please try again later.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            resultsContainer.innerHTML = '<p>Error fetching weather data. Please try again later.</p>';
        }
    });
});
