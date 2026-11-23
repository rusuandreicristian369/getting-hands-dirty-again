import { Consume } from '../../messaging/consume.decorator.js';
import { StripeEvent, StripeEventType, stripeTopic } from './stripe-events.js';

export function OnStripeEvent<T extends StripeEventType>(type: T) {
  return Consume(
    stripeTopic(type),
    (envelope) => envelope.payload as StripeEvent<T>,
  );
}
