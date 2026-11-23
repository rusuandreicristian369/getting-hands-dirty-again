import type { Options } from 'amqplib';
import type { MessagingConfig } from './messaging.config.js';

export const BROKER = 'BROKER';
export const QUEUES = {
  work: 'orders.work',
  dead: 'orders.dead',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

interface QuorumQueueArguments {
  // https://raft.github.io/
  'x-queue-type': 'quorum';
  'x-delivery-limit'?: number;
  'x-delayed-retry-type'?: 'disabled' | 'all' | 'failed' | 'returned';
  'x-delayed-retry-min'?: number;
  'x-delayed-retry-max'?: number;
}

export type QueueDeclaration = Omit<Options.AssertQueue, 'arguments'> & {
  arguments: QuorumQueueArguments;
};

const DEFAULT_EXCHANGE = ''; // just a default, routed by  queue name

export const workQueue = (config: MessagingConfig): QueueDeclaration => {
  return {
    durable: true,
    deadLetterExchange: DEFAULT_EXCHANGE,
    deadLetterRoutingKey: QUEUES.dead,
    arguments: {
      'x-queue-type': 'quorum',
      'x-delayed-retry-min': config.retryMinDelayMs,
      'x-delayed-retry-max': config.retryMaxDelayMs,
      'x-delivery-limit': config.retryMaxRetries,
      'x-delayed-retry-type': 'failed',
    },
  };
};

export const deadQueue: QueueDeclaration = {
  durable: true,
  arguments: {
    'x-queue-type': 'quorum',
  },
};
