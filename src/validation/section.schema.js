import { z } from "zod";

const heroContentSchema = z.object({
  headline: z.string().min(1).max(120),
  subheadline: z.string().max(240).optional().default(""),
  ctaLabel: z.string().max(40).optional().default(""),
  ctaHref: z.string().max(300).optional().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const aboutContentSchema = z.object({
  heading: z.string().min(1).max(120),
  body: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const skillItemSchema = z.object({
  name: z.string().min(1).max(60),
  level: z.number().min(0).max(100).optional(),
  icon: z.string().max(200).optional(),
});

const skillsContentSchema = z.object({
  heading: z.string().max(120).optional().default("Skills"),
  items: z.array(skillItemSchema).default([]),
});

const projectItemSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).default([]),
});

const projectsContentSchema = z.object({
  heading: z.string().max(120).optional().default("Projects"),
  items: z.array(projectItemSchema).default([]),
});

const contactContentSchema = z.object({
  heading: z.string().max(120).optional().default("Contact"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional().default(""),
  socials: z
    .array(
      z.object({
        label: z.string().max(30),
        href: z.string().url(),
      })
    )
    .default([]),
});

const researchItemSchema = z.object({
  title: z.string().min(1).max(200),
  publisher: z.string().max(120).optional().default(""),
  date: z.string().max(40).optional().default(""),
  description: z.string().max(500).optional().default(""),
  url: z.string().url().optional().or(z.literal("")),
});

const researchContentSchema = z.object({
  heading: z.string().max(120).optional().default("Research"),
  items: z.array(researchItemSchema).default([]),
});

const galleryItemSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().max(200).optional().default(""),
});

const galleryContentSchema = z.object({
  heading: z.string().max(120).optional().default("Gallery"),
  items: z.array(galleryItemSchema).default([]),
});

