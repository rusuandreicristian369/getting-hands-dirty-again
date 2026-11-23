import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { OutboxModule } from '@nestjs/outbox';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BuyerModule } from './buyer/buyer.module.js';
import { CoreModule } from './core/core.module.js';
import { DomainFilter } from './errors/domain/domain.filter.js';
import { OrderModule } from './order/order.module.js';
import { ProductModule } from './product/product.module.js';
import { StoreModule } from './store/store.module.js';
import { TenantModule } from './tenant/tenant.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { StripeWebhooksModule } from './stripe-webhooks/stripe-webhooks.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    OutboxModule.forRoot({
      relay: {
        enabled: false,
      },
    }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY,
      appSecret: process.env.OBSERVE_APP_SECRET,
      enabled: false,
      serviceId: 'api',
      forwardLogs: true,
    }),
    TenantModule,
    StoreModule,
    ProductModule,
    OrderModule,
    BuyerModule,
    CoreModule,
    PaymentModule,
    StripeWebhooksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: DomainFilter,
    },
    {
      provide: APP_PIPE,
      useClass: StandardSchemaValidationPipe,
    },
  ],
})
export class AppModule {}
