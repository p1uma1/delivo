import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerRoutes } from './modules/customer/routes';
import { MerchantRoutes } from './modules/merchant/routes';
import { RiderRoutes } from './modules/rider/routes';
import { AdminRoutes } from './modules/admin/routes';
import { CompleteSetup } from './modules/auth/CompleteSetup';
import Auth from './modules/auth';
import { Layout } from './shared/components/Layout';

interface AppRouterProps {
  user: any;
  onUserUpdate: (user: any) => void;
}

export const AppRouter: React.FC<AppRouterProps> = ({ user, onUserUpdate }) => {
  // If not authenticated, always show Auth
  if (!user) {
    return <Auth onSuccess={onUserUpdate} />;
  }

  // If authenticated but no role, force Setup
  if (user.role === 'unassigned') {
    return <CompleteSetup onSuccess={onUserUpdate} />;
  }

  // Helper to mount role specific routes
  const renderRoleRoutes = () => {
    switch (user.role) {
      case 'customer':
        return <CustomerRoutes />;
      case 'merchant':
        return <MerchantRoutes />;
      case 'rider':
        return <RiderRoutes />;
      case 'admin':
        return <AdminRoutes />;
      default:
        return <div>Invalid Role Configuration</div>;
    }
  };

  return (
    <Layout user={user} onLogout={() => onUserUpdate(null)}>
      <Routes>
        <Route path="/*" element={renderRoleRoutes()} />
      </Routes>
    </Layout>
  );
};
