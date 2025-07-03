import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { logout } from '../components/auth';


export default function AdminDashboard() {
  const [form, setForm] = useState({
    _id: null,
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products');
    setProducts(res.data);
  };

  const fetchOrders = async () => {
    const res = await axios.get('http://localhost:5000/api/orders');
    setOrders(res.data);
  };

  const updateOrderStatus = async (id, newStatus) => {
    await axios.put(`http://localhost:5000/api/orders/${id}`, { status: newStatus });
    fetchOrders();
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', form.name);
    data.append('description', form.description);
    data.append('price', form.price);
    data.append('category', form.category);
    if (form.image) data.append('image', form.image);

    if (isEditing) {
      await axios.put(`http://localhost:5000/api/products/${form._id}`, data);
      alert('Product updated');
    } else {
      await axios.post('http://localhost:5000/api/products', data);
      alert('Product added');
    }
    setForm({ _id: null, name: '', description: '', price: '', category: '', image: null });
    setIsEditing(false);
    fetchProducts();
  };

  const handleEdit = (prod) => {
    setForm({ ...prod, image: null });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Admin Dashboard</h2>
        <button onClick={logout} className="btn btn-outline-danger">Logout</button>
      </div>

      {/* Product Form */}
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="row g-3">
            <div className="col-md-4">
              <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-4">
              <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-2">
              <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-2">
              <input name="category" placeholder="Category" value={form.category} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <input name="image" type="file" accept="image/*" onChange={handleChange} className="form-control" />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-success">{isEditing ? 'Update' : 'Add'} Product</button>
            </div>
          </form>
        </div>
      </div>

      {/* Products List */}
      <h4 className="mb-3">Products</h4>
      <div className="row g-3">
        {products.map(prod => (
          <div key={prod._id} className="col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <img
                src={prod.imageURL ? `http://localhost:5000/uploads/${prod.imageURL}` : '/noimage.png'}
                alt={prod.name}
                className="card-img-top"
                style={{ height: 180, objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{prod.name}</h5>
                <p className="card-text">₹{prod.price}</p>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(prod)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(prod._id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <h4 className="mt-5">Customer Orders</h4>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Customer</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Items</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order.name}</td>
                  <td>{order.address}</td>
                  <td>{order.contact}</td>
                  <td>{order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={order.status || 'Pending'}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
