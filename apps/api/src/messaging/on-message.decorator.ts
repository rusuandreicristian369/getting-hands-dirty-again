import { Consume } from './consume.decorator.js';
import { parsePayload, Topic } from './messages.js';

export function OnMessage<T extends Topic>(topic: T) {
  return Consume(topic, (envelope) => parsePayload(topic, envelope));
}