const testimonialItemSchema = z.object({
  name: z.string().min(1).max(80),
  role: z.string().max(120).optional().default(""),
  quote: z.string().min(1).max(600),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

const testimonialsContentSchema = z.object({
  heading: z.string().max(120).optional().default("Testimonials"),
  items: z.array(testimonialItemSchema).default([]),
});

const experienceItemSchema = z.object({
  company: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  startDate: z.string().max(40).optional().default(""),
  endDate: z.string().max(40).optional().default(""),
  description: z.string().max(500).optional().default(""),
});

const experienceContentSchema = z.object({
  heading: z.string().max(120).optional().default("Experience"),
  items: z.array(experienceItemSchema).default([]),
});

const certificationItemSchema = z.object({
  title: z.string().min(1).max(150),
  issuer: z.string().max(120).optional().default(""),
  date: z.string().max(40).optional().default(""),
  credentialUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const certificationsContentSchema = z.object({
  heading: z.string().max(120).optional().default("Certifications"),
  items: z.array(certificationItemSchema).default([]),
});

const ventureItemSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(""),
  url: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

const startupContentSchema = z.object({
  heading: z.string().max(120).optional().default("Startups"),
  items: z.array(ventureItemSchema).default([]),
});

const businessContentSchema = z.object({
  heading: z.string().max(120).optional().default("Business"),
  items: z.array(ventureItemSchema).default([]),
});

const blogContentSchema = z.object({
  heading: z.string().max(120).optional().default("Blog"),
  postCount: z.number().int().min(1).max(12).optional().default(3),
});

export const fieldDefSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "key must be a valid identifier"),
  label: z.string().min(1).max(120),
  type: z.enum(["text", "textarea", "number", "boolean", "url", "image", "richtext", "list"]),
  required: z.boolean().default(false),
  placeholder: z.string().max(200).optional(),
});

export const fieldSchemaArraySchema = z
  .array(fieldDefSchema)
  .min(1, "Add at least one field")
  .refine(
    (fields) => new Set(fields.map((f) => f.key)).size === fields.length,
    "Field keys must be unique"
  );

/** Maps a field-builder type to its base Zod schema (before required/default is layered on). */
const FIELD_TYPE_SCHEMAS = {
  text: () => z.string().max(500),
  textarea: () => z.string().max(5000),
  richtext: () => z.string().max(20000),
  number: () => z.coerce.number(),
  boolean: () => z.coerce.boolean(),
  url: () => z.string().url().or(z.literal("")),
  image: () => z.string().url().or(z.literal("")),
  list: () => z.array(z.string().max(200)).default([]),
};

/**
 * Builds a Zod object schema from an admin-defined field list — this is
 * what makes the "custom" section type validate its content the same way
 * every fixed type does, without a fixed shape baked into the code.
 * @param {Array<import('zod').infer<typeof fieldDefSchema>>} fields
 */
export function buildDynamicContentSchema(fields) {
  const shape = {};
  for (const field of fields) {
    let fieldSchema = FIELD_TYPE_SCHEMAS[field.type]();
    if (!field.required && field.type !== "list") {
      fieldSchema = fieldSchema.optional().default(field.type === "boolean" ? false : "");
    }
    shape[field.key] = fieldSchema;
  }
  return z.object(shape);
}

/** @type {Record<string, z.ZodTypeAny>} */
export const sectionContentSchemas = {
  hero: heroContentSchema,
  about: aboutContentSchema,
  skills: skillsContentSchema,
  projects: projectsContentSchema,
  contact: contactContentSchema,
  research: researchContentSchema,
  gallery: galleryContentSchema,
  testimonials: testimonialsContentSchema,
  experience: experienceContentSchema,
  certifications: certificationsContentSchema,
  startup: startupContentSchema,
  business: businessContentSchema,
  blog: blogContentSchema,
};

const deviceVisibilitySchema = z.object({
  desktop: z.boolean().default(true),
  tablet: z.boolean().default(true),
  mobile: z.boolean().default(true),
});

const sectionTypeSchema = z.enum([
  "hero",
  "about",
  "skills",
  "projects",
  "contact",
  "blog",
  "research",
  "gallery",
  "testimonials",
  "experience",
  "certifications",
  "startup",
  "business",
  "custom",
]);

export const sectionBaseSchema = z.object({
  type: sectionTypeSchema,
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  order: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  isEnabled: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  deviceVisibility: deviceVisibilitySchema.default({}),
  layoutConfig: z.record(z.any()).default({}),
  enabledComponents: z.array(z.string()).default([]),
  themeOverride: z.record(z.string()).nullable().default(null),
  fieldSchema: fieldSchemaArraySchema.optional(),
});

/**
 * Validates a full section payload, including `content` against the
 * schema registered for its `type` — or, for "custom" sections, against
 * a schema built on the fly from the admin-defined `fieldSchema`.
 * Throws a ZodError on failure.
 * @param {unknown} input
 */
export function parseSectionInput(input) {
  const base = sectionBaseSchema.parse(input);

  if (base.type === "custom") {
    if (!base.fieldSchema?.length) {
      throw new Error("Custom sections require a non-empty fieldSchema");
    }
    const content = buildDynamicContentSchema(base.fieldSchema).parse(
      /** @type {any} */ (input)?.content ?? {}
    );
    return { ...base, content };
  }

  const contentSchema = sectionContentSchemas[base.type];
  const content = contentSchema.parse(
    /** @type {any} */ (input)?.content ?? {}
  );
  return { ...base, content };
}

/**
 * Partial version for PATCH-style updates. For "custom" sections, pass the
 * section's *current* `fieldSchema` as `existingFieldSchema` when the patch
 * itself doesn't include one, so content can still be validated against it.
 * @param {unknown} input
 * @param {Array<any>} [existingFieldSchema]
 */
export function parseSectionUpdate(input, existingFieldSchema) {
  const base = sectionBaseSchema.partial().parse(input);
  const hasContent = /** @type {any} */ (input)?.content !== undefined;
  if (!hasContent) return base;

  const type = base.type;
  if (type === "custom" || (!type && existingFieldSchema)) {
    const fields = base.fieldSchema || existingFieldSchema;
    if (!fields?.length) {
      throw new Error("Custom sections require a non-empty fieldSchema");
    }
    base.content = buildDynamicContentSchema(fields)
      .partial()
      .parse(/** @type {any} */ (input).content);
    return base;
  }

  const contentSchema = type ? sectionContentSchemas[type] : z.record(z.any());
  base.content = contentSchema.partial
    ? contentSchema.partial().parse(/** @type {any} */ (input).content)
    : contentSchema.parse(/** @type {any} */ (input).content);
  return base;
}
