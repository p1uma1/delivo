import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Info, Coins, Layers, Image as ImageIcon } from 'lucide-react';
import { useProductManagement } from '../hooks/useProductManagement';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image_url?: string;
  } | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSuccess, product }) => {
  const { createProduct, updateProduct, creating, error: apiError } = useProductManagement();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Food',
    stock: '100',
    image_url: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category || 'Food',
        stock: product.stock.toString(),
        image_url: product.image_url || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Food',
        stock: '100',
        image_url: '',
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock);

    if (!formData.name || !formData.description || isNaN(priceNum)) {
      setFormError('Please fill in all required fields correctly.');
      return;
    }

    try {
      if (product) {
        await updateProduct(product.id, {
          name: formData.name,
          description: formData.description,
          price: priceNum,
          category: formData.category,
          stock: isNaN(stockNum) ? 0 : stockNum,
          image_url: formData.image_url || undefined,
        });
      } else {
        await createProduct({
          name: formData.name,
          description: formData.description,
          price: priceNum,
          category: formData.category,
          stock: isNaN(stockNum) ? 0 : stockNum,
          image_url: formData.image_url || undefined,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxHeight: '90vh',
          maxWidth: 550,
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(251,146,60,0.3)',
          background: '#111827',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, rgba(251,146,60,0.15), transparent)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ padding: 10, borderRadius: 12, background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>
              <Package size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{product ? 'Edit Product' : 'Add New Product'}</h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)' }}>{product ? 'Update your product details' : 'List a new item in your store'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              color: 'var(--text-dim)', 
              cursor: 'pointer', 
              padding: 8, 
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          style={{ padding: '28px', overflowY: 'auto', display: 'grid', gap: 24 }}
        >
          {(apiError || formError) && (
            <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 14, fontWeight: 500 }}>
              {formError || apiError}
            </div>
          )}

          <div style={{ display: 'grid', gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={14} color="#fb923c" /> Product Name
            </label>
            <input
              name="name"
              placeholder="e.g. Double Beef Burger"
              className="input"
              value={formData.name}
              onChange={handleChange}
              style={{ background: 'rgba(255,255,255,0.02)' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={14} color="#fb923c" /> Description
            </label>
            <textarea
              name="description"
              placeholder="Tell customers about your delicious item..."
              className="input"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              style={{ background: 'rgba(255,255,255,0.02)', minHeight: 80 }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Coins size={14} color="#fb923c" /> Price (Rs)
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="input"
                value={formData.price}
                onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.02)' }}
                required
              />
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={14} color="#fb923c" /> Category
              </label>
              <select
                name="category"
                className="input"
                value={formData.category}
                onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <option value="Food">Food</option>
                <option value="Beverage">Beverage</option>
                <option value="Dessert">Dessert</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
             <div style={{ display: 'grid', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                Stock
              </label>
              <input
                name="stock"
                type="number"
                className="input"
                value={formData.stock}
                onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.02)' }}
              />
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ImageIcon size={14} color="#fb923c" /> Image URL
              </label>
              <input
                name="image_url"
                placeholder="https://..."
                className="input"
                value={formData.image_url}
                onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.02)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={creating}
              style={{ 
                flex: 2, 
                background: 'linear-gradient(135deg,#fde68a,#fb923c)', 
                color: '#000', 
                fontWeight: 800,
                boxShadow: '0 10px 20px -5px rgba(251,146,60,0.3)'
              }}
            >
              {creating ? (product ? 'Updating...' : 'Creating...') : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
