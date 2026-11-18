import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './app.config.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Tenant } from './tenant/entities/tenant.entity.js';
import { TenantModule } from './tenant/tenant.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory(config: ConfigType<typeof appConfig>) {
        return {
          type: config.typeorm.type,
          host: config.typeorm.host,
          port: config.typeorm.port,
          username: config.typeorm.username,
          database: config.typeorm.database,
          password: config.typeorm.password,
          entities: [Tenant],
          synchronize: process.env.NODE_ENV !== 'production',
        };
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
