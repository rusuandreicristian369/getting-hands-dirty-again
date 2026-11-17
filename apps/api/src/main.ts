import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ConfigService, ConfigType } from '@nestjs/config';
import appConfig from './app.config.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    logger: ['log'],
  });

  const configService = app.get<ConfigType<typeof appConfig>>(appConfig.KEY)
  const logger = new Logger("bootstrap")

  await app.listen(configService.port, () => {
    logger.log(`Started listening on ${configService.port}`)
  });

  app.enableShutdownHooks()
}
await bootstrap();
