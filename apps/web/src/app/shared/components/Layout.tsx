import React, { useState } from 'react';
import { Package, Bell, LogOut } from 'lucide-react';
import api from '../../../shared/api/api';
import { useNotifications } from '../context/NotificationContext';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

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

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <Package size={28} />
          <span>DELIVO</span>
        </div>

        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>
            Dashboard
          </a>
          <a href="/settings" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 500 }}>
            Settings
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-dim)',
                transition: 'color 0.2s ease'
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 800,
                  minWidth: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  border: '2px solid var(--bg)',
                  padding: '0 2px'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                  onClick={() => setShowNotifications(false)} 
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.75rem)',
                    right: 0,
                    width: '320px',
                    background: 'var(--surface)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '0.5rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                    zIndex: 100,
                    backdropFilter: 'blur(20px)',
                    maxHeight: '480px',
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearAll}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`dropdown-item ${n.read ? 'dim' : ''}`}
                        style={{ 
                          flexDirection: 'column', 
                          alignItems: 'flex-start', 
                          gap: '0.2rem',
                          padding: '0.75rem 1rem',
                          opacity: n.read ? 0.6 : 1
                        }}
                      >
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>{n.title}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-avatar"
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>

            {showUserMenu && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.75rem)',
                    right: 0,
                    minWidth: '240px',
                    background: 'var(--surface)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '0.5rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                    zIndex: 100,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>
                      {user?.name || 'User'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-dim)',
                        textTransform: 'uppercase',
                        marginTop: '0.25rem',
                        letterSpacing: '0.5px',
                        fontWeight: 600,
                      }}
                    >
                      {user?.role || 'guest'}
                    </div>
                  </div>

                  <a href="/profile" className="dropdown-item">
                    <Package size={16} />
                    My Profile
                  </a>
                  
                  <a href="/orders" className="dropdown-item">
                    <Bell size={16} />
                    Order History
                  </a>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.5rem 0' }} />

                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
};