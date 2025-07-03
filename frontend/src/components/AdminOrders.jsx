// ✅ 1. models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: String,
  contact: String,
  address: String,
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
    }
  ],
  total: Number,
  status: {
    type: String,
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Order', orderSchema);

// ✅ 2. routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ message: 'Order placed', order });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order status updated', order: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;

// ✅ 3. server.js (Add this line)
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// ✅ 4. components/OrderForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function OrderForm({ cart, onSuccess }) {
  const [form, setForm] = useState({ name: '', contact: '', address: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      customerName: form.name,
      contact: form.contact,
      address: form.address,
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
    };

    try {
      await axios.post('http://localhost:5000/api/orders', orderData);
      alert('Order placed!');
      onSuccess();
    } catch (err) {
      console.error('Order error:', err);
      alert('Failed to place order');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h3>Enter Your Details</h3>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><br />
      <input placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required /><br />
      <textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /><br />
      <button type="submit">Submit Order</button>
    </form>
  );
}

// ✅ 5. components/AdminOrders.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Fetch orders error:', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>All Orders</h2>
      {orders.map((order) => (
        <div key={order._id} style={{ border: '1px solid #aaa', marginBottom: 20, padding: 10 }}>
          <p><strong>Customer:</strong> {order.customerName}</p>
          <p><strong>Contact:</strong> {order.contact}</p>
          <p><strong>Address:</strong> {order.address}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ₹{order.total}</p>
          <ul>
            {order.items.map((item, i) => (
              <li key={i}>{item.name} x {item.quantity} = ₹{item.price * item.quantity}</li>
            ))}
          </ul>
          <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      ))}
    </div>
  );
}
