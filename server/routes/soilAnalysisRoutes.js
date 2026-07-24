const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const SoilAnalysis = require('../models/SoilAnalysis');
const router = express.Router();
const axios = require('axios');
const optionalAuth = require('../middleware/optionalAuth');
const { assertOwnership, resolveUserId } = require('../middleware/ownership');

router.use(optionalAuth);

// Optional dependency: Google Cloud Vision client. Only initialized if the
// credentials file exists, so the server doesn't crash when it's missing.
let ImageAnnotatorClient = null;
try {
  ImageAnnotatorClient = require('@google-cloud/vision').ImageAnnotatorClient;
} catch (err) {
  console.warn('⚠️  @google-cloud/vision not installed - soil report OCR disabled.');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/soil-analysis');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed!'));
    }
  }
});

// Lazily initialize Google Cloud Vision client only if credentials are present.
let visionClient = null;
let visionClientInitError = null;
function getVisionClient() {
  if (visionClient) return visionClient;
  if (visionClientInitError) return null;
  if (!ImageAnnotatorClient) {
    visionClientInitError = new Error('@google-cloud/vision is not installed');
    return null;
  }
  const keyFilePath = path.join(__dirname, '../google-cloud.json');
  if (!fs.existsSync(keyFilePath)) {
    visionClientInitError = new Error('google-cloud.json credentials file not found');
    return null;
  }
  try {
    visionClient = new ImageAnnotatorClient({ keyFilename: keyFilePath });
    return visionClient;
  } catch (err) {
    console.error('Failed to initialize Google Vision client:', err.message);
    visionClientInitError = err;
    return null;
  }
}

// NEW: Use local LLM to extract soil parameters from text
async function extractParametersWithLLM(text) {
  console.log('--- Sending extracted text to LLM for analysis ---');
  // Log first 500 chars for brevity
  console.log(text ? text.substring(0, 500) + '...' : 'Text is empty.');

  if (!text || text.trim().length === 0) {
    console.log('Skipping LLM call because text is empty.');
    return {};
  }
  
  try {
    const prompt = `
      You are an expert agricultural scientist. Analyze the following soil test report text and extract the key soil parameters.
      The parameters to look for are: pH, Nitrogen (N), Phosphorus (P), Potassium (K), Organic Matter (OM), Calcium (Ca), Magnesium (Mg), Sulfur (S), Zinc (Zn), Iron (Fe), Manganese (Mn), Copper (Cu), and Boron (B).

      Respond ONLY with a valid JSON object containing the extracted parameters.
      If a parameter is not found, do not include it in the JSON.
      The keys in the JSON should be camelCase: "pH", "nitrogen", "phosphorus", "potassium", "organicMatter", etc.
      The values should be numbers, not strings. Remove any units like "ppm" or "kg/ha".

      Example response:
      {
        "pH": 6.8,
        "nitrogen": 25.5,
        "phosphorus": 50,
        "potassium": 180,
        "organicMatter": 2.1
      }

      Here is the soil report text:
      ---
      ${text}
      ---
    `;

    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'steamdj/llama3.1-cpu-only', // This model should be available via Ollama
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      format: 'json', // Force the model to output valid JSON
    });

    let llmResponseContent = response.data.message?.content;
    if (!llmResponseContent) {
      console.error('LLM response content is empty.');
      return {};
    }

    console.log('--- Raw LLM Response ---', llmResponseContent);

    // The response content should be a stringified JSON. Let's parse it.
    const parameters = JSON.parse(llmResponseContent);
    
    console.log('--- Parsed Soil Parameters from LLM ---', parameters);

    // Basic validation to ensure we have an object
    if (typeof parameters !== 'object' || parameters === null) {
      console.error('LLM did not return a valid JSON object.');
      return {};
    }

    return parameters;

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      const errorMessage = 'Could not connect to the local AI model (Ollama) at http://localhost:11434. Please ensure Ollama is running.';
      console.error(errorMessage);
      // Propagate a user-friendly error message
      throw new Error(errorMessage);
    } else if (error.response) {
      console.error('Error calling LLM API:', error.response.status, error.response.data);
    } else {
      console.error('Error in extractParametersWithLLM:', error.message);
    }
    // Return empty object on other errors to allow fallback to default recommendations
    return {};
  }
}

