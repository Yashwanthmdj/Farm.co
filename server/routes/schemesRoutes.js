const express = require('express');
const router = express.Router();

// Static reference data about major Indian agriculture government schemes.
// Informational only - always verify latest details on the official
// government portals before applying.
const SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    summary: 'Direct income support of Rs. 6,000/year to eligible farmer families, paid in 3 equal installments.',
    eligibility: [
      'All landholding farmer families with cultivable land',
      'Subject to exclusion criteria (e.g. income tax payers, institutional landholders, government employees in certain categories)'
    ],
    benefits: [
      'Rs. 2,000 every 4 months (Rs. 6,000/year) transferred directly to bank account'
    ],
    howToApply: [
      'Register online at pmkisan.gov.in or visit the nearest Common Service Centre (CSC)',
      'Provide Aadhaar, land records and bank account details',
      'Local patwari/revenue officer verifies land records'
    ],
    website: 'https://pmkisan.gov.in'
  },
  {
    id: 'pmfby',
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    summary: 'Crop insurance scheme providing financial support to farmers in case of crop failure due to natural calamities, pests or diseases.',
    eligibility: [
      'All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers',
      'Compulsory for loanee farmers, optional for non-loanee farmers'
    ],
    benefits: [
      'Low uniform premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticulture crops',
      'Full sum insured for crop loss due to natural calamities, pests and diseases'
    ],
    howToApply: [
      'Apply through your bank (if loanee) or via pmfby.gov.in / CSC / insurance company agents',
      'Apply before the cut-off date announced for each season and crop'
    ],
    website: 'https://pmfby.gov.in'
  },
  {
    id: 'kcc',
    name: 'KCC (Kisan Credit Card)',
    summary: 'Provides farmers with timely access to credit for crop production, post-harvest expenses, and allied activities at concessional interest rates.',
    eligibility: [
      'Farmers - individual/joint borrowers who are owner cultivators',
      'Tenant farmers, oral lessees and sharecroppers',
      'Self-help groups (SHGs) and joint liability groups (JLGs) of farmers'
    ],
    benefits: [
      'Flexible, revolving credit limit for crop and allied activities',
      'Interest subvention available for prompt repayment',
      'Also covers post-harvest, farm asset maintenance and consumption needs'
    ],
    howToApply: [
      'Apply at any nearby bank branch (nationalized, cooperative or RRB) with land documents and identity/address proof',
      'Many banks also offer online KCC application via their websites/apps'
    ],
    website: 'https://www.myscheme.gov.in/schemes/kcc'
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card Scheme',
    summary: 'Provides farmers with soil nutrient status and fertilizer/nutrient recommendations to improve productivity and reduce input costs.',
    eligibility: [
      'All farmers across the country are eligible to get their soil tested'
    ],
    benefits: [
      'Free soil testing every 2-3 years',
      'Personalized crop-wise fertilizer and nutrient recommendations',
      'Helps reduce excess/imbalanced fertilizer use'
    ],
    howToApply: [
      'Contact your local Krishi Vigyan Kendra (KVK) or Agriculture Department office to get soil sampled',
      'Card can also be generated/viewed at soilhealth.dac.gov.in'
    ],
    website: 'https://soilhealth.dac.gov.in'
  },
  {
    id: 'pmksy',
    name: 'PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)',
    summary: 'Aims to improve farm water use efficiency through micro-irrigation (drip/sprinkler) and expanding assured irrigation coverage.',
    eligibility: [
      'All categories of farmers, with priority to small and marginal farmers'
    ],
    benefits: [
      'Subsidy on drip and sprinkler irrigation systems (varies by state, typically 55-90%)',
      'Support for watershed development and water source creation'
    ],
    howToApply: [
      'Apply through the State Agriculture/Horticulture Department office',
      'Some states offer online application via their irrigation subsidy portals'
    ],
    website: 'https://pmksy.gov.in'
  },
  {
    id: 'e-nam',
    name: 'e-NAM (National Agriculture Market)',
    summary: 'Online trading platform that networks existing APMC mandis to provide farmers better price discovery and access to a wider market.',
    eligibility: [
      'Farmers registered with a participating APMC mandi'
    ],
    benefits: [
      'Transparent online bidding for better price realization',
      'Reduced information asymmetry and transaction costs'
    ],
    howToApply: [
      'Register at enam.gov.in or through your local APMC mandi office',
      'Bring Aadhaar and bank account details for registration'
    ],
    website: 'https://enam.gov.in'
  },
];

// GET /api/schemes - list all schemes
router.get('/', (req, res) => {
  res.json({
    disclaimer: 'This information is for general guidance only. Please verify current eligibility, benefits and application steps on the official scheme websites before applying.',
    schemes: SCHEMES
  });
});

// GET /api/schemes/:id - get a single scheme's details
router.get('/:id', (req, res) => {
  const scheme = SCHEMES.find(s => s.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ error: 'Scheme not found' });
  }
  res.json(scheme);
});

module.exports = router;
