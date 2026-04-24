export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const payments: Payment[] = [];

export class PaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    const payment = payments.find(p => p.id === id);
    if (!payment) return null;
    return { ...payment };
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const payment = payments.find(p => p.orderId === orderId);
    if (!payment) return null;
    return { ...payment };
  }

  async create(data: Partial<Payment>): Promise<Payment> {
    const newPayment: Payment = {
      id: Math.random().toString(36).substring(2, 11),
      orderId: data.orderId!,
      amount: data.amount!,
      currency: data.currency || 'usd',
      status: data.status || 'PENDING',
      paymentMethod: data.paymentMethod || 'card',
      stripePaymentIntentId: data.stripePaymentIntentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    payments.push(newPayment);
    return { ...newPayment };
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const index = payments.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Payment not found');
    
    payments[index] = { ...payments[index], status, updatedAt: new Date() };
    return { ...payments[index] };
  }
}

export const paymentRepository = new PaymentRepository();
