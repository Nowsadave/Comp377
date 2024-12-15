const express = require('express');
const cors = require('cors');
const tf = require('@tensorflow/tfjs');
require('dotenv').config();
const axios = require('axios'); // To fetch data from OpenWeatherMap API

const app = express();
app.use(cors());
app.use(express.json());

let model;
const logs = [];

// Train a simple neural network model
async function trainModel() {
    const temperatures = tf.tensor2d([[0], [5], [10], [15], [20]], [5, 1]); // Input data (in °C)
    const futureTemps = tf.tensor2d([[1], [6], [11], [16], [21]], [5, 1]); // Target data

    model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [1], units: 1 }));
    model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

    await model.fit(temperatures, futureTemps, { epochs: 200 });
    console.log('Model trained!');
}

// Middleware to log every request
app.use((req, res, next) => {
    logs.push({ method: req.method, route: req.url, timestamp: new Date().toISOString() });
    next();
});

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the Weather Prediction API!');
});

// Weather prediction and OpenWeatherMap data
app.post('/weather', async (req, res) => {
    const { city, temperature } = req.body;

    if (!city) {
        return res.status(400).json({ error: 'City name is required' });
    }

    if (!model) await trainModel();

    try {
        // Fetch real weather data from OpenWeatherMap API
        const weatherApiResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
        );

        const weatherData = weatherApiResponse.data;
        const currentTemperature = weatherData.main.temp;
        const forecastTemperature = weatherData.main.feels_like;
        const description = weatherData.weather[0].description;
        const humidity = weatherData.main.humidity;

        // Predict temperature using AI model if temperature is provided
        let predictedTemp = null;
        if (temperature !== undefined) {
            const inputTensor = tf.tensor2d([[temperature]]);
            predictedTemp = model.predict(inputTensor).dataSync()[0];
        }

        res.json({
            city,
            currentTemperature: currentTemperature.toFixed(2),
            forecastTemperature: forecastTemperature.toFixed(2),
            description,
            humidity,
            forecast: {
                labels: ["Day 1", "Day 2", "Day 3"], // Example labels
                data: [currentTemperature - 2, currentTemperature - 1, currentTemperature + 1] // Example forecast data
            },
            aiPrediction: predictedTemp ? predictedTemp.toFixed(2) : null
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Admin endpoints
app.get('/admin/logs', (req, res) => {
    res.json(logs);
});

app.post('/admin/retrain', async (req, res) => {
    try {
        await trainModel();
        res.json({ message: 'Model retrained successfully!' });
    } catch (error) {
        console.error('Retrain error:', error);
        res.status(500).json({ error: 'Failed to retrain model' });
    }
});

const PORT = process.env.PORT || 5001;
trainModel(); // Train the model on server startup
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
