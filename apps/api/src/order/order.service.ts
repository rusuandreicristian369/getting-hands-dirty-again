import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductService } from '../product/product.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Order } from './entities/order.entity.js';

@Injectable()
export class OrderService {

    constructor(
        private readonly dataSource: DataSource,
        private readonly productService: ProductService
    ) { }

    async placeOrder(dto: CreateOrderDto) {
        return this.dataSource.transaction(async (manager) => {
            await this.productService.reserve({
                productId: dto.productId,
                quantity: dto.quantity,
            }, manager)

            const _order = manager.create(Order, {
                productId: dto.productId,
                quantity: dto.quantity,
            })

            const order = await manager.save(_order)

            return order
        })
    }
}
