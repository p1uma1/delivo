import React, { useState } from 'react';
import { Package, Bell, LogOut, X, User as UserIcon, Check } from 'lucide-react';
import api from '../../../shared/api/api';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    onLogout();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdating(true);
    setProfileSuccess(false);
    try {
      // Update profile
      const response = await api.patch('/users/me', { name: profileName });
      // Update local storage
      const updatedUser = response.data.data.user;
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, name: updatedUser.name };
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update the user prop in memory by refreshing page or handling state up
      // Since `user` is passed down, we might need to reload or just update our local state.
      // For simplicity, we just show success and let the user refresh to see it globally
      setProfileSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setProfileUpdating(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <Package size={28} />
          <span>DELIVO</span>
        </div>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Dashboard</a>
          <button 
            onClick={() => setShowSettings(true)}
            style={{ 
              background: 'none', border: 'none', color: 'var(--text-dim)', 
              textDecoration: 'none', fontWeight: 500, cursor: 'pointer', fontSize: '1rem',
              padding: 0
            }}
          >
            Settings
          </button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', position: 'relative' }}
          >
            <Bell size={20} color="var(--text-dim)" />
            {/* Optional Notification Badge */}
            <span style={{
              position: 'absolute', top: 0, right: 0, width: '8px', height: '8px',
              background: 'var(--accent)', borderRadius: '50%'
            }}></span>
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute', top: '100%', right: '12rem', marginTop: '1rem',
              width: '300px', background: 'var(--bg)', border: '1px solid var(--glass-border)',
              borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>Notifications</h4>
                <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                <Bell size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No new notifications at this time.</p>
              </div>
            </div>
          )}

          <div className="user-bar">
            <div className="user-avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <button className="btn-signout" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1050,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', background: 'var(--bg)', position: 'relative' }}>
            <button 
              onClick={() => setShowSettings(false)} 
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserIcon size={20} color="var(--primary)" /> Account Settings
            </h3>
            
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Email Address (Read-only)
                </label>
                <input 
                  type="text" 
                  value={user?.email || ''} 
                  disabled
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', color: 'var(--text-dim)', outline: 'none', cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Role (Read-only)
                </label>
                <input 
                  type="text" 
                  value={user?.role?.toUpperCase() || ''} 
                  disabled
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', color: 'var(--text-dim)', outline: 'none', cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'var(--text)', outline: 'none' }}
                />
              </div>

              <button 
                className="btn btn-primary" 
                type="submit" 
                disabled={profileUpdating}
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {profileUpdating ? 'Saving...' : profileSuccess ? <><Check size={16} /> Saved Successfully</> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
