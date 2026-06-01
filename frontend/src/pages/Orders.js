import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getOrders, createOrder, updateOrder, deleteOrder, getProducts, getCustomers } from '../api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const statusColor = (s) => ({ pending: 'badge-yellow', confirmed: 'badge-purple', shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red' }[s] || 'badge-gray');

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });

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
      items: form.items.map(it => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) }))
    };
    try {
      await createOrder(data);
      toast.success('Order created! Stock updated automatically.');
      setModal(false);
      setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error occurred');
    }
  };

  const openStatusModal = (order) => { setSelectedOrder(order); setNewStatus(order.status); setStatusModal(true); };

  const saveStatus = async () => {
    try {
      await updateOrder(selectedOrder.id, { status: newStatus });
      toast.success('Status updated!');
      setStatusModal(false);
      load();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try { await deleteOrder(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Error'); }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">{orders.length} total orders</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Order</button>
      </div>

      <div className="table-wrap">
        {orders.length === 0 ? (
          <div className="empty"><div className="empty-icon">◐</div>No orders yet. Create one!</div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>#{o.id}</td>
                  <td style={{ fontWeight: 600 }}>{o.customer?.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{o.items?.length} item(s)</td>
                  <td style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>${o.total_amount.toFixed(2)}</td>
                  <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openStatusModal(o)}>Status</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(o.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Order Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Order</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Customer *</label>
                <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})}>
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Order Items *</label>
                <div className="order-items-builder">
                  {form.items.map((item, i) => (
                    <div className="order-item-row" key={i}>
                      <select required value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                        <option value="">Select product...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock}) — ${p.price}</option>)}
                      </select>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} style={{ width: 70 }} />
                      {form.items.length > 1 && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm add-item-btn" onClick={addItem}>+ Add Item</button>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setStatusModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Update Order #{selectedOrder.id}</h2>
            <div className="form-group">
              <label>Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setStatusModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveStatus}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
