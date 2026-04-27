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

export interface PendingOrder {
  id: string;
  customerId: string;
  merchantName: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemTotal: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  createdAt: string;
}

export interface DeliveryOffer {
  id: string;
  orderId: string;
  riderId: string;
  deliveryFee: number;
  estimatedMinutes?: number;
  status: | 'pending'
  | 'waiting_for_rider_offers'
  | 'rider_selected'
  | 'accepted_by_merchant'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';
  createdAt: string;
}

export interface RiderDashboardData {
  name: string;
  zone: string;
  isOnline: boolean;
  currentDelivery: RiderCurrentDelivery | null;
  todayStats: RiderTodayStat[];
  recentDeliveries: RiderRecentDelivery[];
  pendingOrders?: PendingOrder[];
  submittedOffers?: DeliveryOffer[];
}
