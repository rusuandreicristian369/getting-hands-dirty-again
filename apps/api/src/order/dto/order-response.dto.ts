import z from 'zod';

export const orderResponseSchema = z.object({
  id: z.uuid(),
  expiresAt: z.date(),
  checkoutUrl: z.url(),
});

export type OrderResponseDto = z.infer<typeof orderResponseSchema>;
