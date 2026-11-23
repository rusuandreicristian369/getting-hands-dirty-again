import { RmqOptions, Transport } from '@nestjs/microservices';
import { MessagingConfig } from '../messaging/messaging.config.js';
import { QUEUES, workQueue } from '../messaging/queues.js';

export const workerServerOptions = (config: MessagingConfig): RmqOptions => ({
  transport: Transport.RMQ,

  options: {
    urls: [config.url],
    queue: QUEUES.work,
    queueOptions: workQueue(config),
    noAck: false, // we have the interceptor for this!
    prefetchCount: 10,
  },
});
