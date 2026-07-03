import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  description: z.string().optional().default(""),
  price: z.number().int().min(0, "Price must be >= 0 (smallest currency unit)"),
  currency: z.string().min(3).max(3).default("usd"),
  images: z.array(z.string().url()).default([]),
  isDigital: z.boolean().default(true),
  digitalAsset: z
    .object({
      publicId: z.string(),
      resourceType: z.string(),
      format: z.string(),
    })
    .nullable()
    .optional(),
  stock: z.number().int().min(0).nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  tags: z.array(z.string().max(30)).default([]),
});

export const productUpdateSchema = productSchema.partial();
