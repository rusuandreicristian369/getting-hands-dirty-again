import { RmqOptions, Transport } from '@nestjs/microservices';
import { MessagingConfig } from '../messaging/messaging.config.js';
import { QUEUES, workQueue } from '../messaging/queues.js';

export const relayClientOptions = (config: MessagingConfig): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [config.url],
    queue: QUEUES.work,
    persistent: true,
    queueOptions: workQueue(config),
  },
});
