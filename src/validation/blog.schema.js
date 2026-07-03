import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  excerpt: z.string().max(300).optional().default(""),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  body: z.string().min(1),
  tags: z.array(z.string().max(30)).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const blogPostUpdateSchema = blogPostSchema.partial();

export const commentSchema = z.object({
  body: z.string().min(1, "Comment can't be empty").max(2000),
});
