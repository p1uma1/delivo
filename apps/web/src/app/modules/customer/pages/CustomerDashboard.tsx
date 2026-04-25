import { useCustomerDashboard } from '../hooks/useCustomerDashboard';
import { useNavigate } from 'react-router-dom';

const steps = ['Order Placed', 'Confirmed', 'Preparing', 'On the Way', 'Delivered'];

const statusColor: Record<string, string> = {
  Delivered: '#6ee7b7',
  Cancelled: '#fca5a5',
  Processing: '#93c5fd',
};

export const CustomerDashboard = () => {
  const { data, loading, error } = useCustomerDashboard();
  const navigate = useNavigate();

  return (
    <section style={{ display: 'grid', gap: 20 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(165,180,252,0.12), rgba(236,72,153,0.08))',
          border: '1px solid rgba(165,180,252,0.22)',
          borderRadius: 14,
          padding: '16px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 26 }}>Good evening, {data.name} 👋</h2>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>📍 {data.location}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: '#1f2937', color: '#cbd5e1', border: '1px solid #374151' }}>
            🛒 Cart {data.cartCount}
          </button>
          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg,#a5b4fc,#ec4899)', color: '#fff', fontWeight: 700 }}
            onClick={() => navigate('/customer/products')}
          >
            Order Now
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 13,
          }}
        >
          Some customer services are unavailable, so fallback data is shown. ({error})
        </div>
      )}

      <div
        className="card"
        style={{
          display: 'flex',
          gap: 12,
          padding: 14,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: '#94a3b8', fontSize: 18 }}>🔍</span>
        <input
          placeholder="Search for food, restaurants..."
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontSize: 15,
            flex: 1,
            minWidth: 220,
          }}
        />
        <button className="btn btn-primary" onClick={() => navigate('/customer/products')}>Search</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, opacity: loading ? 0.75 : 1 }}>
        <div className="card" style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>Live Order</h3>
              <div style={{ color: '#a5b4fc', fontWeight: 600, fontSize: 13 }}>
                {data.activeOrder.id} · {data.activeOrder.merchant}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{data.activeOrder.eta}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>estimated arrival</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            {steps.map((step, index) => {
              const isDone = index < data.activeOrder.status;
              const isCurrent = index === data.activeOrder.status;

              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: '1 1 90px', minWidth: 90 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isDone || isCurrent ? '#a5b4fc' : '#374151',
                        background: isDone ? '#a5b4fc' : isCurrent ? '#1a0d1f' : 'transparent',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 12,
                        color: isDone ? '#0d0d0d' : isCurrent ? '#a5b4fc' : '#6b7280',
                      }}
                    >
                      {isDone ? '✓' : index + 1}
                    </div>
                    <div style={{ fontSize: 9, color: isDone || isCurrent ? '#a5b4fc' : '#6b7280', fontWeight: 700, textAlign: 'center' }}>
                      {step}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: '0 6px', background: isDone ? '#a5b4fc' : '#374151' }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ background: '#1f2937', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>YOUR ITEMS</div>
            {data.activeOrder.items.map((item) => (
              <div key={item} style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 2 }}>
                • {item}
              </div>
            ))}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #374151', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#a5b4fc' }}>{data.activeOrder.total}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" style={{ flex: 1, minWidth: 140, background: '#1f2937', color: '#cbd5e1', border: '1px solid #374151' }}>
              📞 Call Rider
            </button>
            <button className="btn" style={{ flex: 1, minWidth: 140, background: '#1f2937', color: '#cbd5e1', border: '1px solid #374151' }}>
              💬 Chat
            </button>
          </div>
        </div>

        <div className="card" style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
          <h3 style={{ marginBottom: 10 }}>Order History</h3>
          {data.orderHistory.map((order) => (
            <div
              key={order.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    background: '#1f2937',
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 20,
                  }}
                >
                  {order.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{order.merchant}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{order.date} · {order.id}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{order.total}</div>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: 4,
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontWeight: 700,
                    background: `${statusColor[order.status]}22`,
                    color: statusColor[order.status],
                  }}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Recommended for You</h3>
          <button className="btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => navigate('/products')}>View All</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {data.recommended.map((item) => (
            <div
              key={item.name}
              className="card"
              style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate('/products')}
            >
              <div style={{ height: 100, background: '#1f2937', display: 'grid', placeItems: 'center', fontSize: 48 }}>
                {item.icon}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>{item.merchant}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: '#fde68a' }}>★ {item.rating}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>⏱ {item.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{item.price}</span>
                  <button className="btn btn-primary" style={{ padding: '0.55rem 0.9rem' }}>Add +</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <h3 style={{ marginBottom: 14 }}>Your Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {[
              { label: 'Total Orders', value: '48' },
              { label: 'Saved', value: '$24.50' },
              { label: 'Favourite', value: 'Burger Bliss' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#a5b4fc' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
