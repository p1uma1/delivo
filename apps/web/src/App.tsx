import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from './shared/api/api';
import { AppRouter } from './app/AppRouter';

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
          setUser(response.data.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
      } catch (err) {
        console.error('Session expired or invalid', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
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

  return <AppRouter user={user} onUserUpdate={setUser} />;
}

export default App
