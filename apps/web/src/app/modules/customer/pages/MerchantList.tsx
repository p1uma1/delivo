import { useMerchants } from '../hooks/useMerchants';
import { useNavigate } from 'react-router-dom';

export const MerchantList = () => {
  const { merchants, loading, error } = useMerchants();
  const navigate = useNavigate();

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 28 }}>Explore Merchants</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, color: '#fca5a5' }}>
          {error} (Showing fallback data)
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
        opacity: loading ? 0.7 : 1,
        transition: 'opacity 0.3s'
      }}>
        {merchants.map((merchant) => (
          <div
            key={merchant.id}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onClick={() => navigate(`/merchants/${merchant.id}`)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              height: 140,
              background: 'linear-gradient(135deg, #1f2937, #111827)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 64,
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              {merchant.icon}
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>{merchant.name}</h3>
                <span style={{ fontSize: 13, color: '#fde68a', fontWeight: 700 }}>★ {merchant.rating}</span>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-dim)', height: 40, overflow: 'hidden' }}>
                {merchant.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>{merchant.category}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>⏱ {merchant.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
