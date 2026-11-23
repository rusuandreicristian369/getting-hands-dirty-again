import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import paymentConfig, { type PaymentConfig } from '../payment.config.js';
import {
  CheckoutSession,
  CloseSessionResponse,
  CreateSessionOrder,
  PaymentGateway,
} from '../payment.gateway.js';

const STRIPE_SESSION_SECONDS = 31 * 60;

@Injectable()
export class StripePaymentGateway extends PaymentGateway {
  protected readonly stripe: Stripe;

  constructor(
    @Inject(paymentConfig.KEY) private readonly config: PaymentConfig,
  ) {
    super();

    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2026-11-18.endive',
      timeout: 10_000,
    });
  }

  async createSession(order: CreateSessionOrder): Promise<CheckoutSession> {
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        allowed_payment_method_types: ['card'],
        client_reference_id: order.id,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: this.config.currency,
              unit_amount: order.amount,
              product_data: { name: `Order ${order.id} ` },
            },
          },
        ],
        success_url: this.config.successUrl,
        cancel_url: this.config.cancelUrl,
        expires_at: Math.floor(Date.now() / 1000) + STRIPE_SESSION_SECONDS,
      },
      {
        idempotencyKey: `checkout-session:${order.id}`,
      },
    );

    if (!session.url) {
      throw new Error(`Stripe returned no URL for session ${session.id}`);
    }

    return {
      id: session.id,
      url: session.url,
    };
  }

  async closeSession(sessionId: string): Promise<CloseSessionResponse> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.status === 'complete') {
      return 'paid';
    }

    if (session.status === 'open') {
      await this.stripe.checkout.sessions.expire(sessionId);
    }

    return 'expired';
  }
}
