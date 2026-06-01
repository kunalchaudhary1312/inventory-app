import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api';

const empty = { name: '', email: '', phone: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone || '', address: c.address || '' }); setModal(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCustomer(editing.id, form);
        toast.success('Customer updated!');
      } else {
        await createCustomer(form);
        toast.success('Customer created!');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error occurred');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await deleteCustomer(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Error'); }
  };

  if (loading) return <div className="loading">Loading customers...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Customers</div>
          <div className="page-subtitle">{customers.length} registered customers</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Customer</button>
      </div>

      <div className="table-wrap">
        {customers.length === 0 ? (
          <div className="empty"><div className="empty-icon">◎</div>No customers yet. Add one!</div>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.phone || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.address || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Customer' : 'New Customer'}</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="customer@email.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 234 567 8900" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street, City, Country" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
