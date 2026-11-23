import { type NewOutboxMessage } from '@nestjs/outbox';
import type Stripe from 'stripe';

const HANDLED = [
  'checkout.session.completed',
  'checkout.session.expired',
] as const satisfies readonly Stripe.Event['type'][];

export type StripeEventType = (typeof HANDLED)[number];

export type StripeEvent<T extends StripeEventType = StripeEventType> = Extract<
  Stripe.Event,
  { type: T }
>;

export function isHandled(event: Stripe.Event): event is StripeEvent {
  return HANDLED.some((type) => type === event.type);
}

export function stripeTopic<T extends StripeEventType>(type: T) {
  return `stripe.${type}` as const;
}

export function stripeEventMessage(
  event: StripeEvent,
): NewOutboxMessage<StripeEvent> {
  return {
    id: event.id,
    topic: stripeTopic(event.type),
    payload: event,
  };
}
