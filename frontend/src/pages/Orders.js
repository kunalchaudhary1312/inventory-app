import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getOrders, createOrder, updateOrder, deleteOrder, getProducts, getCustomers } from '../api';
import { formatINR } from '../utils/currency';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    customer_id: '',
    status: 'confirmed',
    items: [{ product_id: '', quantity: 1 }],
  });

  const load = () => Promise.all([getOrders(), getProducts(), getCustomers()])
    .then(([o, p, c]) => { setOrders(o.data); setProducts(p.data); setCustomers(c.data); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, key, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [key]: val };
    setForm({ ...form, items });
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = {
      customer_id: parseInt(form.customer_id),
      status: form.status,
      items: form.items.map((it) => ({
        product_id: parseInt(it.product_id),
        quantity: parseInt(it.quantity),
      })),
    };
    try {
      await createOrder(data);
      toast.success('Order created successfully');
      setModal(false);
      setForm({ customer_id: '', status: 'confirmed', items: [{ product_id: '', quantity: 1 }] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      toast.success('Status updated');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      toast.error('Failed to update status');
      load();
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">{orders.length} total orders</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>Create Order</button>
      </div>

      <div className="table-wrap">
        {orders.length === 0 ? (
          <div className="empty">No orders found. Click Create Order to add one.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="text-primary">#{o.id}</td>
                  <td className="text-bold">{o.customer?.name}</td>
                  <td className="text-muted text-small">{o.items?.length} item(s)</td>
                  <td className="text-success">{formatINR(o.total_amount)}</td>
                  <td>
                    <select
                      className="status-select"
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-muted text-small">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(o.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Order</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Customer</label>
                <select required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Order Items</label>
                <div className="order-items-builder">
                  {form.items.map((item, i) => (
                    <div className="order-item-row" key={i}>
                      <select required value={item.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)}>
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.stock}) - {formatINR(p.price)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        style={{ width: 70 }}
                      />
                      {form.items.length > 1 && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>Remove</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm add-item-btn" onClick={addItem}>Add Item</button>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
