const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: String, // Seeds, Fertilizers, etc.
  subCategory: String, // e.g., Vegetables, Macronutrients
  type: String, // e.g., Hybrid, Organic, Granular
  description: String,
  image: String, // URL or filename
  price: Number,
  stock: Number,
  usage: String, // e.g., "For Paddy", "For Chilli"
  cropType: [String], // e.g., ["Paddy", "Wheat"]
  isBestSeller: Boolean,
  isNewArrival: Boolean,
  bundle: [String], // product IDs for combo packs
  dosage: String,
  unit: String, // e.g., "kg", "L", "pack"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema); 