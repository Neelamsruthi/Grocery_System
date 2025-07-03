const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware to verify token and extract userId
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.secreatKey);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Get cart items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await CartItem.find({ userId: req.userId }).populate('productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to cart
router.post('/', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const existing = await CartItem.findOne({ userId: req.userId, productId });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json(existing);
    }
    const newItem = new CartItem({ userId: req.userId, productId, quantity });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update quantity
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await CartItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { quantity: req.body.quantity },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await CartItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
