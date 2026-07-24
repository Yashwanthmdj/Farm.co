const mongoose = require('mongoose');

const soilAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image'],
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  soilParameters: {
    pH: { type: Number },
    nitrogen: { type: Number },
    phosphorus: { type: Number },
    potassium: { type: Number },
    organicMatter: { type: Number },
    calcium: { type: Number },
    magnesium: { type: Number },
    sulfur: { type: Number },
    zinc: { type: Number },
    iron: { type: Number },
    manganese: { type: Number },
    copper: { type: Number },
    boron: { type: Number }
  },
  recommendations: {
    fertilizers: [{
      name: String,
      description: String,
      applicationRate: String,
      timing: String
    }],
    crops: [{
      name: String,
      suitability: String,
      reasons: [String]
    }],
    soilAmendments: [{
      name: String,
      description: String,
      applicationRate: String
    }]
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded'
  },
  errorMessage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
soilAnalysisSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SoilAnalysis', soilAnalysisSchema); 