import React, { useEffect, useState } from 'react';
import { getProducts, getCustomers, getOrders } from '../api';
import { formatINR } from '../utils/currency';

const getStatusBadge = (status) => {
  const map = {
    pending: 'badge-yellow',
    confirmed: 'badge-blue',
    shipped: 'badge-blue',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  };
  return map[status] || 'badge-gray';
};

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([p, c, o]) => {
        const orders = o.data;
        const revenue = orders.reduce((sum, ord) => sum + ord.total_amount, 0);
        setStats({
          products: p.data.length,
          customers: c.data.length,
          orders: orders.length,
          revenue,
        });
        setRecentOrders(orders.slice(-5).reverse());
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Overview of inventory and orders</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value highlight">{stats.products}</div>
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
          <div className="stat-value highlight">{formatINR(stats.revenue)}</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-header">Recent Orders</div>
        {recentOrders.length === 0 ? (
          <div className="empty">No orders yet</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="text-primary">#{o.id}</td>
                  <td>{o.customer?.name}</td>
                  <td className="text-success">{formatINR(o.total_amount)}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
