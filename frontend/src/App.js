import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Dashboard from './pages/Dashboard';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#1f2937',
            border: '1px solid #dde3ea',
            fontSize: '14px',
          },
        }}
      />
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-name">Inventory Manager</div>
            <div className="brand-tag">Order Management System</div>
          </div>
          <nav>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Dashboard
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Products
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Customers
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Orders
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <div>Kunal Chaudhary</div>
            <div>Ethara.ai Assignment</div>
          </div>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
