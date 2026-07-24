const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// List all products (with filters)
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.subCategory) query.subCategory = req.query.subCategory;
    if (req.query.cropType) query.cropType = req.query.cropType;
    if (req.query.brand) query.brand = req.query.brand;
    if (req.query.isBestSeller) query.isBestSeller = req.query.isBestSeller === 'true';
    if (req.query.isNew || req.query.isNewArrival) {
      query.isNewArrival = (req.query.isNewArrival || req.query.isNew) === 'true';
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Add product (admin/demo only)
router.post('/add', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update product (admin/demo only)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete product (admin/demo only)
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router; 