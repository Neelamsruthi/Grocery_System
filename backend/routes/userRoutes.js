const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');
const verifyToken = require('../middleware/middleware');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmpassword, role } = req.body;

       
        if (!name || !email || !password || !confirmpassword || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

       
        if (password !== confirmpassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        const hash=await bcrypt.hash(password,10);
        const user = new User({
            name,
            email,
            password:hash, 
            role
        });


        await user.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: " Internal Server error" });
    }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const exist = await User.findOne({ email });
    if (!exist) {
      return res.status(400).json({ message: "email not found" });
    }

    const match = await bcrypt.compare(password, exist.password);
    if (!match) {
      return res.status(400).json({ message: "passwords are not matching" });
    }

    const payload = {
      id: exist._id,
      role: exist.role,
    };

    const token = jwt.sign(payload, process.env.secreatKey, { expiresIn: '1h' });

    // ✅ INCLUDE role in the response
    return res.status(200).json({
      message: "Login successful",
      token,
      role: exist.role,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
