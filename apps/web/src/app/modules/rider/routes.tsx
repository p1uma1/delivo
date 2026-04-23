import { Routes, Route } from 'react-router-dom';
import { RiderDashboard } from './pages/RiderDashboard';

export const RiderRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RiderDashboard />} />
    </Routes>
  );
};
