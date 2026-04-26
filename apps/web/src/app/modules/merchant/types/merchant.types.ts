export interface MerchantStat {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

export interface MerchantOrder {
  id: string;
  customer: string;
  items: string;
  status: 'New' | 'Preparing' | 'Ready' | 'Picked Up';
  time: string;
  total: string;
}

export interface MerchantProduct {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: string;
  priceNum: number;
  stock: 'Available' | 'Low Stock' | 'Out of Stock';
  stockNum: number;
  orders: number;
  img: string;
  imageUrl?: string;
}

export interface MerchantDashboardData {
  storeName: string;
  storeEmail: string;
  logoUrl?: string;
  stats: MerchantStat[];
  orders: MerchantOrder[];
  products: MerchantProduct[];
}
