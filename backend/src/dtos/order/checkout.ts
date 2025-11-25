import { z } from "zod";

export const CheckoutDto = z.object({
  body: z.object({
    selectedIds: z
      .array(z.number().int().positive("Product ID must be positive"))
      .min(1, "At least 1 cart item must be selected"),
  }),
});

export type CheckoutInput = z.infer<typeof CheckoutDto>["body"];
