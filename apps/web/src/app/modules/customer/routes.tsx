import { Routes, Route } from 'react-router-dom';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { MerchantList } from './pages/MerchantList';
import { ProductList } from './pages/ProductList';
import { MerchantDetail } from './pages/MerchantDetail';
import { ProductDetail } from './pages/ProductDetail';

export const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomerDashboard />} />
      <Route path="/merchants" element={<MerchantList />} />
      <Route path="/merchants/:id" element={<MerchantDetail />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      {/* Add more customer routes here later, e.g. <Route path="orders" element={<CustomerOrders />} /> */}
    </Routes>
  );
};
