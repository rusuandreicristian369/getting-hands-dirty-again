import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { ClientProxyTransport, OutboxModule } from '@nestjs/outbox';
import { CoreModule } from '../core/core.module.js';
import messagingConfig from '../messaging/messaging.config.js';
import { BROKER } from '../messaging/queues.js';
import { relayClientOptions } from './relay.client.js';

@Module({
  imports: [
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: BROKER,
          imports: [ConfigModule.forFeature(messagingConfig)],
          inject: [messagingConfig.KEY],
          useFactory: relayClientOptions,
        },
      ],
    }),
    OutboxModule.forRoot({
      transports: {
        rmq: ClientProxyTransport(BROKER),
      },
    }),
    CoreModule,
  ],
})
export class RelayModule {}
