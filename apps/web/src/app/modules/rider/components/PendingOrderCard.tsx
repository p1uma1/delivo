import { useState } from 'react';
import { MapPin, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { PendingOrder } from '../types/rider.types';
import api from '../../../../shared/api/api';

interface PendingOrderCardProps {
  order: PendingOrder;
  onOfferSubmitted: () => void;
  submittedOfferFee?: number;
}

export const PendingOrderCard = ({ order, onOfferSubmitted, submittedOfferFee }: PendingOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<string>('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>('');

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!deliveryFee || Number(deliveryFee) <= 0) {
      setError('Please enter a valid delivery fee');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/deliveries/offers', {
        orderId: order.id,
        deliveryFee: Number(deliveryFee),
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      });

      // Reset form
      setDeliveryFee('');
      setEstimatedMinutes('');
      setIsExpanded(false);
      onOfferSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSubmittedOffer = submittedOfferFee !== undefined;

  return (
    <div
      style={{
        background: 'rgba(6, 182, 212, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => !hasSubmittedOffer && setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 600 }}>
            {order.merchantName || 'Unknown Merchant'}
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)' }}>Order ID: {order.id}</p>
        </div>
        {hasSubmittedOffer && (
          <div
            style={{
              background: 'rgba(110, 231, 183, 0.2)',
              color: '#6ee7b7',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Offer Submitted
          </div>
        )}
      </div>

      {/* Key Info */}
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <MapPin size={14} color='#06b6d4' />
          <div>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 11 }}>From</p>
            <p style={{ margin: 0 }}>{order.pickupAddress}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <MapPin size={14} color='#6ee7b7' />
          <div>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 11 }}>To</p>
            <p style={{ margin: 0 }}>{order.deliveryAddress}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 11 }}>Order Total</p>
            <p style={{ margin: 0, fontWeight: 600 }}>Rs {order.itemTotal.toFixed(2)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 11 }}>Items</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{order.items.length} items</p>
          </div>
        </div>
      </div>

      {/* Items List */}
      {isExpanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(6, 182, 212, 0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>Items:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                • {item.productName} × {item.quantity} @ Rs {item.unitPrice.toFixed(2)} each
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offer Form */}
      {isExpanded && !hasSubmittedOffer && (
        <form onSubmit={handleSubmitOffer} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(6, 182, 212, 0.1)' }}>
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '8px 10px',
                borderRadius: 6,
                marginBottom: 10,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <DollarSign size={14} /> Delivery Fee (Rs)
              </label>
              <input
                type='number'
                step='0.01'
                min='0.01'
                placeholder='Enter your delivery fee'
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className='input'
                style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Clock size={14} /> Estimated Time (minutes)
              </label>
              <input
                type='number'
                min='1'
                placeholder='e.g. 25'
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className='input'
                style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                disabled={isSubmitting}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type='button'
                onClick={() => setIsExpanded(false)}
                disabled={isSubmitting}
                className='btn'
                style={{ background: '#374151', color: '#cbd5e1' }}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className='btn'
                style={{
                  background: isSubmitting ? '#4b5563' : 'linear-gradient(135deg,#6ee7b7,#06b6d4)',
                  color: isSubmitting ? '#9ca3af' : '#0d0d0d',
                  fontWeight: 700,
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Offer'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Submitted Offer Info */}
      {hasSubmittedOffer && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(6, 182, 212, 0.1)', background: 'rgba(110, 231, 183, 0.08)', padding: 10, borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#6ee7b7', fontWeight: 600 }}>Your Offer: Rs {submittedOfferFee.toFixed(2)}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text-dim)' }}>Waiting for customer selection...</p>
        </div>
      )}
    </div>
  );
};
