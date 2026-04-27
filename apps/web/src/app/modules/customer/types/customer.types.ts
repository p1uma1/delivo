export interface CustomerActiveOrder {
  id: string;
  merchant: string;
  items: string[];
  total: string;
  eta: string;
  rider: string;
  riderPhone: string;
  status: number;
}

export interface CustomerOrderHistory {
  id: string;
  merchant: string;
  date: string;
  total: string;
  status: 'Delivered' | 'Cancelled' | 'Processing';
  icon: string;
}

export interface RecommendedItem {
  name: string;
  merchant: string;
  price: string;
  rating: string;
  icon: string;
  imageUrl?: string;
  time: string;
}

export interface CustomerDashboardData {
  name: string;
  location: string;
  activeOrder: CustomerActiveOrder;
  orderHistory: CustomerOrderHistory[];
  recommended: RecommendedItem[];
  cartCount: number;
  stats?: {
    totalOrders: number;
    totalSpent: string;
    favoriteMerchant: string;
  };
}

export interface Merchant {
  id: string;
  name: string;
  description: string;
  rating: string;
  time: string;
  icon: string;
  logo_url?: string;
  address: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  icon?: string;
  image_url?: string;
  merchant_id: string;
  merchant_name?: string;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

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

// ─── Order ───────────────────────────────────────────────────────────────────

export interface PlaceOrderPayload {
  merchantId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  dropAddress: string;
  notes?: string;
}

export interface OrderConfirmation {
  orderId: string;
  status: string;
  itemTotal: number;
  merchantId: string;
  createdAt: string;
}
