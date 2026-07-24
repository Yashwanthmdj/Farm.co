const express = require('express');
const router = express.Router();

// Crop-specific water-need hints used to tweak the generic rules below.
const CROP_WATER_NEEDS = {
  rice: 'high',
  sugarcane: 'high',
  potato: 'medium',
  tomato: 'medium',
  cotton: 'medium',
  wheat: 'medium',
  corn: 'medium',
  maize: 'medium',
};

// Simple rule-based irrigation advisor. This intentionally avoids any
// external ML/AI dependency so it always works offline and instantly.
function buildAdvice({ soilMoisture, weatherSummary, cropType, lastRainMm }) {
  const notes = [];
  let recommendation;
  let urgency = 'low'; // low | medium | high

  const normalizedCrop = (cropType || '').toString().trim().toLowerCase();
  const waterNeed = CROP_WATER_NEEDS[normalizedCrop] || 'medium';

  const summary = (weatherSummary || '').toString().toLowerCase();
  const expectsRainSoon = /rain|shower|storm|drizzle|monsoon/.test(summary);
  const isHot = /hot|heat|dry|sunny/.test(summary);

  const moisture = typeof soilMoisture === 'number' ? soilMoisture : null; // expected 0-100 (%)
  const rainMm = typeof lastRainMm === 'number' ? lastRainMm : null;

  if (moisture !== null) {
    if (moisture < 20) {
      recommendation = 'Soil moisture is very low. Irrigate today, especially if no rain is expected in the next 1-2 days.';
      urgency = 'high';
    } else if (moisture < 40) {
      recommendation = 'Soil moisture is on the lower side. Plan irrigation within the next 1-2 days.';
      urgency = 'medium';
    } else if (moisture < 65) {
      recommendation = 'Soil moisture is adequate for now. Monitor and irrigate if it drops below 40%.';
      urgency = 'low';
    } else {
      recommendation = 'Soil moisture is high. Irrigation is not needed right now - avoid overwatering and risking root/fungal issues.';
      urgency = 'low';
    }
  } else if (rainMm !== null) {
    if (rainMm >= 15) {
      recommendation = 'Recent rainfall was significant. Skip irrigation for the next few days and check for waterlogging.';
      urgency = 'low';
    } else if (rainMm >= 5) {
      recommendation = 'Some rain fell recently, but it may not be enough. Check soil moisture before deciding on the next irrigation.';
      urgency = 'medium';
    } else {
      recommendation = 'Little to no recent rainfall. Irrigation is likely needed soon.';
      urgency = 'medium';
    }
  } else {
    recommendation = 'No soil moisture or rainfall data provided. Follow your crop\'s regular watering schedule and inspect topsoil dryness before irrigating.';
    urgency = 'medium';
  }

  if (expectsRainSoon) {
    notes.push('Rain is expected soon based on the weather summary - consider delaying irrigation to avoid waste and waterlogging.');
    if (urgency === 'high') urgency = 'medium';
  }

  if (isHot && !expectsRainSoon) {
    notes.push('Hot/dry conditions increase evapotranspiration - crops may need water sooner than usual.');
    if (urgency === 'low') urgency = 'medium';
  }

  if (waterNeed === 'high') {
    notes.push(`${cropType || 'This crop'} has high water requirements - irrigate more frequently and avoid letting soil dry out.`);
  } else if (waterNeed === 'medium') {
    notes.push(`${cropType || 'This crop'} has moderate water requirements - irrigate when topsoil (top 5-7 cm) feels dry.`);
  }

  return { recommendation, urgency, notes, waterNeed };
}

// POST /api/irrigation/advise
// Body: { soilMoisture?, weatherSummary?, cropType?, lastRainMm? }
router.post('/advise', (req, res) => {
  try {
    const { soilMoisture, weatherSummary, cropType, lastRainMm } = req.body || {};
    const advice = buildAdvice({ soilMoisture, weatherSummary, cropType, lastRainMm });
    res.json({
      input: { soilMoisture, weatherSummary, cropType, lastRainMm },
      ...advice
    });
  } catch (error) {
    console.error('Irrigation advice error:', error);
    res.status(500).json({ error: 'Failed to generate irrigation advice' });
  }
});

module.exports = router;
