import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import paymentConfig from './payment.config.js';
import { PaymentGateway } from './payment.gateway.js';
import { StripePaymentGateway } from './stripe/stripe-payment.gateway.js';

@Module({
  imports: [ConfigModule.forFeature(paymentConfig)],
  providers: [
    {
      provide: PaymentGateway,
      useClass: StripePaymentGateway,
    },
  ],
  exports: [PaymentGateway],
})
export class PaymentModule {}
