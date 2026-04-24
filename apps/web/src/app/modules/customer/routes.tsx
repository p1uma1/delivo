import { Routes, Route } from 'react-router-dom';
import { CustomerDashboard } from './pages/CustomerDashboard';

export const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomerDashboard />} />
      {/* Add more customer routes here later, e.g. <Route path="orders" element={<CustomerOrders />} /> */}
    </Routes>
  );
};
