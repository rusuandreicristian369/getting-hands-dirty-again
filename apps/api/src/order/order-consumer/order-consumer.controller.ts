import { Controller } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NonRetryableError } from '../../messaging/errors.js';
import { type Payload } from '../../messaging/messages.js';
import { OnMessage } from '../../messaging/on-message.decorator.js';
import { OnStripeEvent } from '../../payment/stripe/on-stripe-event.decorator.js';
import { type StripeEvent } from '../../payment/stripe/stripe-events.js';
import { OrderService } from '../order.service.js';

@Controller()
export class OrderConsumerController {
  constructor(
    private readonly orders: OrderService,
    private readonly dataSource: DataSource,
  ) {}

  @OnMessage('orders.expire')
  async expire({ orderId }: Payload<'orders.expire'>): Promise<void> {
    await this.orders.closeCheckout(orderId);
  }

  @OnStripeEvent('checkout.session.completed')
  async checkoutCompleted(
    event: StripeEvent<'checkout.session.completed'>,
  ): Promise<void> {
    if (event.data.object.payment_status === 'unpaid') {
      return;
    }

    const orderId = orderOf(event);

    await this.orders.markPaid(orderId);
  }

  @OnStripeEvent('checkout.session.expired')
  async checkoutExpired(
    event: StripeEvent<'checkout.session.expired'>,
  ): Promise<void> {
    const orderId = orderOf(event);

    await this.orders.expire(orderId);
  }
}

function orderOf(event: StripeEvent): string {
  const orderId = event.data.object.client_reference_id;

  if (!orderId) {
    throw new NonRetryableError(
      `${event.type} ${event.id}: session has no order`,
    );
  }

  return orderId;
}
