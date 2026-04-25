import React, { useEffect, useState } from 'react';
import { Shield, Users, ShoppingBag, Package, Truck, AlertCircle, UserCheck, UserX, CheckCircle } from 'lucide-react';
import api from '../../../../shared/api/api';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalDeliveries: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  deliveryId: string | null;
  deliveryStatus: string | null;
  riderName: string | null;
}

interface Rider {
  id: string;
  name: string;
  email: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders'>('overview');
  
  // Track selected rider per delivery ID
  const [selectedRiders, setSelectedRiders] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, ordersRes, ridersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/orders'),
        api.get('/users/riders'),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setRiders(ridersRes.data.data.riders || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUser = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update user');
    }
  };

  const handleAssignRider = async (deliveryId: string) => {
    const riderId = selectedRiders[deliveryId];
    if (!riderId) {
      alert('Please select a rider first');
      return;
    }
    
    try {
      await api.post('/deliveries/assign', { deliveryId, riderId });
      alert('Rider assigned successfully!');
      // Refresh the orders so we see the new rider assigned
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to assign rider');
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Total Products', value: stats.totalProducts, icon: <Package size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Total Deliveries', value: stats.totalDeliveries, icon: <Truck size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  ] : [];

  const tabStyle = (active: boolean) => ({
    padding: '0.5rem 1.25rem', cursor: 'pointer', border: 'none',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? 'white' : 'var(--text-dim)',
    borderRadius: '0.375rem', fontWeight: 600 as const, fontSize: '0.85rem',
    transition: 'all 0.2s',
  });

  return (
    <div>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(239,68,68,0.06) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Admin Dashboard</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>Platform overview and management</p>
            </div>
          </div>

          {/* ─── Tabs ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg)', padding: '0.25rem', borderRadius: '0.5rem' }}>
            <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Overview</button>
            <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>Users</button>
            <button style={tabStyle(activeTab === 'orders')} onClick={() => setActiveTab('orders')}>Orders & Deliveries</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="var(--danger)" />
          <span style={{ color: 'var(--danger)' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-dim)' }}>Loading platform data...</p>
        </div>
      ) : activeTab === 'overview' ? (
        <>
          {/* ─── Stats Grid ────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {statCards.map(card => (
              <div key={card.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{card.label}</p>
                  <h2 style={{ margin: 0, color: card.color }}>{card.value}</h2>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Recent Users ──────────────────────────────────── */}
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recent Users
          </h4>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  {['Name', 'Email', 'Role', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>{user.name || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-dim)' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600,
                        background: user.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: user.isActive ? '#10b981' : '#ef4444',
                      }}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : activeTab === 'users' ? (
        <>
          {/* ─── Users Tab ─────────────────────────────────────── */}
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            All Users ({users.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {users.map(user => (
              <div key={user.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{user.name || 'Unnamed'}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>{user.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                    {user.role}
                  </span>
                  <button
                    onClick={() => handleToggleUser(user.id, user.isActive)}
                    style={{
                      background: 'none', border: '1px solid var(--glass-border)', borderRadius: '0.375rem',
                      padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                      color: user.isActive ? '#ef4444' : '#10b981',
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                    }}
                  >
                    {user.isActive ? <><UserX size={14} /> Disable</> : <><UserCheck size={14} /> Enable</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* ─── Orders & Deliveries Tab ───────────────────────────────── */}
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            All Orders & Deliveries ({orders.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map(order => (
              <div key={order.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h5 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Order #{order.id.slice(0, 8)}
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                        {order.status}
                      </span>
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      By: {order.customerName} ({order.customerEmail}) - <strong>${order.totalAmount.toFixed(2)}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {order.deliveryId && (
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Truck size={16} color="var(--primary)" />
                      <span style={{ fontSize: '0.85rem' }}>
                        Delivery Status: 
                        <strong style={{ marginLeft: '0.25rem', color: order.deliveryStatus === 'DELIVERED' ? '#10b981' : 'var(--text)' }}>
                          {order.deliveryStatus?.replace('_', ' ')}
                        </strong>
                      </span>
                    </div>

                    {/* Rider Assignment Logic */}
                    {order.deliveryStatus === 'PENDING' && !order.riderName ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select 
                          value={selectedRiders[order.deliveryId] || ''}
                          onChange={(e) => setSelectedRiders({...selectedRiders, [order.deliveryId!]: e.target.value})}
                          style={{
                            padding: '0.4rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', 
                            borderRadius: '0.375rem', color: 'var(--text)', outline: 'none', fontSize: '0.85rem'
                          }}
                        >
                          <option value="">-- Select a Rider --</option>
                          {riders.map(rider => (
                            <option key={rider.id} value={rider.id}>{rider.name} ({rider.email})</option>
                          ))}
                        </select>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          onClick={() => handleAssignRider(order.deliveryId!)}
                        >
                          Assign Rider
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        {order.deliveryStatus === 'DELIVERED' ? <CheckCircle size={16} color="#10b981" /> : <UserCheck size={16} color="var(--primary)" />}
                        <span>Rider: <strong>{order.riderName || 'Unknown Rider'}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                No orders found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
