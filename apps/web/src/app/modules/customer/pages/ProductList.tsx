import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCartContext } from '../context/CartContext';
import type { Product } from '../types/customer.types';
import { Package } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parsePrice = (price: string): number => {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
};

const formatPrice = (price: string): string => {
  const num = parsePrice(price);
  return `Rs ${num.toFixed(2)}`;
};

// ─── Inline qty stepper shown when item is already in cart ───────────────────

const QtyControl: React.FC<{ productId: string; qty: number; onOpen: () => void }> = ({
  productId,
  qty,
  onOpen,
}) => {
  const { updateQty } = useCartContext();
  const btnBase: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    display: 'grid',
    placeItems: 'center',
    lineHeight: 1,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <button
        onClick={() => updateQty(productId, qty - 1)}
        style={{
          ...btnBase,
          background: 'rgba(255,255,255,0.08)',
          color: '#cbd5e1',
        }}
        aria-label="Decrease"
      >
        −
      </button>
      <span
        onClick={onOpen}
        title="View cart"
        style={{
          fontSize: 13,
          fontWeight: 700,
          minWidth: 20,
          textAlign: 'center',
          color: '#a5b4fc',
          cursor: 'pointer',
        }}
      >
        {qty}
      </span>
      <button
        onClick={() => updateQty(productId, qty + 1)}
        style={{
          ...btnBase,
          background: 'rgba(165,180,252,0.15)',
          color: '#a5b4fc',
        }}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
};

// ─── ProductList ──────────────────────────────────────────────────────────────

export const ProductList = () => {
  const { products, loading, error } = useProducts();
  const navigate = useNavigate();
  const { addToCart, state, openDrawer } = useCartContext();

  const getQty = (id: string) =>
    state.items.find((i) => i.productId === id)?.quantity ?? 0;

  const handleAdd = (p: Product) => {
    addToCart({
      productId: p.id,
      productName: p.name,
      merchantId: p.merchant_id,
      merchantName: p.merchant_name ?? 'Unknown Merchant',
      unitPrice: parsePrice(p.price),
      icon: p.icon,
    });
  };

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 28 }}>Discover Products</h2>
        <button className="btn" onClick={() => navigate('/merchants')}>
          View All Merchants
        </button>
      </div>

      {error && !loading && (
        <div
          style={{
            padding: 12,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid #ef4444',
            borderRadius: 8,
            color: '#fca5a5',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 140, borderRadius: 0 }} />
              <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 20 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ height: 24, width: '30%' }} />
                  <div className="skeleton" style={{ height: 32, width: '40%', borderRadius: 8 }} />
                </div>
              </div>
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((product) => {
            const qty = getQty(product.id);
            const outOfStock = product.stock !== undefined && product.stock === 0;

            return (
              <div
                key={product.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {/* Image / icon area */}
                <div
                  style={{
                    height: 140,
                    background: 'linear-gradient(135deg, #1f2937, #111827)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 64,
                    cursor: 'pointer',
                    position: 'relative',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Package size={48} color="rgba(255,255,255,0.2)" />
                  )}
                  {outOfStock && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#fca5a5',
                        letterSpacing: 1,
                      }}
                    >
                      OUT OF STOCK
                    </div>
                  )}
                  {qty > 0 && !outOfStock && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'linear-gradient(135deg,#a5b4fc,#ec4899)',
                        color: '#fff',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 800,
                        width: 22,
                        height: 22,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {qty}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: 4 }}>
                    <h3
                      style={{ margin: 0, fontSize: 16, cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    <div
                      style={{ fontSize: 12, color: '#a5b4fc', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => navigate(`/merchants/${product.merchant_id}`)}
                    >
                      by {product.merchant_name}
                    </div>
                  </div>

                  <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-dim)', flex: 1 }}>
                    {product.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>{formatPrice(product.price)}</span>

                    {outOfStock ? (
                      <span style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600 }}>
                        Unavailable
                      </span>
                    ) : qty > 0 ? (
                      <QtyControl productId={product.id} qty={qty} onOpen={openDrawer} />
                    ) : (
                      <button
                        id={`add-to-cart-${product.id}`}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 0.8rem', fontSize: 13 }}
                        onClick={() => handleAdd(product)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : !error && (
          <div style={{ color: 'var(--text-dim)', padding: 20 }}>No products found.</div>
        )}
      </div>
    </section>
  );
};
