import z from "zod";

export const orderResponseSchema = z.object({
    id: z.uuid(),
    productId: z.uuid(),
    quantity: z.int(),
    createdAt: z.date(),
})

export type OrderResponseDto = z.infer<typeof orderResponseSchema>