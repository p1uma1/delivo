import React, { useState } from 'react';
import { Package, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface SignupProps {
  onSuccess: (user: any) => void;
  onNavigateLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSuccess, onNavigateLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Note: Role is not provided here; the backend will default it to 'unassigned'
    const payload = { email, password, name, role: 'unassigned' };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Authentication failed');
      }

      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
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
          role: 'unassigned'
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Google authentication failed');
      }

      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      onSuccess(result.data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <Package size={32} />
        <span>DELIVO</span>
      </div>
      <p className="auth-subtitle">Join the next-gen delivery network</p>

      {error && (
        <div className="auth-alert error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <div className="input-wrapper">
            <UserIcon size={18} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              className="form-input"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? <span className="spinner"></span> : (
            <span className="btn-content">
              Create Account <ArrowRight size={18} />
            </span>
          )}
        </button>
      </form>

      <div className="auth-divider">or continue with</div>

      <div className="google-login-container">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          theme="filled_black"
          shape="pill"
          text="signup_with"
          width="100%"
        />
      </div>

      <div className="auth-footer">
        Already have an account? <button type="button" onClick={onNavigateLogin} className="link-btn">Sign in</button>
      </div>
    </div>
  );
};
