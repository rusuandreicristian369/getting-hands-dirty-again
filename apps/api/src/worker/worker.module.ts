import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { OutboxModule } from '@nestjs/outbox';
import appConfig, { AppConfig } from '../app.config.js';
import { CoreModule } from '../core/core.module.js';
import { AckInterceptor } from '../messaging/ack.interceptor.js';
import messagingConfig from '../messaging/messaging.config.js';
import { QueueSetup } from '../messaging/queue-setup.js';
import { OrderModule } from '../order/order.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory(config: AppConfig) {
        return {
          appKey: config.observe.key,
          appSecret: config.observe.secret,
          enabled: false,
          serviceId: 'worker',
          forwardLogs: true,
        };
      },
    }),
    CoreModule,
    ConfigModule.forFeature(messagingConfig),
    OutboxModule.forRoot({
      relay: {
        enabled: false,
      },
    }),
    OrderModule,
  ],
  providers: [
    QueueSetup,
    {
      provide: APP_INTERCEPTOR,
      useClass: AckInterceptor,
    },
  ],
})
export class WorkerModule {}
