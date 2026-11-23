import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import appConfig, { AppConfig } from './app.config.js';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    logger: ['log'],
    rawBody: true,
  });

  const configService = app.get<AppConfig>(appConfig.KEY);
  const logger = new Logger('bootstrap');

  app.enableShutdownHooks();

  await app.listen(configService.port, () => {
    logger.log(`Started listening on ${configService.port}`);
  });
}
await bootstrap();
