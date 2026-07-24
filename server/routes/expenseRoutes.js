const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Revenue = require('../models/Revenue');
const optionalAuth = require('../middleware/optionalAuth');
const { assertOwnership, resolveUserId } = require('../middleware/ownership');

router.use(optionalAuth);

// Add expense
router.post('/add', async (req, res) => {
  const userId = resolveUserId(req, req.body.userId);
  const { category, amount, note } = req.body;
  if (!assertOwnership(req, res, userId)) return;
  try {
    const expense = await Expense.create({ userId, category, amount, note });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get expenses for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.params.userId })
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Add revenue
router.post('/revenue/add', async (req, res) => {
  try {
    const userId = resolveUserId(req, req.body.userId);
    const { amount, category, note, date } = req.body;
    if (!assertOwnership(req, res, userId)) return;
    const revenue = await Revenue.create({ userId, amount, category, note, date });
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get revenue for a user
router.get('/revenue/user/:userId', async (req, res) => {
  try {
    const revenue = await Revenue.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Clear all expenses and revenues for a user
router.delete('/clear/user/:userId', async (req, res) => {
  if (!assertOwnership(req, res, req.params.userId)) return;
  try {
    await Expense.deleteMany({ userId: req.params.userId });
    await Revenue.deleteMany({ userId: req.params.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;