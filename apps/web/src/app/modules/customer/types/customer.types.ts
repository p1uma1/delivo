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
  time: string;
}

export interface CustomerDashboardData {
  name: string;
  location: string;
  activeOrder: CustomerActiveOrder;
  orderHistory: CustomerOrderHistory[];
  recommended: RecommendedItem[];
  cartCount: number;
}

export interface Merchant {
  id: string;
  name: string;
  description: string;
  rating: string;
  time: string;
  icon: string;
  address: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  icon: string;
  merchantId: string;
  merchantName?: string;
}
