import { Inject, Injectable } from '@nestjs/common';
import { Outbox } from '@nestjs/outbox';
import { DataSource, EntityManager, FindOptionsWhere } from 'typeorm';
import { NonRetryableError } from '../messaging/errors.js';
import { message } from '../messaging/messages.js';
import {
  CheckoutSession,
  CloseSessionResponse,
  PaymentGateway,
} from '../payment/payment.gateway.js';
import { ProductService } from '../product/product.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Order, OrderStatus } from './entities/order.entity.js';
import orderConfig, { type OrderConfig } from './order.config.js';
import { CheckoutUnavailableError } from './order.errors.js';

export interface PlacedOrder {
  id: string;
  amount: number;
  expiresAt: Date;
  checkoutUrl: string;
}

const awaitingPaymentFilter = (orderId: string): FindOptionsWhere<Order> => ({
  id: orderId,
  status: OrderStatus.AWAITING_PAYMENT,
});

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly productService: ProductService,
    @Inject(orderConfig.KEY)
    private readonly config: OrderConfig,
    private readonly outbox: Outbox<EntityManager>,
    private readonly payments: PaymentGateway,
  ) {}

  async placeOrder(dto: CreateOrderDto): Promise<PlacedOrder> {
    const order = await this.dataSource.transaction((manager) =>
      this.reserve(dto, manager),
    );

    const session = await this.openCheckout(order);

    return {
      id: order.id,
      expiresAt: order.expiresAt,
      checkoutUrl: session.url,
      amount: order.amount,
    };
  }

  private async reserve(dto: CreateOrderDto, manager: EntityManager) {
    const product = await this.productService.reserve(
      {
        productId: dto.productId,
        quantity: dto.quantity,
      },
      manager,
    );

    const amount = product.price * dto.quantity;

    const _order = manager.create(Order, {
      productId: dto.productId,
      quantity: dto.quantity,
      expiresAt: new Date(Date.now() + this.config.ttlMs),
      amount,
      status: OrderStatus.AWAITING_PAYMENT,
    });

    const order = await manager.save(_order);

    await this.outbox.add(
      manager,
      message(
        'orders.expire',
        {
          orderId: order.id,
        },
        {
          delay: this.config.ttlMs,
        },
      ),
    );

    return order;
  }

  private async openCheckout(order: Order): Promise<CheckoutSession> {
    let session: CheckoutSession;

    try {
      session = await this.payments.createSession({
        id: order.id,
        amount: order.amount,
      });

      await this.dataSource.manager.update(
        Order,
        { id: order.id },
        { checkoutSessionId: session.id },
      );
    } catch (err) {
      await this.expire(order.id);

      throw new CheckoutUnavailableError({ cause: err });
    }

    return session;
  }

  async closeCheckout(orderId: string) {
    const order = await this.dataSource.manager.findOneBy(
      Order,
      awaitingPaymentFilter(orderId),
    );

    if (!order) {
      return;
    }

    const closed: CloseSessionResponse = order.checkoutSessionId
      ? await this.payments.closeSession(order.checkoutSessionId)
      : 'expired';

    if (closed === 'paid') {
      await this.markPaid(orderId);
    } else {
      await this.expire(orderId);
    }
  }

  async markPaid(orderId: string) {
    const { affected } = await this.dataSource.manager.update(
      Order,
      awaitingPaymentFilter(orderId),
      {
        status: OrderStatus.PAID,
      },
    );

    if (affected) {
      return;
    }

    const order = await this.dataSource.manager.findOneBy(Order, {
      id: orderId,
    });

    if (!order || order.status !== OrderStatus.PAID) {
      throw new NonRetryableError(
        `Payment received for order ${orderId} which is ${order?.status || 'missing'}`,
      );
    }
  }

  async expire(orderId: string) {
    await this.dataSource.transaction(async (manager) => {
      const { affected } = await manager.update(
        Order,
        awaitingPaymentFilter(orderId),
        {
          status: OrderStatus.EXPIRED,
        },
      );

      if (!affected) {
        return;
      }

      const order = await manager.findOneByOrFail(Order, { id: orderId });

      await this.productService.release(
        {
          productId: order.productId,
          quantity: order.quantity,
        },
        manager,
      );
    });
  }
}
