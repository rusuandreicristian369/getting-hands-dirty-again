import { ConfigType, registerAs } from '@nestjs/config';
import z from 'zod';

const envSchema = z.object({
  RABBITMQ_URL: z.url(),
  MESSAGING_MAX_RETRIES: z.coerce.number().int().positive().default(10),
  MESSAGING_RETRY_MIN_DELAY_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(5_000),
  MESSAGING_RETRY_MAX_DELAY_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60_000),
});

const messagingConfig = registerAs('messaging', () => {
  const env = envSchema.parse(process.env);

  return {
    url: env.RABBITMQ_URL,
    retryMaxRetries: env.MESSAGING_MAX_RETRIES,
    retryMinDelayMs: env.MESSAGING_RETRY_MIN_DELAY_MS,
    retryMaxDelayMs: env.MESSAGING_RETRY_MAX_DELAY_MS,
  };
});

export default messagingConfig;
export type MessagingConfig = ConfigType<typeof messagingConfig>;
