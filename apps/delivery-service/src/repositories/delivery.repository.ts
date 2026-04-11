// Mock types since Prisma is removed
export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

export interface Delivery {
  id: string;
  orderId: string;
  riderId?: string;
  status: DeliveryStatus;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiderLocation {
  riderId: string;
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

// In-memory stores
const deliveries: Delivery[] = [];
const riderLocations: Map<string, RiderLocation> = new Map();

export class DeliveryRepository {
  async findById(id: string): Promise<Delivery | null> {
    const delivery = deliveries.find(d => d.id === id);
    return delivery ? { ...delivery } : null;
  }

  async findByOrderId(orderId: string): Promise<Delivery | null> {
    const delivery = deliveries.find(d => d.orderId === orderId);
    return delivery ? { ...delivery } : null;
  }

  async findByRiderId(riderId: string): Promise<Delivery[]> {
    return deliveries.filter(d => d.riderId === riderId);
  }

  async create(data: any): Promise<Delivery> {
    const newDelivery: Delivery = {
      id: Math.random().toString(36).substring(2, 11),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    deliveries.push(newDelivery);
    return newDelivery;
  }

  async update(id: string, data: any): Promise<Delivery> {
    const index = deliveries.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Delivery not found');
    
    deliveries[index] = { ...deliveries[index], ...data, updatedAt: new Date() };
    return deliveries[index];
  }

  async updateStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    const index = deliveries.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Delivery not found');
    
    deliveries[index] = { ...deliveries[index], status, updatedAt: new Date() };
    return deliveries[index];
  }

  async upsertRiderLocation(riderId: string, latitude: number, longitude: number): Promise<RiderLocation> {
    const location: RiderLocation = {
      riderId,
      latitude,
      longitude,
      updatedAt: new Date(),
    };
    riderLocations.set(riderId, location);
    return location;
  }

  async findRiderLocation(riderId: string): Promise<RiderLocation | null> {
    return riderLocations.get(riderId) || null;
  }
}

export const deliveryRepository = new DeliveryRepository();
