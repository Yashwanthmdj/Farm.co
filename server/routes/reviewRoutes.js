const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Add a review
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;
    const review = await Review.create({ userId, productId, rating, comment });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get average rating for a product
router.get('/product/:productId/average', async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { productId: require('mongoose').Types.ObjectId(req.params.productId) } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (result.length === 0) return res.json({ avgRating: 0, count: 0 });
    res.json({ avgRating: result[0].avgRating, count: result[0].count });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router; 