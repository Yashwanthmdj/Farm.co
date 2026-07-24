require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const API_KEY = process.env.PLANT_ID_API_KEY;
const API_URL = 'https://api.plant.id/v2/health_assessment';

if (!API_KEY) {
  console.warn('⚠️ Plant.id API key not found. Please add PLANT_ID_API_KEY to your .env file. The disease detection feature will not work.');
}

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG image files are allowed!'));
  }
});

router.post('/analyze', upload.single('plantImage'), async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'The server is missing the Plant.id API key.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  try {
    // The Plant.id API expects the image as a base64 encoded string.
    const imageBase64 = req.file.buffer.toString('base64');

    const requestData = {
      images: [imageBase64],
      // `disease_details` brings back treatment information
      disease_details: ["description", "treatment", "url"],
    };

    console.log('Sending request to Plant.id API...');

    const response = await axios.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY,
      }
    });
    
    console.log('Received response from Plant.id API.');
    
    // The API response can be complex, so we'll simplify it for the frontend.
    const healthAssessment = response.data.health_assessment;
    if (!healthAssessment) {
      return res.status(404).json({ error: 'Could not get a health assessment for the image.' });
    }

    const suggestions = response.data.suggestions;
    const mainSuggestion = suggestions && suggestions.length > 0 ? suggestions[0] : null;

    const result = {
      isHealthy: healthAssessment.is_healthy,
      plantName: mainSuggestion ? mainSuggestion.plant_name : "Unknown Plant",
      diseases: healthAssessment.diseases.map(disease => ({
        name: disease.name,
        probability: disease.probability,
        description: disease.disease_details.description,
        treatment: disease.disease_details.treatment,
        url: disease.disease_details.url
      }))
    };
    
    res.json(result);

  } catch (error) {
    console.error('--- Plant.id API Error ---');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      
      let errorMessage = 'Failed to analyze image due to an API error.';
      if(error.response.status === 401) {
          errorMessage = 'Authentication failed. The Plant.id API key is invalid or missing.'
      } else if (error.response.status === 403 || error.response.status === 402) {
          errorMessage = 'Disease detection is a paid feature and may not be available on your Plant.id subscription plan. Please check your account on the Plant.id website.'
      } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
      }
      return res.status(error.response.status).json({ error: errorMessage, details: error.response.data });

    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request Error:', error.request);
      return res.status(500).json({ error: 'No response from Plant.id API. Check network connection.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    
    res.status(500).json({ error: 'An unexpected error occurred during disease detection.' });
  }
});

module.exports = router; 