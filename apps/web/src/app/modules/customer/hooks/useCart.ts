import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../shared/api/api';
import { useCartContext } from '../context/CartContext';
import type { PlaceOrderPayload } from '../types/customer.types';

export const useCart = () => {
  const cart = useCartContext();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const placeOrder = useCallback(
    async (dropAddress: string, notes?: string) => {
      if (!cart.state.merchantId || cart.state.items.length === 0) return;

      setPlacing(true);
      setPlaceError(null);

      const payload: PlaceOrderPayload = {
        merchantId: cart.state.merchantId,
        items: cart.state.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        dropAddress,
        notes,
      };

      try {
        const response = await api.post('/orders', payload);
        const order = response.data?.data || response.data;

        // Clear cart first
        await cart.clearCart();
        cart.closeDrawer();

        // Navigate to confirmation
        navigate(`/orders/confirmation/${order.id || order.orderId}`, {
          state: {
            orderId: order.id || order.orderId,
            itemTotal: cart.cartTotal,
            merchantName: cart.state.merchantName,
            itemCount: cart.itemCount,
          },
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to place order. Please try again.';
        setPlaceError(message);
      } finally {
        setPlacing(false);
      }
    },
    [cart, navigate]
  );

  return {
    ...cart,
    placeOrder,
    placing,
    placeError,
    clearPlaceError: () => setPlaceError(null),
  };
};
