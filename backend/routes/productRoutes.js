const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Create Product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const imageURL = req.file ? req.file.filename : '';
    const product = new Product({ name, description, price, category, imageURL });

    await product.save();
    res.status(201).json({ message: 'Product added', product });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// ✅ Update Product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const updateData = { name, description, price, category };

    if (req.file) {
      updateData.imageURL = req.file.filename;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// ✅ Delete Product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ✅ Get Products
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category && category !== 'All' && category !== '') query.category = category;

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;
