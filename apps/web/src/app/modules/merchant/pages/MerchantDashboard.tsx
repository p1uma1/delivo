import React, { useEffect, useState } from 'react';
import { Building2, Plus, Package, Edit3, Trash2, X, AlertCircle, DollarSign, BarChart3 } from 'lucide-react';
import api from '../../../../shared/api/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
}

const emptyForm = { name: '', description: '', price: '', category: '', stock: '' };

export const MerchantDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/merchant/my-products');
      setProducts(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock),
      };

      if (editingId) {
        await api.patch(`/products/merchant/products/${editingId}`, payload);
      } else {
        await api.post('/products/merchant/products', payload);
      }

      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      await fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/merchant/products/${id}`);
      await fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete product');
    }
  };

  const activeProducts = products.filter(p => p.isActive);
  const totalRevenue = activeProducts.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(139,92,246,0.08) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} color="#8b5cf6" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Merchant Dashboard</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>Manage your product inventory</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Products</p>
          <h2 style={{ margin: 0, color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}><Package size={20} /> {products.length}</h2>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Active</p>
          <h2 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}><BarChart3 size={20} /> {activeProducts.length}</h2>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Inventory Value</p>
          <h2 style={{ margin: 0, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}><DollarSign size={20} /> {totalRevenue.toFixed(0)}</h2>
        </div>
      </div>

      {/* ─── Product Form Modal ─────────────────────────────────── */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0 }}>{editingId ? 'Edit Product' : 'Add New Product'}</h4>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              style={{ padding: '0.6rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '0.375rem', color: 'var(--text)', gridColumn: '1 / -1' }} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ padding: '0.6rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '0.375rem', color: 'var(--text)', gridColumn: '1 / -1', minHeight: '60px', resize: 'vertical' }} />
            <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required
              style={{ padding: '0.6rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '0.375rem', color: 'var(--text)' }} />
            <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required
              style={{ padding: '0.6rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '0.375rem', color: 'var(--text)' }} />
            <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required
              style={{ padding: '0.6rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '0.375rem', color: 'var(--text)', gridColumn: '1 / -1' }} />
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
              {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="var(--danger)" />
          <span style={{ color: 'var(--danger)' }}>{error}</span>
        </div>
      )}

      {/* ─── Product List ──────────────────────────────────────── */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-dim)' }}>Loading your products...</p>
        </div>
      ) : activeProducts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {activeProducts.map(product => (
            <div key={product.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                  {product.category}
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => handleEdit(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0.25rem' }}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.25rem' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{product.name}</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.825rem', marginBottom: '1rem' }}>{product.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>${product.price.toFixed(2)}</span>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-dim)' }}>
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Building2 size={40} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-dim)', margin: '0 0 1rem 0' }}>You haven't listed any products yet.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
};
