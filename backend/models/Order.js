const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: String,
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
    default: 'Pending', // Other statuses: Shipped, Delivered
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Order', orderSchema);
