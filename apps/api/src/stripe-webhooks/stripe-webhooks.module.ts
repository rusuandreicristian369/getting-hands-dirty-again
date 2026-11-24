import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhooksModule } from '@nestjs/webhooks';
import paymentConfig, { PaymentConfig } from '../payment/payment.config.js';
import {
  STRIPE_RECEIVER,
  StripeWebhooksController,
} from './stripe-webhooks.controller.js';

export const STRIPE_CONSUMER = `webhooks:${STRIPE_RECEIVER}`;

@Module({
  imports: [
    WebhooksModule.forRootAsync({
      outgoing: false,
      imports: [ConfigModule.forFeature(paymentConfig)],
      inject: [paymentConfig.KEY],
      useFactory: (config: PaymentConfig) => {
        return {
          receivers: {
            [STRIPE_RECEIVER]: {
              scheme: 'stripe',
              secret: config.webhookSecret,
              dedupe: false,
              consumer: STRIPE_CONSUMER,
            },
          },
        };
      },
    }),
  ],
  controllers: [StripeWebhooksController],
})
export class StripeWebhooksModule {}
