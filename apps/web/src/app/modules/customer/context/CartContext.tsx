import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
} from 'react';
import type { CartItem, CartState } from '../types/customer.types';
import { cartService } from '../services/cart.service';

// ─── Actions ─────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QTY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD'; payload: CartState };

const STORAGE_KEY = 'delivo_cart';

const initialState: CartState = {
  items: [],
  merchantId: null,
  merchantName: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD': {
      const payload = action.payload;
      // Sanitize corrupted cart where items exist but merchantId is missing
      if (payload.items && payload.items.length > 0 && !payload.merchantId) {
        const validItem = payload.items.find(i => i.merchantId);
        if (validItem) {
          return { ...payload, merchantId: validItem.merchantId, merchantName: validItem.merchantName };
        }
        return initialState;
      }
      return payload;
    }

    case 'ADD_ITEM': {
      const item = action.payload;
      const existing = state.items.find((i) => i.productId === item.productId);
      const updatedItems = existing
        ? state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...state.items, { ...item, quantity: 1 }];
      return {
        items: updatedItems,
        merchantId: item.merchantId,
        merchantName: item.merchantName,
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.payload.productId),
        ...(state.items.length === 1
          ? { merchantId: null, merchantName: null }
          : {}),
      };

    case 'UPDATE_QTY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        const remaining = state.items.filter((i) => i.productId !== productId);
        return {
          items: remaining,
          merchantId: remaining.length ? state.merchantId : null,
          merchantName: remaining.length ? state.merchantName : null,
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface PendingAdd {
  item: CartItem;
}

interface CartContextValue {
  state: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  // Cross-merchant warning
  pendingAdd: PendingAdd | null;
  confirmReplace: () => void;
  cancelReplace: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync with server on mount
  useEffect(() => {
    const syncCart = async () => {
      try {
        setLoading(true);
        // Try to fetch from server
        const serverCart = await cartService.getCart();
        if (serverCart) {
          dispatch({ type: 'LOAD', payload: serverCart });
        }
      } catch (err) {
        console.warn('Failed to fetch cart from server, using local fallback', err);
        // Fallback to localStorage
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved: CartState = JSON.parse(raw);
          if (saved.items && Array.isArray(saved.items)) {
            dispatch({ type: 'LOAD', payload: saved });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    syncCart();
  }, []);

  // Persist whenever cart changes (local backup)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addToCart = useCallback(
    async (item: Omit<CartItem, 'quantity'>) => {
      // Different merchant in cart → ask first
      console.log(`[CartContext] Adding item from merchant ${item.merchantId}. Current: ${state.merchantId}. Items: ${state.items.length}`);
      
      if (
        state.merchantId &&
        String(state.merchantId) !== String(item.merchantId) &&
        state.items.length > 0
      ) {
        console.warn(`[CartContext] Merchant mismatch detected! Current: ${state.merchantId}, New: ${item.merchantId}`);
        setPendingAdd({ item: { ...item, quantity: 1 } });
        return;
      }

      // Optimistic update
      dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } });

      try {
        await cartService.addItem(item);
      } catch (err) {
        console.error('Failed to sync item addition with server', err);
        // In a real app, we might want to rollback or show a toast
      }
    },
    [state.merchantId, state.items.length]
  );

  const confirmReplace = useCallback(async () => {
    if (!pendingAdd) return;

    // Optimistic update
    dispatch({ type: 'CLEAR_CART' });
    dispatch({ type: 'ADD_ITEM', payload: pendingAdd.item });
    setPendingAdd(null);

    try {
      await cartService.clearCart();
      await cartService.addItem(pendingAdd.item);
    } catch (err) {
      console.error('Failed to sync cart replacement with server', err);
    }
  }, [pendingAdd]);

  const cancelReplace = useCallback(() => {
    setPendingAdd(null);
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    // Optimistic update
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });

    try {
      await cartService.removeItem(productId);
    } catch (err) {
      console.error('Failed to sync item removal with server', err);
    }
  }, []);

  const updateQty = useCallback(async (productId: string, quantity: number) => {
    // Optimistic update
    dispatch({ type: 'UPDATE_QTY', payload: { productId, quantity } });

    try {
      await cartService.updateItemQuantity(productId, quantity);
    } catch (err) {
      console.error('Failed to sync quantity update with server', err);
    }
  }, []);

  const clearCart = useCallback(async () => {
    // Optimistic update
    dispatch({ type: 'CLEAR_CART' });

    try {
      await cartService.clearCart();
    } catch (err) {
      console.error('Failed to sync cart clear with server', err);
    }
  }, []);

  const cartTotal = state.items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartTotal,
        itemCount,
        isDrawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        pendingAdd,
        confirmReplace,
        cancelReplace,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCartContext = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
};
