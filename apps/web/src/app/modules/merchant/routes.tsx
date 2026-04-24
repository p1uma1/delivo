import { Routes, Route } from 'react-router-dom';
import { MerchantDashboard } from './pages/MerchantDashboard';

export const MerchantRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MerchantDashboard />} />
    </Routes>
  );
};
