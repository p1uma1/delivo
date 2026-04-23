import { useState, useEffect } from 'react'
import { Package, Truck, Bell, User, Plus, Search, MapPin, LogOut } from 'lucide-react'
import Auth from './Auth'

function App() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    active: 12,
    delivered: 145,
    riders: 8
  })

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  if (!user) {
    return <Auth onSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <Package size={28} />
          <span>DELIVO</span>
        </div>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Dashboard</a>
          <a href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 500 }}>Orders</a>
          <a href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 500 }}>Riders</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Bell size={20} color="var(--text-dim)" />
          <div className="user-bar">
            <div className="user-avatar">
              {user.name?.[0].toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user.role}</span>
            </div>
            <button className="btn-signout" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>Track your deliveries in real-time.</h1>
          <p>The ultimate last-mile solution for small businesses. Scalable, secure, and lightning fast.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary">
              <Plus size={18} /> New Delivery
            </button>
            <button className="btn" style={{ background: 'var(--card-bg)', color: 'white' }}>
              <Search size={18} /> Track ID
            </button>
          </div>
        </section>

        <div className="dashboard-grid">
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--primary)" /> Active Orders
            </h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.active}</div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>4 orders pending assignment</p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="var(--accent)" /> Deliveries Today
            </h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.delivered}</div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>+12% from yesterday</p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="#f59e0b" /> Active Riders
            </h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.riders}</div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>All currently in transit</p>
          </div>
        </div>

        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Recent Activity</h2>
          <div className="card" style={{ padding: 0 }}>
            {[
              { id: 'ORD-8273', status: 'delivered', addr: '123 Tech Lane, CA', time: '2 mins ago' },
              { id: 'ORD-9122', status: 'assigned', addr: '456 Innovation Blvd, NY', time: '15 mins ago' },
              { id: 'ORD-1029', status: 'pending', addr: '789 Startup Rd, TX', time: '45 mins ago' }
            ].map((order, i) => (
              <div key={order.id} style={{ 
                padding: '1rem 1.5rem', 
                borderBottom: i === 2 ? 'none' : '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                    <Package size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{order.id}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} /> {order.addr}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>{order.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
