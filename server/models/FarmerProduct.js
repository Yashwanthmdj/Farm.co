const mongoose = require('mongoose');

const farmerProductSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'kg' // e.g., kg, piece, liter, dozen
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Handicrafts', 'Other'],
    default: 'Other'
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
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

// Index for faster queries on products by a specific farmer
farmerProductSchema.index({ farmerId: 1 });

// Update the `updatedAt` field on save
farmerProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FarmerProduct', farmerProductSchema); 