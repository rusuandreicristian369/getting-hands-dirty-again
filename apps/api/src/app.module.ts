import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { OutboxModule } from '@nestjs/outbox';
import appConfig, { AppConfig } from './app.config.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BuyerModule } from './buyer/buyer.module.js';
import { CoreModule } from './core/core.module.js';
import { DomainFilter } from './errors/domain/domain.filter.js';
import { OrderModule } from './order/order.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { ProductModule } from './product/product.module.js';
import { StoreModule } from './store/store.module.js';
import { StripeWebhooksModule } from './stripe-webhooks/stripe-webhooks.module.js';
import { TenantModule } from './tenant/tenant.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    OutboxModule.forRoot({
      relay: {
        enabled: false,
      },
    }),
    ObserveModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory(config: AppConfig) {
        return {
          appKey: config.observe.key,
          appSecret: config.observe.secret,
          enabled: false,
          serviceId: 'api',
          forwardLogs: true,
        };
      },
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
