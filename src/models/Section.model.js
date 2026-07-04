import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} FieldDef - one field in a "custom" section's admin-defined schema
 * @property {string} key - content object key, kebab/camelCase identifier
 * @property {string} label
 * @property {"text"|"textarea"|"number"|"boolean"|"url"|"image"|"richtext"|"list"} type
 * @property {boolean} required
 * @property {string} [placeholder]
 *
 * @typedef {Object} SectionDoc
 * @property {string} type - "hero"|"about"|"skills"|"projects"|"contact"|"blog"|"research"|"gallery"|"testimonials"|"experience"|"certifications"|"startup"|"business"|"custom"
 * @property {string} slug
 * @property {number} order
 * @property {boolean} isVisible
 * @property {boolean} isEnabled
 * @property {boolean} isPublished
 * @property {{desktop: boolean, tablet: boolean, mobile: boolean}} deviceVisibility
 * @property {Record<string, any>} layoutConfig
 * @property {string[]} enabledComponents
 * @property {Record<string, string>} [themeOverride] - token overrides for this section only
 * @property {FieldDef[]} [fieldSchema] - only for type "custom"; drives both the admin form and public render
 * @property {Record<string, any>} content - shape depends on `type` (or `fieldSchema` when custom), validated by Zod at the boundary
 */

const sectionSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    slug: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, required: true, default: 0 },
    isVisible: { type: Boolean, default: true },
    isEnabled: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    deviceVisibility: {
      desktop: { type: Boolean, default: true },
      tablet: { type: Boolean, default: true },
      mobile: { type: Boolean, default: true },
    },
    layoutConfig: { type: Schema.Types.Mixed, default: {} },
    enabledComponents: { type: [String], default: [] },
    themeOverride: { type: Schema.Types.Mixed, default: null },
    fieldSchema: {
      type: [
        {
          _id: false,
          key: { type: String, required: true },
          label: { type: String, required: true },
          type: {
            type: String,
            enum: ["text", "textarea", "number", "boolean", "url", "image", "richtext", "list"],
            required: true,
          },
          required: { type: Boolean, default: false },
          placeholder: { type: String },
        },
      ],
      default: undefined,
    },
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

sectionSchema.index({ order: 1 });

export const Section =
  mongoose.models.Section || mongoose.model("Section", sectionSchema);
