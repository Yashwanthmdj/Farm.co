const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const optionalAuth = require('../middleware/optionalAuth');
const { assertOwnership, resolveUserId } = require('../middleware/ownership');

router.use(optionalAuth);

// Get cart for a user
router.get('/:userId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.params.userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ userId: req.params.userId, items: [] });
    }
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const userId = resolveUserId(req, req.body.userId);
    const { productId, quantity } = req.body;
    if (!assertOwnership(req, res, userId)) return;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    // Populate product details for response
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update cart item quantity
router.put('/update', async (req, res) => {
  try {
    const userId = resolveUserId(req, req.body.userId);
    const { productId, quantity } = req.body;
    if (!assertOwnership(req, res, userId)) return;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    // Populate product details for response
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const userId = resolveUserId(req, req.body.userId);
    const { productId } = req.body;
    if (!assertOwnership(req, res, userId)) return;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.json({ items: [] });
    }
    
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();
    
    // Populate product details for response
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Clear cart
router.delete('/clear/:userId', async (req, res) => {
  if (!assertOwnership(req, res, req.params.userId)) return;
  try {
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.json({ items: [] });
    }
    
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router; 