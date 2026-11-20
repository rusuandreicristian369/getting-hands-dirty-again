import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import appConfig from './app.config.js';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    logger: ['log'],
  });

  const configService = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  const logger = new Logger('bootstrap');

  app.enableShutdownHooks();

  await app.listen(configService.port, () => {
    logger.log(`Started listening on ${configService.port}`);
  });


}
await bootstrap();
