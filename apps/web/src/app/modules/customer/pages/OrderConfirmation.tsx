import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Check, Store, Bike, CheckCircle, Package, Banknote, Home, ShoppingCart } from 'lucide-react';

interface LocationState {
  orderId?: string;
  itemTotal?: number;
  merchantName?: string;
  itemCount?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const Row: React.FC<{
  label: string;
  value: string;
  accent?: boolean;
  badge?: boolean;
}> = ({ label, value, accent, badge }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
    <span style={{ fontSize: 13, color: 'var(--text-dim, #6b7280)' }}>{label}</span>
    {badge ? (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          padding: '3px 12px',
          borderRadius: 999,
          background: 'rgba(165,180,252,0.12)',
          color: '#a5b4fc',
        }}
      >
        {value}
      </span>
    ) : (
      <span style={{ fontSize: 14, fontWeight: 700, color: accent ? '#a5b4fc' : '#f1f5f9' }}>
        {value}
      </span>
    )}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, []);

  const displayId = orderId || state.orderId || '—';
  const itemTotal = state.itemTotal ?? 0;
  const merchantName = state.merchantName;
  const itemCount = state.itemCount ?? 0;

  return (
    <div
      style={{
        maxWidth: 520,
        margin: '0 auto',
        display: 'grid',
        gap: 28,
        padding: '32px 16px',
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Success banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(165,180,252,0.12), rgba(110,231,183,0.08))',
          border: '1px solid rgba(110,231,183,0.25)',
          borderRadius: 20,
          padding: '48px 32px',
          textAlign: 'center',
          display: 'grid',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6ee7b7, #34d399)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 36,
            margin: '0 auto',
            boxShadow: '0 0 40px rgba(110,231,183,0.3)',
            transform: animate ? 'scale(1)' : 'scale(0.5)',
            transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s',
          }}
        >
          <Check size={36} color="#fff" strokeWidth={3} />
        </div>

        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, color: '#f1f5f9' }}>Order Placed!</h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-dim, #6b7280)', lineHeight: 1.6 }}>
            Your order has been received. Riders nearby will start sending you
            delivery offers shortly.
          </p>
        </div>
      </div>

      {/* Order details */}
      <div
        style={{
          background: 'var(--card-bg, #111827)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(165,180,252,0.05)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim, #6b7280)', letterSpacing: '0.8px' }}>
            ORDER DETAILS
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gap: 16 }}>
          <Row label="Order ID" value={`#${displayId.slice(0, 8).toUpperCase()}`} accent />
          {merchantName && <Row label="Merchant" value={merchantName} />}
          {itemCount > 0 && (
            <Row label="Items" value={`${itemCount} item${itemCount > 1 ? 's' : ''}`} />
          )}
          {itemTotal > 0 && (
            <Row label="Item Total" value={`LKR ${itemTotal.toFixed(2)}`} accent />
          )}
          <Row label="Payment" value="Cash on Delivery" />
          <Row label="Status" value="Waiting for rider offers" badge />
        </div>
      </div>

      {/* What happens next */}
      <div
        style={{
          background: 'var(--card-bg, #111827)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'grid',
          gap: 14,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: '#a5b4fc' }}>What happens next?</div>
        {[
          { Icon: Store, text: 'Merchant confirms your order' },
          { Icon: Bike, text: 'Nearby riders send you delivery fee offers' },
          { Icon: CheckCircle, text: 'You select your preferred rider' },
          { Icon: Package, text: 'Rider picks up and delivers your order' },
          { Icon: Banknote, text: 'Pay cash on delivery' },
        ].map(({ Icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: '#1f2937',
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                color: '#a5b4fc',
                flexShrink: 0,
              }}
            >
              <Icon size={18} />
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1' }}>{text}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          className="btn"
          style={{
            flex: 1,
            minWidth: 140,
            background: '#1f2937',
            color: '#cbd5e1',
            border: '1px solid #374151',
            padding: '12px 0',
          }}
          onClick={() => navigate('/')}
        >
          <Home size={16} /> Back to Home
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 1, minWidth: 140, padding: '12px 0', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
          onClick={() => navigate('/products')}
        >
          <ShoppingCart size={16} /> Shop More
        </button>
      </div>
    </div>
  );
};
