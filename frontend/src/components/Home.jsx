// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import supermarketBg from '../assets/supermarket.jpg';

const backgroundStyle = {
   backgroundImage: `url(${supermarketBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: '40px',
  maxWidth: '500px',
  width: '90%',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.3)',
};

export default function Home() {
  return (
    <div style={backgroundStyle}>
      <div style={glassCardStyle}>
        <h1 className="mb-3 fw-bold">Welcome to Grocery store</h1>
        <p className="mb-4">Your one-stop shop for all daily essentials</p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/register" className="btn btn-success btn-lg rounded-pill px-4">
            Sign Up
          </Link>
          <Link to="/login" className="btn btn-outline-light btn-lg rounded-pill px-4">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
