import React, { useEffect, useState } from 'react';
import { getProducts, getCustomers, getOrders } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([p, c, o]) => {
        const orders = o.data;
        const revenue = orders.reduce((sum, ord) => sum + ord.total_amount, 0);
        setStats({ products: p.data.length, customers: c.data.length, orders: orders.length, revenue });
        setRecentOrders(orders.slice(-5).reverse());
      })
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s) => ({ pending: 'badge-yellow', confirmed: 'badge-purple', shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red' }[s] || 'badge-gray');

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Inventory & Order overview</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value stat-accent">{stats.products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Customers</div>
          <div className="stat-value">{stats.customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders</div>
          <div className="stat-value">{stats.orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value stat-accent">${stats.revenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="table-wrap">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          Recent Orders
        </div>
        {recentOrders.length === 0 ? (
          <div className="empty"><div className="empty-icon">◎</div>No orders yet</div>
        ) : (
          <table>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>#{o.id}</td>
                  <td>{o.customer?.name}</td>
                  <td style={{ color: 'var(--success)' }}>${o.total_amount.toFixed(2)}</td>
                  <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
