import { query } from '../lib/db';
import { NotFoundError, ValidationError } from '@delivo/shared';

export interface DeliveryOffer {
  id: string;
  orderId: string;
  riderId: string;
  deliveryFee: number;
  estimatedMinutes?: number;
  status: 'PENDING' | 'SELECTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export class OfferRepository {
  async create(data: {
    orderId: string;
    riderId: string;
    deliveryFee: number;
    estimatedMinutes?: number;
  }): Promise<DeliveryOffer> {
    const offerId = `OFF-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    try {
      const res = await query(
        `INSERT INTO delivery_offers (id, order_id, rider_id, delivery_fee, estimated_minutes, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW(), NOW())
         RETURNING id, order_id as "orderId", rider_id as "riderId", delivery_fee as "deliveryFee", 
                   estimated_minutes as "estimatedMinutes", status, created_at as "createdAt", updated_at as "updatedAt"`,
        [offerId, data.orderId, data.riderId, data.deliveryFee, data.estimatedMinutes || null]
      );
      
      return res.rows[0];
    } catch (err: any) {
      if (err.code === '23505') {
        // Unique constraint violation - rider already submitted an offer for this order
        throw new ValidationError('You have already submitted an offer for this order');
      }
      throw err;
    }
  }

  async findByOrderId(orderId: string): Promise<DeliveryOffer[]> {
    const res = await query(
      `SELECT id, order_id as "orderId", rider_id as "riderId", delivery_fee as "deliveryFee", 
              estimated_minutes as "estimatedMinutes", status, created_at as "createdAt", updated_at as "updatedAt"
       FROM delivery_offers 
       WHERE order_id = $1 
       ORDER BY created_at DESC`,
      [orderId]
    );
    
    return res.rows;
  }

  async findById(offerId: string): Promise<DeliveryOffer | null> {
    const res = await query(
      `SELECT id, order_id as "orderId", rider_id as "riderId", delivery_fee as "deliveryFee", 
              estimated_minutes as "estimatedMinutes", status, created_at as "createdAt", updated_at as "updatedAt"
       FROM delivery_offers 
       WHERE id = $1`,
      [offerId]
    );
    
    return res.rows[0] || null;
  }

  async findByRiderId(riderId: string): Promise<DeliveryOffer[]> {
    const res = await query(
      `SELECT id, order_id as "orderId", rider_id as "riderId", delivery_fee as "deliveryFee", 
              estimated_minutes as "estimatedMinutes", status, created_at as "createdAt", updated_at as "updatedAt"
       FROM delivery_offers 
       WHERE rider_id = $1 AND status = 'PENDING'
       ORDER BY created_at DESC`,
      [riderId]
    );
    
    return res.rows;
  }

  async updateStatus(offerId: string, status: 'SELECTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'): Promise<DeliveryOffer> {
    const res = await query(
      `UPDATE delivery_offers 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, order_id as "orderId", rider_id as "riderId", delivery_fee as "deliveryFee", 
                 estimated_minutes as "estimatedMinutes", status, created_at as "createdAt", updated_at as "updatedAt"`,
      [status, offerId]
    );
    
    if (!res.rows[0]) {
      throw new NotFoundError('Offer not found');
    }
    
    return res.rows[0];
  }

  async rejectOtherOffers(orderId: string, selectedOfferId: string): Promise<void> {
    await query(
      `UPDATE delivery_offers 
       SET status = 'REJECTED', updated_at = NOW()
       WHERE order_id = $1 AND id != $2 AND status = 'PENDING'`,
      [orderId, selectedOfferId]
    );
  }

  async findOfferByOrderAndRider(orderId: string, riderId: string): Promise<DeliveryOffer | null> {
    const res = await query(
      `SELECT id, order_id as "orderId", rider_id as "riderId", delivery_fee as "deliveryFee", 
              estimated_minutes as "estimatedMinutes", status, created_at as "createdAt", updated_at as "updatedAt"
       FROM delivery_offers 
       WHERE order_id = $1 AND rider_id = $2`,
      [orderId, riderId]
    );
    
    return res.rows[0] || null;
  }
}

export const offerRepository = new OfferRepository();
