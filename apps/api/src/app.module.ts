import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import appConfig from './app.config.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig]
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
          entities: [],
          synchronize: process.env.NODE_ENV !== "production"
        }
      }
    }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY,
      appSecret: process.env.OBSERVE_APP_SECRET,
      enabled: false,
      serviceId: 'api',
      forwardLogs: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
