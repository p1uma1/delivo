import { useMerchants } from '../hooks/useMerchants';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Store } from 'lucide-react';

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

      {error && !loading && (
        <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, color: '#fca5a5' }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 140, borderRadius: 0 }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="skeleton" style={{ height: 20, width: '60%' }} />
                  <div className="skeleton" style={{ height: 16, width: '20%' }} />
                </div>
                <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 20 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ height: 14, width: '30%' }} />
                  <div className="skeleton" style={{ height: 14, width: '25%' }} />
                </div>
              </div>
            </div>
          ))
        ) : merchants.length > 0 ? (
          merchants.map((merchant) => (
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
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden'
              }}>
                {merchant.logo_url ? (
                  <img 
                    src={merchant.logo_url} 
                    alt={merchant.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <Store size={48} color="rgba(255,255,255,0.2)" />
                )}
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{merchant.name}</h3>
                  <span style={{ fontSize: 13, color: '#fde68a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={14} fill="#fde68a" /> {merchant.rating}
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-dim)', height: 40, overflow: 'hidden' }}>
                  {merchant.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>{merchant.category}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} /> {merchant.time}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : !error && (
          <div style={{ color: 'var(--text-dim)', padding: 20 }}>No merchants found.</div>
        )}
      </div>
    </section>
  );
};
