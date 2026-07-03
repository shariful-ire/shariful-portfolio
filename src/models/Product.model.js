import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} ProductDoc
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {number} price - smallest currency unit (e.g. cents)
 * @property {string} currency - ISO 4217, e.g. "usd", "bdt"
 * @property {string[]} images
 * @property {boolean} isDigital
 * @property {{publicId: string, resourceType: string, format: string}} [digitalAsset] - Cloudinary "authenticated" delivery asset
 * @property {number} [stock] - only meaningful for non-digital products; undefined = unlimited
 * @property {"draft"|"published"} status
 * @property {string[]} tags
 */

const productSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "usd" },
    images: { type: [String], default: [] },
    isDigital: { type: Boolean, default: true },
    digitalAsset: {
      publicId: String,
      resourceType: String,
      format: String,
    },
    stock: { type: Number, default: null },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
