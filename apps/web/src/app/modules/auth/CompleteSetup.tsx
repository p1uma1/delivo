import React, { useState } from 'react';
import { Package, User as UserIcon, Truck, Building2, ArrowRight, AlertCircle } from 'lucide-react';
import './auth.css';

import api from '../../../shared/api/api';

interface CompleteSetupProps {
  onSuccess: (updatedUser: any) => void;
}

export const CompleteSetup: React.FC<CompleteSetupProps> = ({ onSuccess }) => {
  const [role, setRole] = useState<'customer' | 'merchant' | 'rider'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/users/me/complete-setup', { role });

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to complete setup');
      }

      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      onSuccess(result.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-logo">
          <Package size={32} />
          <span>DELIVO</span>
        </div>
        <p className="auth-subtitle">Complete your account setup by choosing a role</p>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label style={{ fontSize: '1rem', marginBottom: '1rem' }}>I want to join as a...</label>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              
              <button 
                type="button" 
                onClick={() => setRole('customer')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  padding: '1.5rem',
                  background: role === 'customer' ? '#ffffff' : '#000000',
                  color: role === 'customer' ? '#000000' : '#ffffff',
                  border: `2px solid ${role === 'customer' ? '#ffffff' : '#333333'}`,
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: role === 'customer' ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: role === 'customer' ? '0 0 20px rgba(255,255,255,0.2)' : 'none',
                }}
              >
                <UserIcon size={24} />
                <span style={{ fontWeight: 600 }}>Customer</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Order & track</span>
              </button>

              <button 
                type="button" 
                onClick={() => setRole('merchant')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  padding: '1.5rem',
                  background: role === 'merchant' ? '#ffffff' : '#000000',
                  color: role === 'merchant' ? '#000000' : '#ffffff',
                  border: `2px solid ${role === 'merchant' ? '#ffffff' : '#333333'}`,
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: role === 'merchant' ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: role === 'merchant' ? '0 0 20px rgba(255,255,255,0.2)' : 'none',
                }}
              >
                <Building2 size={24} />
                <span style={{ fontWeight: 600 }}>Merchant</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Sell products</span>
              </button>

              <button 
                type="button" 
                onClick={() => setRole('rider')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  padding: '1.5rem',
                  background: role === 'rider' ? '#ffffff' : '#000000',
                  color: role === 'rider' ? '#000000' : '#ffffff',
                  border: `2px solid ${role === 'rider' ? '#ffffff' : '#333333'}`,
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: role === 'rider' ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: role === 'rider' ? '0 0 20px rgba(255,255,255,0.2)' : 'none',
                }}
              >
                <Truck size={24} />
                <span style={{ fontWeight: 600 }}>Rider</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Deliver orders</span>
              </button>

            </div>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : (
              <span className="btn-content">
                Complete Setup <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
