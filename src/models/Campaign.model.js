import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} CampaignDoc
 * @property {string} title
 * @property {string} slug
 * @property {string} description
 * @property {string} coverImageUrl
 * @property {number} goalAmount - smallest currency unit
 * @property {number} raisedAmount - denormalized, updated as contributions are paid
 * @property {string} currency
 * @property {"draft"|"published"|"closed"} status
 * @property {Date} [endDate]
 */

const campaignSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    coverImageUrl: { type: String, default: "" },
    goalAmount: { type: Number, required: true, min: 0 },
    raisedAmount: { type: Number, default: 0 },
    currency: { type: String, required: true, default: "usd" },
    status: { type: String, enum: ["draft", "published", "closed"], default: "draft" },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);
