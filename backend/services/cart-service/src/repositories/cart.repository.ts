export interface CartItem {
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  unitPrice: number;
  quantity: number;
  icon?: string;
}

export interface CartState {
  items: CartItem[];
  merchantId: string | null;
  merchantName: string | null;
}

// In-memory store: customerId -> CartState
const carts = new Map<string, CartState>();

export class CartRepository {
  getCart(customerId: string): CartState {
    if (!carts.has(customerId)) {
      carts.set(customerId, { items: [], merchantId: null, merchantName: null });
    }
    return carts.get(customerId)!;
  }

  addItem(customerId: string, item: Omit<CartItem, 'quantity'> & { quantity?: number }): CartItem {
    const cart = this.getCart(customerId);
    
    // Check if adding from a different merchant
    if (cart.merchantId && cart.merchantId !== item.merchantId && cart.items.length > 0) {
      throw new Error('Cannot add items from a different merchant. Please clear your cart first.');
    }

    const quantity = item.quantity || 1;
    const existingItem = cart.items.find(i => i.productId === item.productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ ...item, quantity });
    }

    cart.merchantId = item.merchantId;
    cart.merchantName = item.merchantName;

    return existingItem || cart.items[cart.items.length - 1];
  }

  updateItemQuantity(customerId: string, productId: string, quantity: number): void {
    const cart = this.getCart(customerId);
    const item = cart.items.find(i => i.productId === productId);

    if (!item) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      this.removeItem(customerId, productId);
      return;
    }

    item.quantity = quantity;
  }

  removeItem(customerId: string, productId: string): void {
    const cart = this.getCart(customerId);
    cart.items = cart.items.filter(i => i.productId !== productId);

    if (cart.items.length === 0) {
      cart.merchantId = null;
      cart.merchantName = null;
    }
  }

  clearCart(customerId: string): void {
    carts.set(customerId, { items: [], merchantId: null, merchantName: null });
  }
}

export const cartRepository = new CartRepository();
