import { NestFactory } from '@nestjs/core';
import { AsyncMicroserviceOptions } from '@nestjs/microservices';
import messagingConfig from './messaging/messaging.config.js';
import { WorkerModule } from './worker/worker.module.js';
import { workerServerOptions } from './worker/worker.server.js';

const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
  WorkerModule,
  {
    inject: [messagingConfig.KEY],
    useFactory: workerServerOptions,
  },
);
app.enableShutdownHooks();
await app.listen();
