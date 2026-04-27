import { useState } from 'react';
import { useMerchantDashboard } from '../hooks/useMerchantDashboard';
import { DollarSign, Activity, Package, Star, Store, Plus, Power, Edit2 } from 'lucide-react';
import { ProductModal } from '../components/ProductModal';
import { MerchantProduct } from '../types/merchant.types';

const statusColor: Record<string, string> = {
  New: '#6ee7b7',
  Preparing: '#fde68a',
  Ready: '#93c5fd',
  'Picked Up': '#d1d5db',
  Available: '#6ee7b7',
  'Low Stock': '#fde68a',
  'Out of Stock': '#fca5a5',
};

const Skeleton = ({ width, height, borderRadius = 4, style }: any) => (
  <div className="skeleton" style={{ width, height, borderRadius, ...style }} />
);

export const MerchantDashboard = () => {
  const { data, loading, error, refresh } = useMerchantDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product: MerchantProduct) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.priceNum,
      category: product.category,
      stock: product.stockNum,
      image_url: product.imageUrl,
    });
    setIsModalOpen(true);
  };

  return (
    <section style={{ display: 'grid', gap: 20 }}>
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => refresh()} 
        product={selectedProduct}
      />
      
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          {loading ? (
            <>
              <Skeleton width={50} height={50} borderRadius={12} />
              <div>
                <Skeleton width={180} height={26} style={{ marginBottom: 4 }} />
                <Skeleton width={140} height={14} />
              </div>
            </>
          ) : (
            <>
              {data.logoUrl && (
                <img 
                  src={data.logoUrl} 
                  alt="Store Logo" 
                  style={{ width: 50, height: 50, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                />
              )}
              <div>
                <h2 style={{ fontSize: 26, margin: 0 }}>Merchant Dashboard</h2>
                <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>
                  {data.storeName || 'My Store'} · {data.storeEmail || 'merchant@delivo.com'}
                </p>
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: '#2b1e10', color: '#fde68a', border: '1px solid #7c4b1d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Power size={16} /> Close Store
          </button>
          <button
            className="btn"
            onClick={handleAddClick}
            style={{ background: 'linear-gradient(135deg,#fde68a,#fb923c)', color: '#0d0d0d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {error && !loading && (
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
          {error}
        </div>
      )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="card" style={{ padding: 18 }}>
                <Skeleton width={32} height={32} style={{ marginBottom: 8 }} />
                <Skeleton width={100} height={30} style={{ marginBottom: 4 }} />
                <Skeleton width={60} height={14} style={{ marginBottom: 8 }} />
                <Skeleton width={80} height={14} />
              </div>
            ))
          ) : (
            data.stats.map((stat) => {
              const Icon = {
                'revenue': DollarSign,
                'active-orders': Activity,
                'products': Package,
                'rating': Star
              }[stat.icon] || Activity;

              return (
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
                  <div style={{ color: stat.color }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{stat.value}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{stat.label}</div>
                  <div style={{ color: '#6ee7b7', fontSize: 13, fontWeight: 700, marginTop: 6 }}>{stat.change} today</div>
                </div>
              );
            })
          )}
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
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Skeleton width={40} height={40} borderRadius={10} />
                  <div>
                    <Skeleton width={120} height={16} style={{ marginBottom: 4 }} />
                    <Skeleton width={60} height={12} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Skeleton width={50} height={16} style={{ marginBottom: 4 }} />
                  <Skeleton width={70} height={14} borderRadius={999} />
                </div>
              </div>
            ))
          ) : data.products.length > 0 ? (
            data.products.map((product) => (
              <div
                key={product.id}
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
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} 
                      />
                    ) : (
                      <Package size={20} color="var(--text-dim)" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{product.orders} orders</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                  <button 
                    onClick={() => handleEditClick(product)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 8, color: 'var(--text-dim)', cursor: 'pointer' }}
                    title="Edit Product"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : !error && (
            <div style={{ padding: 20, color: 'var(--text-dim)', fontSize: 14 }}>No products found.</div>
          )}
        </div>
      </div>
    </section>
  );
};
