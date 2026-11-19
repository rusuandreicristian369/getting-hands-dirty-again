import z from "zod";

export const createOrderSchema = z.strictObject({
    productId: z.uuid(),
    quantity: z.int().min(1)
})

export type CreateOrderDto = z.infer<typeof createOrderSchema>