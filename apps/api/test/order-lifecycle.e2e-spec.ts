import { INestApplication, INestMicroservice } from '@nestjs/common';
import { OutboxInboxStore, OutboxStorage, OutboxStore } from '@nestjs/outbox';
import { TestingModule } from '@nestjs/testing';
import { StartedMySqlContainer } from '@testcontainers/mysql';
import { StartedRabbitMQContainer } from '@testcontainers/rabbitmq';
import { ChannelModel } from 'amqplib';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { FakePaymentGateway } from './support/fake-payment.gateway.js';
import {
  createApi,
  createRelay,
  createWorker,
  startEach,
} from './support/processes.js';
import { TestDatabaseService } from './support/test-database.service.js';

import amqplib from 'amqplib';
import { randomUUID } from 'crypto';
import Stripe from 'stripe';
import request from 'supertest';
import { QUEUES } from '../src/messaging/queues.js';
import { Order, OrderStatus } from '../src/order/entities/order.entity.js';
import paymentConfig, { PaymentConfig } from '../src/payment/payment.config.js';
import { StripeEventType } from '../src/payment/stripe/stripe-events.js';
import { Product } from '../src/product/entities/product.entity.js';
import { STRIPE_CONSUMER } from '../src/stripe-webhooks/stripe-webhooks.module.js';
import { createMysqlContainer } from './support/containers/create-mysql.container.js';
import { createRabbitMQContainer } from './support/containers/create-rmq.container.js';

describe('Order lifecycle (e2e)', () => {
  const APIS = 3;
  const RELAYS = 1;
  const WORKERS = 3;

  const gateway = new FakePaymentGateway();

  let rabbit: StartedRabbitMQContainer;
  let mysql: StartedMySqlContainer;
  let apis: INestApplication<App>[];
  let relays: TestingModule[];
  let workers: INestMicroservice[];

  let amqp: ChannelModel;

  let inbox: OutboxInboxStore;
  let outbox: OutboxStore;

  let db: DataSource;
  let database: TestDatabaseService;

  let webhookSecret: string;

  process.env.ORDER_TTL_MS = '1500';

  const checkoutEvent = (
    type: StripeEventType,
    orderId: string,
    paymentStatus: 'paid' | 'unpaid',
  ) => ({
    id: `evt_${randomUUID()}`,
    object: 'event',
    type,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: `cs_test_${orderId}`,
        object: 'checkout.session',
        client_reference_id: orderId,
        payment_status: paymentStatus,
      },
    },
  });

  const deliver = (event: { id: string }, api = apis[0]) => {
    const payload = JSON.stringify(event);
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    return request(api.getHttpServer())
      .post('/webhooks/stripe')
      .set('stripe-signature', signature)
      .set('content-type', 'application/json')
      .send(payload);
  };

  beforeAll(async () => {
    [rabbit, mysql] = await Promise.all([
      createRabbitMQContainer(),
      createMysqlContainer(),
    ]);

    apis = await startEach(APIS, () => createApi(gateway));
    relays = await startEach(RELAYS, () => createRelay());
    workers = await startEach(WORKERS, () => createWorker(gateway));

    const api = apis[0];

    db = api.get(DataSource);
    database = api.get(TestDatabaseService);

    inbox = api.get(OutboxStorage).inbox;
    outbox = api.get(OutboxStorage).messages;

    const pc = api.get<PaymentConfig>(paymentConfig.KEY);
    webhookSecret = pc.webhookSecret;

    amqp = await amqplib.connect(rabbit.getAmqpUrl());
  });

  beforeEach(async () => {
    gateway.reset();

    await expect
      .poll(
        async () => {
          const stats = await outbox.stats(Date.now());

          return stats.pending;
        },
        { timeout: 15_000 },
      )
      .toBe(0);

    await database.clean();
  });

  afterAll(async () => {
    await amqp.close();

    await Promise.all(relays.map((relay) => relay.close()));
    await Promise.all(workers.map((worker) => worker.close()));
    await Promise.all(apis.map((api) => api.close()));

    await rabbit.stop();
    await mysql.stop();
  });

  const statusOfOrder = async (id: string) =>
    (await db.manager.findOneByOrFail(Order, { id })).status;
  const stockOfProduct = async (id: string) =>
    (await db.manager.findOneByOrFail(Product, { id })).stock;
  const deadLetterCount = async () => {
    const channel = await amqp.createChannel();

    try {
      const queue = await channel.checkQueue(QUEUES.dead);

      return queue.messageCount;
    } finally {
      await channel.close();
    }
  };

  const placeOrder = async (productId: string, api = apis[0]) => {
    return request(api.getHttpServer())
      .post('/order')
      .send({ productId, quantity: 1 })
      .expect(201);
  };

  it('expires an unpaid order through the whole pipeline, exactly once', async () => {
    const stock = 5;

    const product = await database.factories.product.create({
      stock,
      price: 1000,
    });

    const response = await placeOrder(product.id);

    expect(response.body.id).toBeTruthy();
    expect(response.body.checkoutUrl).toBeTruthy();
    const orderId = response.body.id as string;

    expect(await statusOfOrder(orderId)).toStrictEqual(
      OrderStatus.AWAITING_PAYMENT,
    );
    expect(await stockOfProduct(product.id)).toStrictEqual(stock - 1);

    await expect
      .poll(() => statusOfOrder(orderId), { timeout: 15_000, interval: 200 })
      .toBe(OrderStatus.EXPIRED);

    expect(await stockOfProduct(product.id)).toStrictEqual(stock);

    const stats = await outbox.stats(Date.now());
    expect(stats.pending).toBe(0);
    expect(stats.deadLetters).toBe(0);
    expect(await deadLetterCount()).toBe(0);

    expect(gateway.closed).toHaveLength(1);
  });

  it('pays an order through a signed Stripe webhook, exactly once', async () => {
    const stock = 5;

    const product = await database.factories.product.create({
      stock,
      price: 1000,
    });

    const response = await placeOrder(product.id);
    const orderId = response.body.id;

    const event = checkoutEvent('checkout.session.completed', orderId, 'paid');
    await deliver(event).expect(200);

    await expect
      .poll(() => statusOfOrder(orderId), { timeout: 15_000, interval: 200 })
      .toBe(OrderStatus.PAID);
    expect(await stockOfProduct(product.id)).toStrictEqual(stock - 1);

    expect(await inbox.hasInbox(STRIPE_CONSUMER, event.id)).toBe(true);
    expect(await deadLetterCount()).toBe(0);
    expect(gateway.closed).toHaveLength(0);
  });
});
