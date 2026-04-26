import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useMerchants } from '../hooks/useMerchants';
import { useCartContext } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Heart, Store, Star, Package } from 'lucide-react';

const parsePrice = (price: string): number => {
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading: pLoading } = useProducts(id);
  const { merchant } = useMerchants(product?.merchant_id);
  const { addToCart, updateQty, state, openDrawer } = useCartContext();
  const [flash, setFlash] = useState(false);

  if (pLoading && !product) return <div>Loading product...</div>;
  if (!product) return <div>Product not found.</div>;

  const outOfStock = product.stock !== undefined && product.stock === 0;
  const qty = state.items.find((i) => i.productId === product.id)?.quantity ?? 0;

  const handleAdd = () => {
    console.log("Add to cart called ", product.id, product.name, product.merchant_id, product.merchant_name, parsePrice(product.price), product.icon)
    addToCart({
      productId: product.id,
      productName: product.name,
      merchantId: product.merchant_id,
      merchantName: product.merchant_name ?? merchant?.name ?? 'Merchant',
      unitPrice: parsePrice(product.price),
      icon: product.icon,
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  };

  const stepperBtn = (extra: React.CSSProperties): React.CSSProperties => ({
    width: 36, height: 36, borderRadius: 10, border: 'none',
    cursor: 'pointer', fontSize: 18, display: 'grid', placeItems: 'center', ...extra,
  });

  return (
    <section style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn" style={{ background: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>ID: {product.id}</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 300, background: 'linear-gradient(135deg,#1e293b,#0f172a)', display: 'grid', placeItems: 'center', position: 'relative' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Package size={120} color="rgba(255,255,255,0.05)" />
          )}
          {outOfStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 700, color: '#fca5a5', letterSpacing: 1 }}>
              OUT OF STOCK
            </div>
          )}
        </div>

        <div style={{ padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 36 }}>{product.name}</h2>
              <div style={{ display: 'inline-block', marginTop: 8, padding: '4px 12px', background: 'rgba(165,180,252,0.1)', color: '#a5b4fc', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                {product.category}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{product.price}</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>excluding delivery</div>
            </div>
          </div>

          <p style={{ fontSize: 18, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 40 }}>{product.description}</p>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {outOfStock ? (
              <div style={{ flex: 1, padding: '1rem', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center', color: '#fca5a5', fontWeight: 700, fontSize: 16 }}>
                Currently out of stock
              </div>
            ) : qty > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(165,180,252,0.07)', border: '1px solid rgba(165,180,252,0.2)', borderRadius: 14, padding: '8px 16px' }}>
                  <button onClick={() => updateQty(product.id, qty - 1)} style={stepperBtn({ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1' })} aria-label="Decrease">−</button>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#a5b4fc', minWidth: 28, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => updateQty(product.id, qty + 1)} style={stepperBtn({ background: 'rgba(165,180,252,0.15)', color: '#a5b4fc' })} aria-label="Increase">+</button>
                </div>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: 16, fontWeight: 700, minWidth: 160, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }} onClick={openDrawer}>
                    <ShoppingCart size={20} /> View Cart
                  </button>
                </>
            ) : (
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '1rem', fontSize: 18, fontWeight: 700, background: flash ? 'linear-gradient(135deg,#6ee7b7,#34d399)' : undefined, transition: 'background 0.3s' }}
                onClick={handleAdd}
              >
                {flash ? '✓ Added!' : 'Add to Cart'}
              </button>
            )}
            <button className="btn" style={{ padding: '1rem 1.4rem', background: '#1f2937', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: 16 }}>Sold by</h3>
        <div
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 20, cursor: 'pointer', transition: 'background 0.2s' }}
          onClick={() => navigate(`/merchants/${product.merchant_id}`)}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'var(--card-bg)')}
        >
          <div style={{ width: 70, height: 70, background: '#1f2937', borderRadius: 15, display: 'grid', placeItems: 'center' }}>
            {merchant?.logo_url ? (
              <img src={merchant.logo_url} alt="Merchant Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 15 }} />
            ) : (
              <Store size={32} color="rgba(255,255,255,0.1)" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: 20 }}>{merchant?.name ?? product.merchant_name}</h4>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-dim)' }}>{merchant?.description ?? 'Quality merchant partner'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fde68a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <Star size={16} fill="#fde68a" /> {merchant?.rating ?? '4.8'}
            </div>
            <div style={{ fontSize: 12, color: '#a5b4fc', marginTop: 4 }}>View Menu →</div>
          </div>
        </div>
      </div>
    </section>
  );
};
