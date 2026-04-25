// Admin Dashboard Stats
export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

// Recent Orders
export interface RecentOrder {
  id: string;
  customer: string;
  merchant: string;
  status: 'Delivered' | 'In Transit' | 'Preparing' | 'Cancelled';
  amount: string;
  time: string;
}

// User Management
export interface AdminUser {
  name: string;
  role: 'Customer' | 'Merchant' | 'Rider';
  joined: string;
  orders: number;
  status: 'Active' | 'Suspended';
}

// API Response Types
export interface AdminDashboardData {
  stats: DashboardStat[];
  recentOrders: RecentOrder[];
  recentUsers: AdminUser[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
