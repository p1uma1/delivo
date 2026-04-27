import React, { useState } from 'react';
import { Package, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../../shared/api/api';

interface LoginProps {
  onSuccess: (user: any) => void;
  onNavigateSignup: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onNavigateSignup }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const result = response.data;

      if (!result.success) {
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
      const response = await api.post('/auth/google', {
        idToken: credentialResponse.credential,
      });

      const result = response.data;

      if (!result.success) {
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
      <p className="auth-subtitle">Welcome back to the fleet</p>

      {error && (
        <div className="auth-alert error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
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
              Sign In <ArrowRight size={18} />
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
          text="signin_with"
          width="100%"
        />
      </div>

      <div className="auth-footer">
        Don't have an account? <button type="button" onClick={onNavigateSignup} className="link-btn">Sign up</button>
      </div>
    </div>
  );
};
