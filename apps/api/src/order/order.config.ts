import { ConfigType, registerAs } from '@nestjs/config';
import z from 'zod';

const envSchema = z.object({
  ORDER_TTL_MS: z.coerce.number().int().positive().default(600_000),
});

const orderConfig = registerAs('order', () => {
  const env = envSchema.parse(process.env);

  return {
    ttlMs: env.ORDER_TTL_MS,
  };
});

export default orderConfig;
export type OrderConfig = ConfigType<typeof orderConfig>;
