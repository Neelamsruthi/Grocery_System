import React, { useState } from 'react';
import axios from 'axios';

export default function OrderForm({ cart, onSuccess }) {
  const [form, setForm] = useState({ name: '', contact: '', address: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    const orderData = {
      customerName: form.name,
      contact: form.contact,
      address: form.address,
      items: cart.map(item => ({
        productId: item.productId?._id || item._id,
        name: item.productId?.name || item.name,
        price: item.productId?.price || item.price,
        quantity: item.quantity,
      })),
      total,
    };

    try {
      await axios.post('http://localhost:5000/api/orders', orderData);
      alert('✅ Order placed successfully!');
      onSuccess(); // clear cart, refresh UI etc.
    } catch (err) {
      console.error('Order submission error:', err.response?.data || err.message);
      alert('❌ Failed to place order. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h3>Enter Your Details</h3>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        style={{ margin: 5 }}
      /><br />
      <input
        placeholder="Contact"
        value={form.contact}
        onChange={(e) => setForm({ ...form, contact: e.target.value })}
        required
        style={{ margin: 5 }}
      /><br />
      <textarea
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        required
        style={{ margin: 5 }}
      /><br />
      <button type="submit" style={{ marginTop: 10, padding: '8px 16px' }}>Submit Order</button>
    </form>
  );
}
