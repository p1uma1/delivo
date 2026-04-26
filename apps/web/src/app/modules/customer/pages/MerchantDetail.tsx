import { useParams, useNavigate } from 'react-router-dom';
import { useMerchants } from '../hooks/useMerchants';
import { useProducts } from '../hooks/useProducts';

export const MerchantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { merchant, loading: mLoading } = useMerchants(id);
  const { products, loading: pLoading } = useProducts(undefined, id);

  if (mLoading && !merchant) return <div>Loading merchant details...</div>;
  if (!merchant) return <div>Merchant not found.</div>;

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      {/* Header / Hero Section */}
      <div className="card" style={{
        padding: 30,
        background: 'linear-gradient(135deg, rgba(31,41,55,0.9), rgba(17,24,39,0.9))',
        display: 'flex',
        gap: 30,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: 80, background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20 }}>
          {merchant.icon}
        </div>
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <h2 style={{ margin: 0, fontSize: 32 }}>{merchant.name}</h2>
            <button className="btn" style={{ background: '#374151' }} onClick={() => navigate(-1)}>Go Back</button>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 16, margin: '8px 0 20px 0' }}>{merchant.description}</p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#fde68a', fontSize: 18 }}>★</span>
              <span style={{ fontWeight: 700 }}>{merchant.rating} Rating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#a5b4fc', fontSize: 18 }}>⏱</span>
              <span style={{ fontWeight: 700 }}>{merchant.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#6ee7b7', fontSize: 18 }}>📍</span>
              <span style={{ fontWeight: 700 }}>{merchant.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div>
        <h3 style={{ fontSize: 24, marginBottom: 20 }}>Menu Items</h3>
        {pLoading ? (
          <div>Loading menu...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20
          }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="card"
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: 16,
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div style={{
                  width: 80,
                  height: 80,
                  background: '#1f2937',
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 40
                }}>
                  {product.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: 17 }}>{product.name}</h4>
                  <p style={{ margin: '4px 0 8px 0', fontSize: 12, color: 'var(--text-dim)', lineHeight: '1.4' }}>
                    {product.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#a5b4fc' }}>{product.price}</span>
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: 12 }} onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart logic
                    }}>Add +</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
