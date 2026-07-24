const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

// Optional dependency: `say` (TTS). If not installed, TTS is simply disabled.
let say = null;
try {
  say = require('say');
} catch (err) {
  console.warn('⚠️  "say" package not installed - TTS audio generation disabled. Run `npm install say` to enable.');
}

// Optional dependency: Google Cloud Speech client. Only initialized if the
// credentials file exists, so the server doesn't crash when it's missing.
let SpeechClient = null;
try {
  SpeechClient = require('@google-cloud/speech').SpeechClient;
} catch (err) {
  console.warn('⚠️  @google-cloud/speech not installed - speech-to-text endpoint disabled.');
}

// Set your OpenWeatherMap API key here or use process.env
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Mask the API key so it's never fully printed to logs
function maskKey(key) {
  if (!key) return '(missing)';
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}
console.log('Loaded OpenWeatherMap API key:', maskKey(OPENWEATHER_API_KEY));

// Ensure audio directory exists
const audioDir = path.join(__dirname, '../public/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Warn if API key is missing
if (!OPENWEATHER_API_KEY) {
  console.error('Warning: Missing OpenWeatherMap API key! Weather routes will not work.');
}

// Helper: Get coordinates from city name using OpenWeatherMap Geocoding API
async function getCoordinates(city) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
  const res = await axios.get(url);
  if (res.data && res.data.length > 0) {
    return { lat: res.data[0].lat, lon: res.data[0].lon };
  }
  throw new Error('Location not found');
}

// Helper: Translate text using MyMemory API
async function translateText(text, targetLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
  const res = await axios.get(url);
  return res.data.responseData.translatedText || text;
}

// Helper: Generate TTS audio file using say.js.
// If `say` is unavailable or generation fails, resolves to null instead of throwing,
// so the caller can simply disable the audio playback UI.
function generateTTS(text, lang, filename) {
  if (!say) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const filePath = path.join(__dirname, '../public/audio', filename);
      say.export(text, lang, 1.0, filePath, (err) => {
        if (err) {
          console.error('TTS generation failed:', err);
          // Instead of rejecting, resolve with null to disable audio
          return resolve(null);
        }
        resolve(`/audio/${filename}`);
      });
    } catch (err) {
      console.error('TTS generation threw synchronously:', err);
      resolve(null);
    }
  });
}

// Analyze forecast for alerts and sowing advice
function analyzeForecast(forecast) {
  const alerts = [];
  let droughtDays = 0;
  let bestSowingDays = [];
  forecast.forEach((day, idx) => {
    const rain = day.rain || 0;
    const temp = day.temp.day;
    // Heavy rain alert
    if (rain > 20) {
      alerts.push({
        type: 'rain',
        message: `Heavy rain expected in ${idx === 0 ? 'today' : `in ${idx} days`}. Delay pesticide spraying.`
      });
    }
    // Drought warning
    if (rain < 1) {
      droughtDays++;
    } else {
      droughtDays = 0;
    }
    // Optimal sowing: temp 20-32C, rain 2-10mm
    if (temp >= 20 && temp <= 32 && rain >= 2 && rain <= 10) {
      bestSowingDays.push(day.dt);
    }
  });
  if (droughtDays >= 5) {
    alerts.push({
      type: 'drought',
      message: 'No rain forecast this week. Water crops manually.'
    });
  }
  return { alerts, bestSowingDays };
}

