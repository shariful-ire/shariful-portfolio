import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} PageViewDoc
 * @property {string} path
 * @property {string} [referrer]
 */

const pageViewSchema = new Schema(
  {
    path: { type: String, required: true, maxlength: 500 },
    referrer: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ path: 1 });

export const PageView =
  mongoose.models.PageView || mongoose.model("PageView", pageViewSchema);
