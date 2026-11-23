import { NewOutboxMessage, OutboxEnvelope } from '@nestjs/outbox';
import z from 'zod';
import { NonRetryableError } from './errors.js';

export const messages = {
  'orders.expire': z.strictObject({ orderId: z.uuid() }),
} as const;

export type Topic = keyof typeof messages;
export type Payload<T extends Topic> = z.infer<(typeof messages)[T]>;

export function message<T extends Topic>(
  topic: T,
  payload: Payload<T>,
  options: Pick<NewOutboxMessage, 'delay' | 'availableAt'> = {},
): NewOutboxMessage<Payload<T>> {
  return {
    topic,
    payload,
    ...options,
  };
}

export function parsePayload<T extends Topic>(
  topic: T,
  envelope: OutboxEnvelope,
): Payload<T> {
  const result = messages[topic].safeParse(envelope.payload);

  if (!result.success) {
    throw new NonRetryableError(
      `${topic} ${envelope.id}: ${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