// Main weather forecast endpoint
router.post('/forecast', async (req, res) => {
  try {
    let { city, lat, lon, lang } = req.body;
    if (!lang) lang = 'en';
    if (!lat || !lon) {
      if (!city) return res.status(400).json({ error: 'City or coordinates required' });
      const coords = await getCoordinates(city);
      lat = coords.lat;
      lon = coords.lon;
    }
    // Fetch 7-day forecast using OpenWeather One Call API 3.0
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,current,alerts&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);
    // The One Call 3.0 API returns daily as an array of 8 days (including today)
    const daily = response.data.daily.slice(0, 7).map(day => ({
      dt: day.dt,
      temp: day.temp,
      humidity: day.humidity,
      wind_speed: day.wind_speed,
      wind_deg: day.wind_deg,
      pressure: day.pressure,
      rain: day.rain || 0,
      uvi: day.uvi,
      weather: day.weather,
      sunrise: day.sunrise,
      sunset: day.sunset,
      clouds: day.clouds,
      pop: day.pop,
      dew_point: day.dew_point,
      feels_like: day.feels_like,
    }));
    // Analyze forecast
    const { alerts, bestSowingDays } = analyzeForecast(daily);
    // Translate and TTS alerts
    const alertResults = [];
    for (const alert of alerts) {
      const translated = lang === 'en' ? alert.message : await translateText(alert.message, lang);
      const filename = `alert_${Date.now()}_${Math.floor(Math.random()*10000)}.wav`;
      let audioUrl = null;
      try {
        audioUrl = await generateTTS(translated, lang, filename);
      } catch (ttsErr) {
        console.error('TTS error:', ttsErr);
        audioUrl = null;
      }
      alertResults.push({ ...alert, message: translated, ttsUrl: audioUrl });
    }
    // Format sowing days
    const sowingDays = bestSowingDays.map(dt => new Date(dt * 1000).toISOString().slice(0, 10));
    res.json({
      forecast: daily,
      alerts: alertResults,
      optimalSowingDays: sowingDays
    });
  } catch (err) {
    console.error('Weather forecast error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch weather forecast' });
  }
});

// Lazily initialize the Google SpeechClient only when needed, and only if
// credentials are actually available. This avoids crashing the whole server
// at require-time when google-cloud.json is missing.
let speechClient = null;
let speechClientInitError = null;
function getSpeechClient() {
  if (speechClient) return speechClient;
  if (speechClientInitError) return null;
  if (!SpeechClient) {
    speechClientInitError = new Error('@google-cloud/speech is not installed');
    return null;
  }
  const keyFilePath = path.join(__dirname, '../google-cloud.json');
  if (!fs.existsSync(keyFilePath)) {
    speechClientInitError = new Error('google-cloud.json credentials file not found');
    return null;
  }
  try {
    speechClient = new SpeechClient({ keyFilename: keyFilePath });
    return speechClient;
  } catch (err) {
    console.error('Failed to initialize Google SpeechClient:', err.message);
    speechClientInitError = err;
    return null;
  }
}

// Speech-to-Text endpoint (direct recording, wav/webm)
router.post('/speech-to-text', multer({ dest: 'uploads/' }).single('audio'), async (req, res) => {
  const client = getSpeechClient();
  if (!client) {
    // Clean up the uploaded file since we can't process it
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    return res.status(503).json({
      error: 'Speech-to-text service is unavailable. Google Cloud credentials (google-cloud.json) are missing or invalid on the server.'
    });
  }
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
    const filePath = req.file.path;
    const language = req.body.language || 'en';
    let languageCode = 'en-IN';
    if (language === 'hi') languageCode = 'hi-IN';
    if (language === 'te') languageCode = 'te-IN';
    // Read audio file
    const file = fs.readFileSync(filePath);
    const audioBytes = file.toString('base64');
    // Try to auto-detect encoding
    let encoding = 'LINEAR16';
    if (req.file.mimetype === 'audio/webm') encoding = 'WEBM_OPUS';
    if (req.file.mimetype === 'audio/wav' || req.file.mimetype === 'audio/x-wav') encoding = 'LINEAR16';
    const audio = { content: audioBytes };
    const config = {
      encoding,
      languageCode,
    };
    const request = { audio, config };
    try {
      const [response] = await client.recognize(request);
      const transcription = response.results.map(r => r.alternatives[0].transcript).join(' ');
      fs.unlinkSync(filePath); // Clean up
      res.json({ text: transcription });
    } catch (err) {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Speech recognition failed', details: err.message });
    }
  } catch (err) {
    res.status(500).json({ error: 'Speech-to-text error', details: err.message });
  }
});

module.exports = router;
