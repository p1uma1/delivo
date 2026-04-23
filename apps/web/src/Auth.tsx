import React, { useState } from 'react';
import { Package, Mail, Lock, User as UserIcon, Shield, Chrome, ArrowRight, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import './auth.css';

interface AuthProps {
  onSuccess: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'rider'>('customer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { email, password, name, role };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Authentication failed');
      }

      localStorage.setItem('accessToken', result.data.accessToken);
      onSuccess(result.data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken: credentialResponse.credential,
          role: role
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Google authentication failed');
      }

      localStorage.setItem('accessToken', result.data.accessToken);
      onSuccess(result.data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Package size={32} />
          <span>DELIVO</span>
        </div>
        <p className="auth-subtitle">
          {isLogin ? 'Welcome back to the fleet' : 'Join the next-gen delivery network'}
        </p>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="auth-alert error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  placeholder="John Doe" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="name@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Join As</label>
              <div className="role-group">
                <button 
                  type="button" 
                  className={`role-btn ${role === 'customer' ? 'selected' : ''}`}
                  onClick={() => setRole('customer')}
                >
                  <UserIcon size={16} /> Customer
                </button>
                <button 
                  type="button" 
                  className={`role-btn ${role === 'rider' ? 'selected' : ''}`}
                  onClick={() => setRole('rider')}
                >
                  <Shield size={16} /> Rider
                </button>
              </div>
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            theme="filled_black"
            shape="pill"
            text="continue_with"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
