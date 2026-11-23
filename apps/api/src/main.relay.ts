import { NestFactory } from '@nestjs/core';
import { RelayModule } from './relay/relay.module.js';

const app = await NestFactory.createApplicationContext(RelayModule);
app.enableShutdownHooks();
