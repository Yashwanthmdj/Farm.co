const express = require('express');
const router = express.Router();

// Static, seeded "market estimate" prices roughly modeled on typical Indian
// APMC (Agricultural Produce Market Committee) mandi price ranges, in
// Rs./quintal (100 kg) unless noted. These are NOT live prices - they are
// illustrative market estimates with a small deterministic daily variation
// so the numbers don't look perfectly static across days.
const BASE_PRICES = {
  cereals: [
    { name: 'Wheat', unit: 'per quintal', basePrice: 2275 },
    { name: 'Rice (Paddy Common)', unit: 'per quintal', basePrice: 2183 },
    { name: 'Maize', unit: 'per quintal', basePrice: 2090 },
    { name: 'Bajra (Pearl Millet)', unit: 'per quintal', basePrice: 2500 },
    { name: 'Jowar (Sorghum)', unit: 'per quintal', basePrice: 3180 },
    { name: 'Barley', unit: 'per quintal', basePrice: 1850 },
  ],
  vegetables: [
    { name: 'Onion', unit: 'per quintal', basePrice: 1800 },
    { name: 'Potato', unit: 'per quintal', basePrice: 1400 },
    { name: 'Tomato', unit: 'per quintal', basePrice: 2000 },
    { name: 'Cabbage', unit: 'per quintal', basePrice: 1200 },
    { name: 'Cauliflower', unit: 'per quintal', basePrice: 1500 },
    { name: 'Brinjal', unit: 'per quintal', basePrice: 1600 },
    { name: 'Green Chilli', unit: 'per quintal', basePrice: 3500 },
  ],
  fruits: [
    { name: 'Banana', unit: 'per quintal', basePrice: 2200 },
    { name: 'Mango', unit: 'per quintal', basePrice: 4500 },
    { name: 'Papaya', unit: 'per quintal', basePrice: 1800 },
    { name: 'Grapes', unit: 'per quintal', basePrice: 5500 },
    { name: 'Pomegranate', unit: 'per quintal', basePrice: 7500 },
    { name: 'Guava', unit: 'per quintal', basePrice: 2500 },
  ],
  pulses: [
    { name: 'Tur (Arhar)', unit: 'per quintal', basePrice: 10500 },
    { name: 'Chana (Gram)', unit: 'per quintal', basePrice: 6200 },
    { name: 'Moong', unit: 'per quintal', basePrice: 8200 },
    { name: 'Urad', unit: 'per quintal', basePrice: 9500 },
    { name: 'Masoor (Lentil)', unit: 'per quintal', basePrice: 6800 },
  ],
};

// Simple deterministic hash so the same day always produces the same
// "variation", but different days look slightly different - avoids the
// impression of a perfectly static/fake dataset without needing a live feed.
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function dailyVariationFactor(seed) {
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const hash = hashString(`${seed}-${dateStr}`);
  // Map hash to a variation between -4% and +4%
  const pct = ((Math.abs(hash) % 800) - 400) / 10000; // -0.04 .. +0.04
  return 1 + pct;
}

function buildCategory(items) {
  return items.map((item) => {
    const factor = dailyVariationFactor(item.name);
    const price = Math.round(item.basePrice * factor);
    return {
      name: item.name,
      unit: item.unit,
      price,
      currency: 'INR',
      change: Math.round((factor - 1) * 10000) / 100, // % change vs base, 2 decimals
    };
  });
}

// GET /api/crop-prices - returns market estimate prices grouped by category
router.get('/', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.json({
    asOf: today,
    disclaimer: 'These are market estimates for informational purposes only, not live/official APMC quotes. Please verify with your local mandi before making decisions.',
    categories: {
      cereals: buildCategory(BASE_PRICES.cereals),
      vegetables: buildCategory(BASE_PRICES.vegetables),
      fruits: buildCategory(BASE_PRICES.fruits),
      pulses: buildCategory(BASE_PRICES.pulses),
    }
  });
});

module.exports = router;
