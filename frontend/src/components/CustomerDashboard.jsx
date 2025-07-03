import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { logout } from '../components/auth';


export default function CustomerDashboard() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products', {
        params: { search, category }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCartItems(res.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCart();
  }, [search, category]);

  const handleAddToCart = async (product) => {
    try {
      await axios.post(
        'http://localhost:5000/api/user/cart',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchCart();
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  };

  const handleQuantityChange = async (id, quantity) => {
    try {
      await axios.put(
        `http://localhost:5000/api/user/cart/${id}`,
        { quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchCart();
    } catch (err) {
      console.error('Update quantity error:', err);
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/user/cart/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchCart();
    } catch (err) {
      console.error('Remove cart item error:', err);
    }
  };

  const getTotal = () =>
    cartItems.reduce((total, item) => {
      if (!item.productId) return total;
      return total + item.productId.price * item.quantity;
    }, 0);

  const placeOrder = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const address = form.address.value;
    const contact = form.contact.value;

    if (!name || !address || !contact) return alert('All fields required!');

    try {
      await axios.post('http://localhost:5000/api/orders', {
        name,
        address,
        contact,
        items: cartItems
          .filter(item => item.productId)
          .map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            quantity: item.quantity,
          })),
      });
      setOrderSuccess('✅ Order placed successfully');
      setCartItems([]);
      fetchOrders();
      form.reset();
      setShowCart(false);
    } catch (err) {
      console.error('Order error:', err);
      alert('Failed to place order');
    }
  };

  const categories = ['All', 'Fruits', 'Vegetables', 'Grocery'];

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Welcome, Customer</h2>
        <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select shadow-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2 text-end">
          <button className="btn btn-warning w-100 shadow-sm" onClick={() => setShowCart(true)}>
            🛒 Cart ({cartItems.length})
          </button>
        </div>
      </div>

      <div className="row g-4">
        {products.map((prod) => (
          <div key={prod._id} className="col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow rounded-4 border-0">
              <img
                src={`http://localhost:5000/uploads/${prod.imageURL}`}
                alt={prod.name}
                className="card-img-top rounded-top-4"
                style={{ height: 180, objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-semibold text-secondary">{prod.name}</h5>
                <p className="card-text text-success fw-bold">₹{prod.price}</p>
                <button
                  className="btn btn-success mt-auto rounded-pill fw-bold"
                  onClick={() => handleAddToCart(prod)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCart && (
        <div className="mt-5 bg-white p-4 rounded-4 shadow-lg">
          <h3 className="text-primary">Your Cart</h3>
          {cartItems.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <>
              <table className="table table-bordered table-striped table-hover mt-3">
                <thead className="table-dark">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => item.productId && (
                    <tr key={item._id}>
                      <td>{item.productId.name}</td>
                      <td>₹{item.productId.price}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}>−</button>
                          <span className="mx-2">{item.quantity}</span>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td>₹{item.productId.price * item.quantity}</td>
                      <td><button className="btn btn-sm btn-danger" onClick={() => handleRemove(item._id)}>Remove</button></td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" className="text-end fw-bold">Total:</td>
                    <td colSpan="2" className="fw-bold">₹{getTotal()}</td>
                  </tr>
                </tbody>
              </table>

              <form onSubmit={placeOrder} className="mt-4">
                <h5 className="mb-3">Enter your details</h5>
                <input name="name" placeholder="Name" className="form-control my-2" required />
                <input name="address" placeholder="Address" className="form-control my-2" required />
                <input name="contact" placeholder="Contact" className="form-control my-2" required />
                <button type="submit" className="btn btn-primary mt-2">Place Order</button>
                <button type="button" className="btn btn-secondary mt-2 ms-2" onClick={() => setShowCart(false)}>Close Cart</button>
              </form>
            </>
          )}
        </div>
      )}

      {orderSuccess && (
        <div className="alert alert-success mt-4" role="alert">
          {orderSuccess}
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-secondary">Your Orders</h3>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="table table-bordered table-hover table-striped mt-3">
            <thead className="table-secondary">
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Items</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.name}</td>
                  <td>{order.address}</td>
                  <td>{order.contact}</td>
                  <td>{order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</td>
                  <td>{order.status || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