// Generate AI recommendations based on soil parameters
async function generateRecommendations(soilParameters) {
  try {
    const recommendations = {
      fertilizers: [],
      crops: [],
      soilAmendments: []
    };
    
    // pH-based recommendations
    if (soilParameters.pH) {
      if (soilParameters.pH < 6.0) {
        recommendations.soilAmendments.push({
          name: 'Lime (Calcium Carbonate)',
          description: 'To raise soil pH and improve nutrient availability',
          applicationRate: '2-4 tons per acre depending on current pH'
        });
        recommendations.crops.push({
          name: 'Acid-loving crops',
          suitability: 'Excellent',
          reasons: ['Low pH soil is ideal for acid-loving plants']
        });
      } else if (soilParameters.pH > 7.5) {
        recommendations.soilAmendments.push({
          name: 'Sulfur',
          description: 'To lower soil pH for better nutrient availability',
          applicationRate: '1-2 tons per acre'
        });
      }
    }
    
    // Nitrogen recommendations
    if (soilParameters.nitrogen) {
      if (soilParameters.nitrogen < 20) {
        recommendations.fertilizers.push({
          name: 'Urea (46-0-0)',
          description: 'High nitrogen fertilizer for vegetative growth',
          applicationRate: '100-150 kg per acre',
          timing: 'Split application: 50% at planting, 50% at 30-45 days'
        });
      }
    }
    
    // Phosphorus recommendations
    if (soilParameters.phosphorus) {
      if (soilParameters.phosphorus < 15) {
        recommendations.fertilizers.push({
          name: 'DAP (18-46-0)',
          description: 'High phosphorus fertilizer for root development',
          applicationRate: '50-75 kg per acre',
          timing: 'Apply at planting or before sowing'
        });
      }
    }
    
    // Potassium recommendations
    if (soilParameters.potassium) {
      if (soilParameters.potassium < 150) {
        recommendations.fertilizers.push({
          name: 'MOP (0-0-60)',
          description: 'High potassium fertilizer for flowering and fruiting',
          applicationRate: '25-50 kg per acre',
          timing: 'Apply before flowering stage'
        });
      }
    }
    
    // General crop recommendations based on soil health
    if (soilParameters.organicMatter && soilParameters.organicMatter > 2) {
      recommendations.crops.push({
        name: 'Vegetables and fruits',
        suitability: 'Excellent',
        reasons: ['High organic matter indicates good soil structure and nutrient retention']
      });
    }
    
    // Default recommendations if no specific parameters found
    if (recommendations.fertilizers.length === 0) {
      recommendations.fertilizers.push({
        name: 'Balanced NPK (10-26-26)',
        description: 'General purpose fertilizer for most crops',
        applicationRate: '100-150 kg per acre',
        timing: 'Apply at planting'
      });
    }
    
    if (recommendations.crops.length === 0) {
      recommendations.crops.push({
        name: 'Wheat, Rice, Maize',
        suitability: 'Good',
        reasons: ['These are generally adaptable to various soil conditions']
      });
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return {
      fertilizers: [],
      crops: [],
      soilAmendments: []
    };
  }
}

// Upload soil test report
router.post('/upload', upload.single('soilReport'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!getVisionClient()) {
      // Clean up the uploaded file since we can't process it
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
      return res.status(503).json({
        error: 'Soil report OCR is unavailable. Google Cloud credentials (google-cloud.json) are missing or invalid on the server.'
      });
    }

    // Determine a valid userId. Must be a valid Mongo ObjectId since the
    // SoilAnalysis model references the User collection.
    let userId = resolveUserId(req, req.body.userId);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'A valid userId is required to upload a soil report' });
    }
    if (!assertOwnership(req, res, userId)) return;

    // Create soil analysis record
    const soilAnalysis = new SoilAnalysis({
      userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: path.extname(req.file.originalname).toLowerCase() === '.pdf' ? 'pdf' : 'image',
      status: 'uploaded'
    });

    await soilAnalysis.save();

    // Process the file asynchronously
    processSoilAnalysis(soilAnalysis._id, req.file.path, req.file.originalname);

    res.json({
      success: true,
      message: 'Soil test report uploaded successfully',
      analysisId: soilAnalysis._id,
      status: 'uploaded'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Process soil analysis with OCR and AI
async function processSoilAnalysis(analysisId, filePath, fileName) {
  try {
    // Update status to processing
    await SoilAnalysis.findByIdAndUpdate(analysisId, { status: 'processing' });

    let extractedText = '';
    const fileContent = fs.readFileSync(filePath);

    // Perform OCR using Google Vision API for both images and PDFs
    const client = getVisionClient();
    if (!client) {
      await SoilAnalysis.findByIdAndUpdate(analysisId, {
        status: 'failed',
        errorMessage: 'Google Vision credentials are missing or invalid on the server.'
      });
      return;
    }
    let visionResult;
    try {
      visionResult = await client.textDetection({ image: { content: fileContent } });
    } catch (visionError) {
      console.error('Google Vision OCR error:', visionError);
      await SoilAnalysis.findByIdAndUpdate(analysisId, {
        status: 'failed',
        errorMessage: 'Google Vision OCR failed: ' + (visionError.message || visionError)
      });
      return;
    }
    const [result] = visionResult;

    // Handle response for both images and multi-page documents (PDFs)
    if (result.fullTextAnnotation) {
      extractedText = result.fullTextAnnotation.text;
    } else if (result.textAnnotations && result.textAnnotations.length > 0) {
      extractedText = result.textAnnotations[0].description;
    }

    // Use the LLM to extract soil parameters
    let soilParameters = {};
    try {
      soilParameters = await extractParametersWithLLM(extractedText);
    } catch (llmError) {
      console.error('Ollama LLM error:', llmError);
      await SoilAnalysis.findByIdAndUpdate(analysisId, {
        status: 'failed',
        errorMessage: 'Ollama LLM failed: ' + (llmError.message || llmError)
      });
      return;
    }

    // Generate recommendations
    const recommendations = await generateRecommendations(soilParameters);

    // Update the analysis with results
    await SoilAnalysis.findByIdAndUpdate(analysisId, {
      extractedText,
      soilParameters,
      recommendations,
      status: 'completed'
    });

    console.log(`Soil analysis completed for ${fileName}`);

  } catch (error) {
    console.error('Processing error:', error);
    await SoilAnalysis.findByIdAndUpdate(analysisId, {
      status: 'failed',
      errorMessage: error.message
    });
  }
}

// Get all soil analyses for a user
// IMPORTANT: this must be registered BEFORE the generic '/:id' route below,
// otherwise Express would treat "user" as an :id value and this handler
// would never be reached.
router.get('/user/:userId', async (req, res) => {
  try {
    const analyses = await SoilAnalysis.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    console.error('Get user analyses error:', error);
    res.status(500).json({ error: 'Failed to get user soil analyses' });
  }
});

// Get soil analysis by ID
router.get('/:id', async (req, res) => {
  try {
    const analysis = await SoilAnalysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Soil analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get soil analysis' });
  }
});

// Delete soil analysis
router.delete('/:id', async (req, res) => {
  try {
    const analysis = await SoilAnalysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Soil analysis not found' });
    }
    if (!assertOwnership(req, res, analysis.userId)) return;

    // Delete the file
    if (fs.existsSync(analysis.filePath)) {
      fs.unlinkSync(analysis.filePath);
    }

    await SoilAnalysis.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Soil analysis deleted successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Failed to delete soil analysis' });
  }
});

module.exports = router; 