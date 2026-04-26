import React, { useState } from 'react';
import { Package, Bell, LogOut } from 'lucide-react';
import api from '../../../shared/api/api';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Bell size={20} color="var(--text-dim)" />

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-avatar"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.75rem)',
                  right: 0,
                  minWidth: '220px',
                  background: 'var(--surface)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  padding: '0.9rem',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                  zIndex: 100,
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>
                    {user?.name || 'User'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dim)',
                      textTransform: 'capitalize',
                      marginTop: '0.2rem',
                    }}
                  >
                    {user?.role || 'guest'}
                  </div>
                </div>

                <button
                  className="btn-signout"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
};