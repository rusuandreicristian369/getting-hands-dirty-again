import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { createObserveModule } from '@nestjs/observe';
import { ClientProxyTransport, OutboxModule } from '@nestjs/outbox';
import appConfig, { AppConfig } from '../app.config.js';
import { CoreModule } from '../core/core.module.js';
import messagingConfig from '../messaging/messaging.config.js';
import { BROKER } from '../messaging/queues.js';
import { relayClientOptions } from './relay.client.js';

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
          serviceId: 'relay',
          forwardLogs: true,
        };
      },
    }),
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
