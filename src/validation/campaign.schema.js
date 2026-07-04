import { z } from "zod";

export const campaignSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  description: z.string().optional().default(""),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  goalAmount: z.number().int().min(1),
  currency: z.string().min(3).max(3).default("usd"),
  status: z.enum(["draft", "published", "closed"]).default("draft"),
  endDate: z.string().datetime().optional().or(z.literal("")).optional(),
});

export const campaignUpdateSchema = campaignSchema.partial();

export const contributeSchema = z.object({
  amount: z.number().int().min(100, "Minimum contribution is 1.00"),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  paymentProvider: z.enum(["stripe", "sslcommerz"]),
});
