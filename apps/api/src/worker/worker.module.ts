import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OutboxModule } from '@nestjs/outbox';
import { CoreModule } from '../core/core.module.js';
import { AckInterceptor } from '../messaging/ack.interceptor.js';
import messagingConfig from '../messaging/messaging.config.js';
import { QueueSetup } from '../messaging/queue-setup.js';
import { OrderModule } from '../order/order.module.js';

@Module({
  imports: [
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
