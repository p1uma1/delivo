import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { NavCartButton } from './components/NavCartButton';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { MerchantList } from './pages/MerchantList';
import { ProductList } from './pages/ProductList';
import { MerchantDetail } from './pages/MerchantDetail';
import { ProductDetail } from './pages/ProductDetail';
import { OrderConfirmation } from './pages/OrderConfirmation';

export const CustomerRoutes = () => {
  return (
    <CartProvider>
      {/* Globally visible within customer scope */}
      <NavCartButton />
      <CartDrawer />

      <Routes>
        <Route path="/" element={<CustomerDashboard />} />
        <Route path="/merchants" element={<MerchantList />} />
        <Route path="/merchants/:id" element={<MerchantDetail />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/orders/confirmation/:orderId" element={<OrderConfirmation />} />
      </Routes>
    </CartProvider>
  );
};
