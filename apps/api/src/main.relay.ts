import { NestFactory } from '@nestjs/core';
import { ObserveInstrument, RelayModule } from './relay/relay.module.js';

const app = await NestFactory.createApplicationContext(RelayModule, {
  instrument: ObserveInstrument,
});
app.enableShutdownHooks();
