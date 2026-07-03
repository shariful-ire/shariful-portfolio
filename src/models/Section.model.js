import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} SectionDoc
 * @property {string} type - "hero"|"about"|"skills"|"projects"|"contact"|"blog"|"research"|"gallery"|"testimonials"|"experience"|"certifications"|"startup"|"business"
 * @property {string} slug
 * @property {number} order
 * @property {boolean} isVisible
 * @property {boolean} isEnabled
 * @property {boolean} isPublished
 * @property {{desktop: boolean, tablet: boolean, mobile: boolean}} deviceVisibility
 * @property {Record<string, any>} layoutConfig
 * @property {string[]} enabledComponents
 * @property {Record<string, string>} [themeOverride] - token overrides for this section only
 * @property {Record<string, any>} content - shape depends on `type`, validated by Zod at the boundary
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
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

sectionSchema.index({ order: 1 });

export const Section =
  mongoose.models.Section || mongoose.model("Section", sectionSchema);
