import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { Order } from '../src/order/entities/order.entity.js';
import { Product } from '../src/product/entities/product.entity.js';
import { TestDatabaseService } from './support/test-database.service.js';

describe('OrderController (e2e)', () => {
  const INSTANCES = 3;

  let apps: INestApplication<App>[] = []
  let dataSource: DataSource;
  let databaseService: TestDatabaseService;

  beforeAll(async () => {
    for (let i = 0; i < INSTANCES; ++i) {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [TestDatabaseService]
      }).compile();

      const app = moduleFixture.createNestApplication();
      await app.init();

      apps.push(app)
    }
  });

  beforeEach(async () => {
    dataSource = apps[0].get(DataSource)
    databaseService = apps[0].get(TestDatabaseService)
    await databaseService.clean()
  })

  afterAll(async () => {
    return Promise.all(apps.map(app => app.close()))
  });

  it.each(new Array(20).fill(null).map((_, idx) => idx))
    ("Sells exactly the stock it has", async () => {
      const stock = 10;
      const buyers = 60;
      const product = await databaseService.factories.product.create({
        stock
      })

      const buyerRequests = new Array(buyers).fill(null).map((_, index) => {
        const currentAppInstance = apps[index % INSTANCES]

        return request(currentAppInstance.getHttpServer())
          .post('/order')
          .send({
            productId: product.id,
            quantity: 1
          })
      })

      const buyerResponses = await Promise.all(buyerRequests)

      // Database checks:
      const productAfter = await dataSource.manager.findOneOrFail(Product, { where: { id: product.id } })
      const orders = await dataSource.manager.find(Order, { where: { productId: product.id } })
      const unitsSold = orders.reduce((prev, order) => prev + order.quantity, 0)

      expect(productAfter.stock).toEqual(0) // all stock has been bought - no undersell, no oversell
      expect(unitsSold).toEqual(stock) // check from the side of orders, too

      // HTTP requests checks:
      const statuses = buyerResponses.map(response => response.statusCode)
      expect(statuses.filter(status => status === 201)).toHaveLength(unitsSold)
      expect(statuses.filter(status => status === 422)).toHaveLength(buyers - unitsSold)
    })
});
