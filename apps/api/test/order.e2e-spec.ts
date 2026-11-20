import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { Product } from '../src/product/entities/product.entity.js';
import { TestDatabaseService } from './support/test-database.service.js';

describe('OrderController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let databaseService: TestDatabaseService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [TestDatabaseService]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource)
    databaseService = app.get(TestDatabaseService)
    await databaseService.clean()
  });

  it('can order when stock is ok', async () => {
    await databaseService.factories.product.create({
      stock: 1,
    })

    const [product] = await dataSource.manager.find(Product)

    const agent = request(app.getHttpServer())

    await agent.post('/order')
      .send({
        productId: product.id,
        quantity: 1
      })
      .expect(201)
  });

  it('cannot order when stock is not ok', async () => {
    await databaseService.factories.product.create({
      stock: 1,
    })

    const [product] = await dataSource.manager.find(Product)

    const agent = request(app.getHttpServer())

    await agent.post('/order')
      .send({
        productId: product.id,
        quantity: 2
      })
      .expect(422)
  })

  it('does not oversell when multiple requests come in', async () => {
    await databaseService.factories.product.create({
      stock: 1,
    })

    const [product] = await dataSource.manager.find(Product)

    const agent = request(app.getHttpServer())

    const totalCount = 5000
    const requests = new Array(totalCount).fill(null).map(() => agent.post("/order").send({
      productId: product.id,
      quantity: 1
    }))

    const responses = await Promise.all(requests)

    const okCount = responses.filter(response => response.statusCode === 201).length
    const notOkCount = responses.filter(response => response.statusCode === 422).length

    expect(okCount).toEqual(1)
    expect(notOkCount).toEqual(totalCount - 1)
  })

  afterEach(async () => {
    await app.close();
  });
});
