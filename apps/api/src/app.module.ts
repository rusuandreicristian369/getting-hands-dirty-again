import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolOptions } from 'mysql2';
import appConfig from './app.config.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BuyerModule } from './buyer/buyer.module.js';
import { Buyer } from './buyer/entities/buyer.entity.js';
import { DomainFilter } from './errors/domain/domain.filter.js';
import { Order } from './order/entities/order.entity.js';
import { OrderModule } from './order/order.module.js';
import { Product } from './product/entities/product.entity.js';
import { ProductModule } from './product/product.module.js';
import { Store } from './store/entities/store.entity.js';
import { StoreModule } from './store/store.module.js';
import { Tenant } from './tenant/entities/tenant.entity.js';
import { TenantModule } from './tenant/tenant.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
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
          entities: [Tenant, Store, Product, Order, Buyer],
          synchronize: process.env.NODE_ENV !== 'production',
          extra: {

          } as PoolOptions
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
    StoreModule,
    ProductModule,
    OrderModule,
    BuyerModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_FILTER,
    useClass: DomainFilter
  },
    {
      provide: APP_PIPE,
      useClass: StandardSchemaValidationPipe
    }],
})
export class AppModule { }
