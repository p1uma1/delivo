import { useProducts } from '../hooks/useProducts';
import { useNavigate } from 'react-router-dom';

export const ProductList = () => {
  const { products, loading, error } = useProducts();
  const navigate = useNavigate();

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 28 }}>Discover Products</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => navigate('/merchants')}>View All Merchants</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, color: '#fca5a5' }}>
          {error} (Showing fallback data)
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 20,
        opacity: loading ? 0.7 : 1,
        transition: 'opacity 0.3s'
      }}>
        {products.map((product) => (
          <div
            key={product.id}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                height: 120,
                background: '#1f2937',
                display: 'grid',
                placeItems: 'center',
                fontSize: 56,
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {product.icon}
            </div>
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
                  onClick={() => navigate(`/customer/merchants/${product.merchantId}`)}
                >
                  by {product.merchantName}
                </div>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: 12, color: 'var(--text-dim)', flex: 1 }}>
                {product.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{product.price}</span>
                <button className="btn btn-primary" style={{ padding: '0.5rem 0.8rem', fontSize: 13 }}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
