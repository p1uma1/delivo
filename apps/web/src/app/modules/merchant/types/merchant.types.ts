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
  name: string;
  price: string;
  stock: 'Available' | 'Low Stock' | 'Out of Stock';
  orders: number;
  img: string;
}

export interface MerchantDashboardData {
  storeName: string;
  storeEmail: string;
  stats: MerchantStat[];
  orders: MerchantOrder[];
  products: MerchantProduct[];
}
