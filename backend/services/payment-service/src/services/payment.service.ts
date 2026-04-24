import Stripe from 'stripe';
import { paymentRepository } from '../repositories/payment.repository';
import { publishEvent } from '@delivo/shared';
import { AppError } from '@delivo/shared';

// Initialize stripe with a dummy key or from env
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-04-10',
});

export class PaymentService {
  async processPayment(orderId: string, amount: number, paymentMethod: string) {
    // Check if payment already exists
    const existingPayment = await paymentRepository.findByOrderId(orderId);
    if (existingPayment && existingPayment.status === 'COMPLETED') {
      throw new AppError('Payment already completed for this order', 400);
    }

    // Attempt to create a Stripe PaymentIntent
    let paymentIntent;
    try {
      // In a real scenario, this would use an actual API key
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses smallest currency unit (cents)
        currency: 'usd',
        payment_method_types: [paymentMethod === 'card' ? 'card' : 'alipay'],
        description: `Payment for order ${orderId}`,
      });
    } catch (error: any) {
      // Fallback for simulation if real key is not provided
      if (error.message.includes('Invalid API Key') || error.message.includes('dummy')) {
        console.warn('Using simulated Stripe payment intent since no valid key is provided.');
        paymentIntent = { id: `pi_simulated_${Date.now()}`, status: 'succeeded' };
      } else {
        throw new AppError(`Stripe error: ${error.message}`, 400);
      }
    }

    // Save payment record
    const payment = await paymentRepository.create({
      orderId,
      amount,
      paymentMethod,
      stripePaymentIntentId: paymentIntent.id,
      status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING'
    });

    if (payment.status === 'COMPLETED') {
      // Publish event to RabbitMQ
      await publishEvent('payment.completed', {
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        timestamp: new Date().toISOString()
      });
    }

    return payment;
  }

  async verifyPayment(paymentId: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // If it's already completed, just return
    if (payment.status === 'COMPLETED') {
      return payment;
    }

    // Optionally re-check with Stripe here
    if (payment.stripePaymentIntentId && !payment.stripePaymentIntentId.startsWith('pi_simulated_')) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
        if (paymentIntent.status === 'succeeded') {
          const updated = await paymentRepository.updateStatus(paymentId, 'COMPLETED');
          
          await publishEvent('payment.completed', {
            paymentId: updated.id,
            orderId: updated.orderId,
            amount: updated.amount,
            timestamp: new Date().toISOString()
          });
          
          return updated;
        }
      } catch (error: any) {
        throw new AppError(`Stripe error: ${error.message}`, 400);
      }
    } else if (payment.stripePaymentIntentId?.startsWith('pi_simulated_')) {
      // Simulate success for dummy
      const updated = await paymentRepository.updateStatus(paymentId, 'COMPLETED');
      await publishEvent('payment.completed', {
        paymentId: updated.id,
        orderId: updated.orderId,
        amount: updated.amount,
        timestamp: new Date().toISOString()
      });
      return updated;
    }

    return payment;
  }
}

export const paymentService = new PaymentService();
