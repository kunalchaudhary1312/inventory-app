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
      <Toaster position="top-right" />
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-icon">⬡</span>
            <span className="brand-name">InvMS</span>
          </div>
          <nav>
            <NavLink to="/" end className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              <span>◈</span> Dashboard
            </NavLink>
            <NavLink to="/products" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              <span>◉</span> Products
            </NavLink>
            <NavLink to="/customers" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              <span>◎</span> Customers
            </NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              <span>◐</span> Orders
            </NavLink>
          </nav>
          <div className="sidebar-footer">Inventory & Order System</div>
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
