import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Outbox } from '@nestjs/outbox';
import { IncomingWebhook, VerifyWebhook } from '@nestjs/webhooks';
import Stripe from 'stripe';
import { DataSource, EntityManager } from 'typeorm';
import {
  isHandled,
  stripeEventMessage,
} from '../payment/stripe/stripe-events.js';

export const STRIPE_RECEIVER = 'stripe';

@Controller('webhooks/stripe')
export class StripeWebhooksController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly outbox: Outbox<EntityManager>,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @VerifyWebhook(STRIPE_RECEIVER)
  async receive(@IncomingWebhook() webhook: IncomingWebhook<Stripe.Event>) {
    const event = webhook.payload;

    if (!isHandled(event)) {
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      await webhook.processInTransaction(manager, () =>
        this.outbox.add(manager, stripeEventMessage(event)),
      );
    });
  }
}
