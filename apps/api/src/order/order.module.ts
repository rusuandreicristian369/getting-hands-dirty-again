import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from '../payment/payment.module.js';
import { ProductModule } from '../product/product.module.js';
import { Order } from './entities/order.entity.js';
import orderConfig from './order.config.js';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { OrderConsumerController } from './order-consumer/order-consumer.controller.js';

@Module({
  imports: [
    ConfigModule.forFeature(orderConfig),
    ProductModule,
    PaymentModule,
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [OrderController, OrderConsumerController],
  providers: [OrderService],
})
export class OrderModule {}
