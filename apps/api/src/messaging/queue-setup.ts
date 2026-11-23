import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import messagingConfig, { type MessagingConfig } from './messaging.config.js';

import amqplib from 'amqplib';
import { deadQueue, QUEUES } from './queues.js';

@Injectable()
export class QueueSetup implements OnModuleInit {
  constructor(
    @Inject(messagingConfig.KEY) private readonly config: MessagingConfig,
  ) {}

  async onModuleInit() {
    const connection = await amqplib.connect(this.config.url);

    try {
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUES.dead, deadQueue);
    } finally {
      await connection.close();
    }
  }
}
