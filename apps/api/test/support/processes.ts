import { INestApplication, INestMicroservice } from '@nestjs/common';
import { RmqOptions } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import messagingConfig from '../../src/messaging/messaging.config.js';
import { PaymentGateway } from '../../src/payment/payment.gateway.js';
import { RelayModule } from '../../src/relay/relay.module.js';
import { WorkerModule } from '../../src/worker/worker.module.js';
import { workerServerOptions } from '../../src/worker/worker.server.js';
import { TestDatabaseService } from './test-database.service.js';

export async function createApi(
  gateway: PaymentGateway,
): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    providers: [TestDatabaseService],
  })
    .overrideProvider(PaymentGateway)
    .useValue(gateway)
    .compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>({
    rawBody: true,
  });

  return app.init();
}

export async function createWorker(
  gateway: PaymentGateway,
): Promise<INestMicroservice> {
  const moduleRef = await Test.createTestingModule({
    imports: [WorkerModule],
  })
    .overrideProvider(PaymentGateway)
    .useValue(gateway)
    .compile();

  const worker = moduleRef.createNestMicroservice<RmqOptions>(
    workerServerOptions(moduleRef.get(messagingConfig.KEY)),
  );

  await worker.listen();

  return worker;
}

export async function createRelay(): Promise<TestingModule> {
  const relay = await Test.createTestingModule({
    imports: [RelayModule],
  }).compile();

  return relay.init();
}

export async function startEach<T>(
  count: number,
  start: () => Promise<T>,
): Promise<T[]> {
  const started: T[] = [];

  for (let i = 0; i < count; ++i) {
    started.push(await start());
  }

  return started;
}
