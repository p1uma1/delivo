import { useMerchantDashboard } from '../hooks/useMerchantDashboard';

const statusColor: Record<string, string> = {
  New: '#6ee7b7',
  Preparing: '#fde68a',
  Ready: '#93c5fd',
  'Picked Up': '#d1d5db',
  Available: '#6ee7b7',
  'Low Stock': '#fde68a',
  'Out of Stock': '#fca5a5',
};

export const MerchantDashboard = () => {
  const { data, loading, error } = useMerchantDashboard();

  return (
    <section style={{ display: 'grid', gap: 20 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(251,146,60,0.12), rgba(253,230,138,0.08))',
          border: '1px solid rgba(251,146,60,0.24)',
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
          <h2 style={{ fontSize: 26, margin: 0 }}>Merchant Dashboard</h2>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>
            {data.storeName} · {data.storeEmail}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: '#2b1e10', color: '#fde68a', border: '1px solid #7c4b1d' }}>
            Close Store
          </button>
          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg,#fde68a,#fb923c)', color: '#0d0d0d', fontWeight: 700 }}
          >
            + Add Product
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
          Live data unavailable for some services. Showing fallback data. ({error})
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          opacity: loading ? 0.75 : 1,
        }}
      >
        {data.stats.map((stat) => (
          <div key={stat.label} className="card" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                top: -24,
                right: -24,
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: stat.color,
                opacity: 0.08,
              }}
            />
            <div style={{ fontSize: 24 }}>{stat.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{stat.value}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{stat.label}</div>
            <div style={{ color: '#6ee7b7', fontSize: 13, fontWeight: 700, marginTop: 6 }}>{stat.change} today</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--glass-border)', fontWeight: 700 }}>
            Live Orders
          </div>
          {data.orders.map((order) => (
            <div
              key={order.id}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#93c5fd', fontWeight: 700 }}>{order.id}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: '2px 8px',
                      background: `${statusColor[order.status]}22`,
                      color: statusColor[order.status],
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                <div style={{ fontSize: 14 }}>{order.customer}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>{order.items}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{order.total}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>{order.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--glass-border)', fontWeight: 700 }}>
            Products
          </div>
          {data.products.map((product) => (
            <div
              key={product.name}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  {product.img}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{product.orders} orders</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{product.price}</div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 999,
                    padding: '2px 8px',
                    background: `${statusColor[product.stock]}22`,
                    color: statusColor[product.stock],
                  }}
                >
                  {product.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
