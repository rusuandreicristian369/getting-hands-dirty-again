import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedMySqlContainer } from '@testcontainers/mysql';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { Order } from '../src/order/entities/order.entity.js';
import { PaymentGateway } from '../src/payment/payment.gateway.js';
import { Product } from '../src/product/entities/product.entity.js';
import { createMysqlContainer } from './support/containers/create-mysql.container.js';
import { FakePaymentGateway } from './support/fake-payment.gateway.js';
import { TestDatabaseService } from './support/test-database.service.js';

describe('OrderController (e2e)', () => {
  const INSTANCES = 3;

  let sql: StartedMySqlContainer;
  let apps: INestApplication<App>[] = [];
  let dataSource: DataSource;
  let databaseService: TestDatabaseService;

  beforeAll(async () => {
    sql = await createMysqlContainer();
    for (let i = 0; i < INSTANCES; ++i) {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [
          TestDatabaseService,
          {
            provide: PaymentGateway,
            useClass: FakePaymentGateway,
          },
        ],
      }).compile();

      const app = moduleFixture.createNestApplication({ rawBody: true });
      await app.init();

      apps.push(app);
    }
  });

  beforeEach(async () => {
    dataSource = apps[0].get(DataSource);
    databaseService = apps[0].get(TestDatabaseService);
    await databaseService.clean();
  });

  afterAll(async () => {
    await databaseService.clean();
    await Promise.all(apps.map((app) => app.close()));
    await sql.stop();
  });

  it.each(Array.from({ length: 20 }).map((_, idx) => idx))(
    'Sells exactly the stock it has',
    async () => {
      const stock = 10;
      const buyers = 60;
      const product = await databaseService.factories.product.create({
        stock,
        price: 1000, // Stripe won't work with less than $1!
      });

      const buyerRequests = Array.from({ length: buyers }).map((_, index) => {
        const currentAppInstance = apps[index % INSTANCES];

        return request(currentAppInstance.getHttpServer()).post('/order').send({
          productId: product.id,
          quantity: 1,
        });
      });

      const buyerResponses = await Promise.all(buyerRequests);

      // Database checks:
      const productAfter = await dataSource.manager.findOneOrFail(Product, {
        where: { id: product.id },
      });
      const orders = await dataSource.manager.find(Order, {
        where: { productId: product.id },
      });
      const unitsSold = orders.reduce(
        (prev, order) => prev + order.quantity,
        0,
      );

      expect(productAfter.stock).toEqual(0); // all stock has been bought - no undersell, no oversell
      expect(unitsSold).toEqual(stock); // check from the side of orders, too

      // HTTP requests checks:
      const statuses = buyerResponses.map((response) => response.statusCode);
      expect(statuses.filter((status) => status === 201)).toHaveLength(
        unitsSold,
      );
      expect(statuses.filter((status) => status === 422)).toHaveLength(
        buyers - unitsSold,
      );
    },
  );
});
