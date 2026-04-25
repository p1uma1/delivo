export interface RiderCurrentDelivery {
  id: string;
  customer: string;
  customerPhone: string;
  merchant: string;
  merchantAddress: string;
  deliveryAddress: string;
  items: string[];
  total: string;
  distance: string;
  eta: string;
  earning: string;
  status: number;
}

export interface RiderTodayStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface RiderRecentDelivery {
  id: string;
  customer: string;
  address: string;
  time: string;
  earning: string;
  rating: number;
}

export interface RiderDashboardData {
  name: string;
  zone: string;
  isOnline: boolean;
  currentDelivery: RiderCurrentDelivery;
  todayStats: RiderTodayStat[];
  recentDeliveries: RiderRecentDelivery[];
}
