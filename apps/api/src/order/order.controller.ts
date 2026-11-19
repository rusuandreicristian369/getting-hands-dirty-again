import { Body, Controller, Post } from '@nestjs/common';
import { type CreateOrderDto, createOrderSchema } from './dto/create-order.dto.js';
import { type OrderResponseDto } from './dto/order-response.dto.js';
import { OrderService } from './order.service.js';

@Controller('order')
export class OrderController {

    constructor(private readonly orderService: OrderService) {

    }

    @Post()
    async placeOrder(@Body({ schema: createOrderSchema }) dto: CreateOrderDto): Promise<OrderResponseDto> {
        const order = await this.orderService.placeOrder({
            productId: dto.productId,
            quantity: dto.quantity
        })

        return order
    }
}
