import React, { useEffect, useState } from 'react';
import { Truck, MapPin, CheckCircle, Clock, Package, AlertCircle } from 'lucide-react';
import api from '../../../../shared/api/api';

interface Delivery {
  id: string;
  orderId: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <Clock size={14} /> },
  ASSIGNED: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <Package size={14} /> },
  PICKED_UP: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: <Truck size={14} /> },
  IN_TRANSIT: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', icon: <Truck size={14} /> },
  DELIVERED: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle size={14} /> },
};

export const RiderDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get('/deliveries/rider/assignments');
        setDeliveries(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    try {
      await api.patch(`/deliveries/${deliveryId}/status`, { status: newStatus });
      setDeliveries(prev =>
        prev.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d)
      );
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const active = deliveries.filter(d => d.status !== 'DELIVERED');
  const completed = deliveries.filter(d => d.status === 'DELIVERED');

  return (
    <div>
      {/* ─── Header Card ───────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(99,102,241,0.1) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={24} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Rider Dashboard</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>Manage your assigned deliveries</p>
          </div>
        </div>
      </div>

      {/* ─── Stats Row ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Active</p>
          <h2 style={{ margin: 0, color: '#3b82f6' }}>{active.length}</h2>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Completed</p>
          <h2 style={{ margin: 0, color: '#10b981' }}>{completed.length}</h2>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Total</p>
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>{deliveries.length}</h2>
        </div>
      </div>

      {/* ─── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="var(--danger)" />
          <span style={{ color: 'var(--danger)' }}>{error}</span>
        </div>
      )}

      {/* ─── Loading ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-dim)' }}>Loading your assignments...</p>
        </div>
      ) : (
        <>
          {/* ─── Active Deliveries ────────────────────────────────── */}
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Deliveries
          </h4>
          {active.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {active.map(delivery => {
                const config = statusConfig[delivery.status] || statusConfig.PENDING;
                const nextStatus = delivery.status === 'ASSIGNED' ? 'PICKED_UP'
                  : delivery.status === 'PICKED_UP' ? 'IN_TRANSIT'
                  : delivery.status === 'IN_TRANSIT' ? 'DELIVERED'
                  : null;

                return (
                  <div key={delivery.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Order</span>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{delivery.orderId.slice(0, 12)}...</p>
                      </div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.25rem 0.75rem', borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: 700,
                        background: config.bg, color: config.color,
                      }}>
                        {config.icon} {delivery.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} color="#f59e0b" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{delivery.pickupAddress}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} color="#10b981" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{delivery.deliveryAddress}</span>
                      </div>
                    </div>

                    {nextStatus && (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', fontSize: '0.85rem' }}
                        onClick={() => handleStatusUpdate(delivery.id, nextStatus)}
                      >
                        {nextStatus === 'PICKED_UP' ? 'Mark as Picked Up' :
                         nextStatus === 'IN_TRANSIT' ? 'Start Transit' :
                         'Mark as Delivered'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
              <Truck size={40} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-dim)', margin: 0 }}>No active deliveries assigned to you yet.</p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>New orders will appear here when assigned by an admin.</p>
            </div>
          )}

          {/* ─── Completed Deliveries ─────────────────────────────── */}
          {completed.length > 0 && (
            <>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Completed ({completed.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {completed.map(delivery => (
                  <div key={delivery.id} className="card" style={{ padding: '1rem', opacity: 0.7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem' }}>{delivery.orderId.slice(0, 12)}...</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.2rem 0.5rem', borderRadius: '9999px',
                        fontSize: '0.7rem', fontWeight: 700,
                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                      }}>
                        <CheckCircle size={12} /> DELIVERED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
