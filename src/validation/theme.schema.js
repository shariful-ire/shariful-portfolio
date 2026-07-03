import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "must be a hex color");

const tokenSetSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  accent: hexColor,
  base100: hexColor,
  base200: hexColor,
  base300: hexColor,
  heading: hexColor,
  body: hexColor,
  muted: hexColor,
  success: hexColor,
  warning: hexColor,
  error: hexColor,
  info: hexColor,
});

export const themeSchema = z.object({
  name: z.string().min(1).max(60),
  isActive: z.boolean().default(false),
  fonts: z
    .object({
      body: z.string().default("Inter"),
      heading: z.string().default("Inter"),
      mono: z.string().default("JetBrains Mono"),
    })
    .default({}),
  radius: z.number().min(0).max(32).default(10),
  light: tokenSetSchema,
  dark: tokenSetSchema,
});

export const themeUpdateSchema = themeSchema.partial();
