import { useRiderDashboard } from '../hooks/useRiderDashboard';
import { useNotifications } from '../../../shared/context/NotificationContext';
import { CheckCircle, Banknote, MapPin, Star, Bell, Phone, Navigation, Activity, AlertCircle, Section } from 'lucide-react';
import { PendingOrderCard } from '../components/PendingOrderCard';
import { useState, useEffect } from 'react';

const steps = ['Order Placed', 'Confirmed', 'Preparing', 'On the Way', 'Delivered'];

const statusColor: Record<string, string> = {
  Delivered: '#6ee7b7',
  Failed: '#fca5a5',
};

const chartDays = [
  { label: 'M', height: 0 },
  { label: 'T', height: 0 },
  { label: 'W', height: 0 },
  { label: 'T', height: 0 },
  { label: 'F', height: 0 },
  { label: 'S', height: 0 },
  { label: 'S', height: 0 },
];

export const RiderDashboard = () => {
  const { data, loading, error, reload } = useRiderDashboard();
  const { unreadCount, notifications } = useNotifications();


  // Auto-reload when new rider notifications come in
  useEffect(() => {
    if (notifications.length > 0 && notifications[0].id.startsWith('rider_')) {
      reload();
    }
  }, [notifications]);

  return (
    <section style={{ display: 'grid', gap: 20 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(110,231,183,0.12), rgba(6,182,212,0.08))',
          border: '1px solid rgba(110,231,183,0.22)',
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
          <h2 style={{ margin: 0, fontSize: 26 }}>Rider Dashboard</h2>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>
            {data.name} · {data.zone}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: data.isOnline ? 'linear-gradient(135deg,#6ee7b7,#06b6d4)' : '#374151', color: data.isOnline ? '#0d0d0d' : '#cbd5e1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: data.isOnline ? '#052e16' : '#94a3b8' }} />
            {data.isOnline ? 'Online' : 'Offline'}
          </button>
          <button className="btn" style={{ background: '#1f2937', color: '#cbd5e1', border: '1px solid #374151', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} /> {unreadCount} Notifications
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
          Delivery services are partially unavailable. Showing fallback rider data. ({error})
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, opacity: loading ? 0.75 : 1 }}>
        {data.todayStats.map((stat) => {
          const Icon = {
            'deliveries': CheckCircle,
            'earnings': Banknote,
            'distance': MapPin,
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
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--glass-border)', fontWeight: 700 }}>
            Active Delivery
          </div>

          {data.currentDelivery ? (
            <div style={{ padding: 16, display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{data.currentDelivery.id}</div>
                  <h3 style={{ margin: '4px 0 0' }}>{data.currentDelivery.merchant}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#6ee7b7' }}>{data.currentDelivery.earning}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>your earning</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                {steps.map((step, index) => {
                  const isDone = index < data.currentDelivery!.status;
                  const isCurrent = index === data.currentDelivery!.status;
                  let bubbleBackground = 'transparent';
                  let bubbleColor = '#6b7280';

                  if (isDone) {
                    bubbleBackground = '#6ee7b7';
                    bubbleColor = '#0d0d0d';
                  } else if (isCurrent) {
                    bubbleBackground = '#052e16';
                    bubbleColor = '#6ee7b7';
                  }

                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: '1 1 90px', minWidth: 90 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: isDone || isCurrent ? '#6ee7b7' : '#374151',
                            background: bubbleBackground,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 12,
                            color: bubbleColor,
                          }}
                        >
                          {isDone ? '✓' : index + 1}
                        </div>
                        <div style={{ fontSize: 9, color: isDone || isCurrent ? '#6ee7b7' : '#6b7280', fontWeight: 700, textAlign: 'center' }}>
                          {step}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div style={{ flex: 1, height: 2, margin: '0 6px', background: isDone ? '#6ee7b7' : '#374151' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ background: '#1f2937', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>DELIVERY DETAILS</div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 4 }}>
                  Customer: {data.currentDelivery.customer} · {data.currentDelivery.customerPhone}
                </div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 4 }}>Pickup: {data.currentDelivery.merchantAddress}</div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 4 }}>Drop-off: {data.currentDelivery.deliveryAddress}</div>
                {data.currentDelivery.items.map((item) => (
                  <div key={item} style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 2 }}>
                    • {item}
                  </div>
                ))}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #374151', display: 'grid', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Distance</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{data.currentDelivery.distance}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>ETA</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{data.currentDelivery.eta}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Order value</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{data.currentDelivery.total}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn" style={{ flex: 1, minWidth: 120, background: '#1f2937', color: '#cbd5e1', border: '1px solid #374151', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <Phone size={16} /> Call
                </button>
                <button className="btn" style={{ flex: 1, minWidth: 120, background: '#1f2937', color: '#cbd5e1', border: '1px solid #374151', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <Navigation size={16} /> Navigate
                </button>
                <button className="btn btn-primary" style={{ flex: 1, minWidth: 120, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <CheckCircle size={16} /> Complete
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <CheckCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No active delivery at the moment.</p>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>Waiting for new assignments...</p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {/* Pending Orders Section */}
          {(data.pendingOrders?.length ?? 0) > 0 && (
            <div className="card" style={{ padding: 0, gridColumn: '1 / -1' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--glass-border)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🔔 Pending Orders ({data.pendingOrders?.length || 0})</span>
                <button
                  onClick={reload}
                  className='btn'
                  style={{ background: '#1f2937', color: '#cbd5e1', border: 'none', padding: '4px 8px', fontSize: 11, marginRight: -6 }}
                  disabled={loading}
                >
                  Refresh
                </button>
              </div>
              <div style={{ padding: 16, display: 'grid', gap: 12 }}>
                {data.pendingOrders?.map((order) => {
                  const submittedOffer = data.submittedOffers?.find((o) => o.orderId === order.id);
                  return (
                    <PendingOrderCard
                      key={order.id}
                      order={order}
                      onOfferSubmitted={reload}
                      submittedOfferFee={submittedOffer?.deliveryFee}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* No Pending Orders Message */}
          {(data.pendingOrders?.length ?? 0) === 0 && !loading && (
            <div
              className='card'
              style={{
                padding: '16px 18px',
                gridColumn: '1 / -1',
                background: 'rgba(110, 231, 183, 0.05)',
                border: '1px solid rgba(110, 231, 183, 0.2)',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 8px 0', color: '#6ee7b7', fontWeight: 600 }}>No pending orders at the moment</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)' }}>New orders will appear here when customers create delivery requests</p>
            </div>
          )}
          {data.recentDeliveries.map((delivery, index) => (
            <div key={delivery.id}>
              {/* your recent delivery item content */}
            </div>
          ))}

          <div className="card" style={{ padding: '18px 20px' }}>
            <h3 style={{ marginBottom: 14 }}>Weekly Earnings</h3>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {chartDays.map((day, index) => (
                <div
                  key={`${day.label}-${index}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${day.height}px`,
                      background:
                        day.label === 'S'
                          ? 'linear-gradient(180deg,#6ee7b7,#06b6d4)'
                          : '#1f2937',
                      borderRadius: 6,
                    }}
                  />
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    {day.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: 'var(--text-dim)' }}>
              This week:{' '}
              <span style={{ color: '#6ee7b7', fontWeight: 700 }}>
                Rs 0.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};