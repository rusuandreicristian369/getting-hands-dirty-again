import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OutboxStorage } from '@nestjs/outbox';
import { fromTypeOrm, MySqlOutboxStore } from '@nestjs/outbox/mysql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolOptions } from 'mysql2';
import { DataSource } from 'typeorm';
import appConfig, { AppConfig } from '../app.config.js';
import { Buyer } from '../buyer/entities/buyer.entity.js';
import { Order } from '../order/entities/order.entity.js';
import { Product } from '../product/entities/product.entity.js';
import { Store } from '../store/entities/store.entity.js';
import { Tenant } from '../tenant/entities/tenant.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory(config: AppConfig) {
        return {
          type: config.typeorm.type,
          host: config.typeorm.host,
          port: config.typeorm.port,
          username: config.typeorm.username,
          database: config.typeorm.database,
          password: config.typeorm.password,
          entities: [Tenant, Store, Product, Order, Buyer],
          synchronize: process.env.NODE_ENV !== 'production',
          extra: {} as PoolOptions,
        };
      },
    }),
  ],
  providers: [
    {
      provide: MySqlOutboxStore,
      inject: [DataSource, OutboxStorage],
      useFactory: (ds: DataSource, storage: OutboxStorage) => {
        return new MySqlOutboxStore(
          {
            executor: fromTypeOrm(ds),
          },
          storage,
        );
      },
    },
  ],
})
export class CoreModule {}
