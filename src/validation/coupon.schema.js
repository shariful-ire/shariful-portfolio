import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().min(1).max(40),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().min(0),
  expiresAt: z.string().datetime().optional().or(z.literal("")).optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  isActive: z.boolean().default(true),
});

export const couponUpdateSchema = couponSchema.partial();

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, "Cart is empty"),
  couponCode: z.string().max(40).optional(),
  paymentProvider: z.enum(["stripe", "sslcommerz"]),
});
