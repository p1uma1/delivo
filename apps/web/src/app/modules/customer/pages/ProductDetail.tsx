import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useMerchants } from '../hooks/useMerchants';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading: pLoading } = useProducts(id);
  const { merchant, loading: mLoading } = useMerchants(product?.merchantId);

  if (pLoading && !product) return <div>Loading product...</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <section style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn" style={{ background: '#1f2937' }} onClick={() => navigate(-1)}>← Back</button>
        <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>Product ID: {product.id}</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          height: 300,
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 120
        }}>
          {product.icon}
        </div>
        <div style={{ padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 36 }}>{product.name}</h2>
              <div style={{
                display: 'inline-block',
                marginTop: 8,
                padding: '4px 12px',
                background: 'rgba(165,180,252,0.1)',
                color: '#a5b4fc',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700
              }}>
                {product.category}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>{product.price}</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>excluding delivery</div>
            </div>
          </div>

          <p style={{ fontSize: 18, color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: 40 }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', gap: 16 }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: 18, fontWeight: 700 }}>
              Add to Cart
            </button>
            <button className="btn" style={{ padding: '1rem 2rem', background: '#1f2937' }}>
              ❤️ Favorite
            </button>
          </div>
        </div>
      </div>

      {/* Merchant Card */}
      <div>
        <h3 style={{ marginBottom: 16 }}>Sold by</h3>
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: 20,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onClick={() => navigate(`/merchants/${product.merchantId}`)}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
        >
          <div style={{ fontSize: 40, background: '#1f2937', padding: 15, borderRadius: 15 }}>
            {merchant?.icon || '🏪'}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: 20 }}>{merchant?.name || product.merchantName}</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: 14, color: 'var(--text-dim)' }}>
              {merchant?.description || 'Quality merchant partner'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fde68a', fontWeight: 700 }}>★ {merchant?.rating || '4.8'}</div>
            <div style={{ fontSize: 12, color: '#a5b4fc' }}>View Menu →</div>
          </div>
        </div>
      </div>
    </section>
  );
};
