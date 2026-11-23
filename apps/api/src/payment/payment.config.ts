import { ConfigType, registerAs } from '@nestjs/config';
import z from 'zod';

const envSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  CHECKOUT_SUCCESS_URL: z.url(),
  CHECKOUT_CANCEL_URL: z.url(),

  CHECKOUT_CURRENCY: z.string().length(3).default('eur'),
});

const paymentConfig = registerAs('payment', () => {
  const env = envSchema.parse(process.env);

  return {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    successUrl: env.CHECKOUT_SUCCESS_URL,
    cancelUrl: env.CHECKOUT_CANCEL_URL,

    currency: env.CHECKOUT_CURRENCY,
  };
});

export default paymentConfig;
export type PaymentConfig = ConfigType<typeof paymentConfig>;
