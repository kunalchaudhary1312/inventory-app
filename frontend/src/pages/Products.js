import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import { formatINR } from '../utils/currency';

const empty = { sku: '', name: '', description: '', price: '', stock: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => getProducts().then((r) => setProducts(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ sku: p.sku, name: p.name, description: p.description || '', price: p.price, stock: p.stock });
    setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    try {
      if (editing) {
        await updateProduct(editing.id, {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
        });
        toast.success('Product updated');
      } else {
        await createProduct(data);
        toast.success('Product created');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    }
  };

  const getStockBadge = (stock) => {
    if (stock > 10) return 'badge-green';
    if (stock > 0) return 'badge-yellow';
    return 'badge-red';
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">{products.length} products in inventory</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>Add Product</button>
      </div>

      <div className="table-wrap">
        {products.length === 0 ? (
          <div className="empty">No products found. Click Add Product to create one.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="text-primary text-bold">{p.sku}</td>
                  <td>
                    {p.name}
                    {p.description && <div className="text-muted text-small">{p.description}</div>}
                  </td>
                  <td className="text-success">{formatINR(p.price)}</td>
                  <td>
                    <span className={`badge ${getStockBadge(p.stock)}`}>{p.stock}</span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={submit}>
              {!editing && (
                <div className="form-group">
                  <label>SKU</label>
                  <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="PROD-001" />
                </div>
              )}
              <div className="form-group">
                <label>Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Price (INR)</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
