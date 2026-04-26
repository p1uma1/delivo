// Mock types since Prisma is removed
export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  merchantId: string;
  merchantName?: string;
  status: OrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  // Delivery info (aggregated)
  eta?: string;
  riderName?: string;
  riderPhone?: string;
}

// In-memory store
const orders: Order[] = [];

export class OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const order = orders.find(o => o.id === id);
    if (!order) return null;
    return { ...order };
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return orders.filter(o => o.customerId === customerId);
  }

  async create(data: any): Promise<Order> {
    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 11),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
      items: (data.items?.create || []).map((item: any) => ({
        id: Math.random().toString(36).substring(2, 11),
        ...item
      }))
    };
    orders.push(newOrder);
    return newOrder;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    
    orders[index] = { ...orders[index], status, updatedAt: new Date() };
    return orders[index];
  }
}

export const orderRepository = new OrderRepository();
