import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from './shared/api/api';
import { AppRouter } from './app/AppRouter';

import { NotificationProvider } from './app/shared/context/NotificationContext';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get('/users/me');
        if (response.data?.success) {
          const userData = response.data.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('user_id', userData.id || userData.userId);
        }
      } catch (err) {
        console.error('Session expired or invalid', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('user_id');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <Loader2 className="spinner" size={48} color="var(--text-primary)" />
      </div>
    );
  }

  return (
    <NotificationProvider>
      <AppRouter user={user} onUserUpdate={setUser} />
    </NotificationProvider>
  );
}

export default App
