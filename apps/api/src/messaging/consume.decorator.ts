import { applyDecorators, UsePipes } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { OutboxEnvelope } from '@nestjs/outbox';

export function Consume<P>(
  topic: string,
  read: (envelope: OutboxEnvelope) => P,
) {
  const decorate = applyDecorators(
    EventPattern<string>(topic),
    UsePipes({ transform: read }),
  );

  return (
    target: object,
    key: string | symbol,
    handler: TypedPropertyDescriptor<(payload: P) => Promise<void>>,
  ): void => decorate(target, key, handler);
}
