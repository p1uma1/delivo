import React from 'react';
import { Package, Bell, LogOut } from 'lucide-react';
import api from '../../../shared/api/api';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
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
          <a href="#" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Dashboard</a>
          <a href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 500 }}>Settings</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Bell size={20} color="var(--text-dim)" />
          <div className="user-bar">
            <div className="user-avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <button className="btn-signout" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
};
