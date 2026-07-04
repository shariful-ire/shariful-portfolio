import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} ContributionDoc
 * @property {mongoose.Types.ObjectId} campaign
 * @property {mongoose.Types.ObjectId} user
 * @property {number} amount - smallest currency unit
 * @property {string} currency
 * @property {string} [message]
 * @property {boolean} isAnonymous
 * @property {"pending"|"paid"|"failed"} status
 * @property {"stripe"|"sslcommerz"} paymentProvider
 * @property {string} [paymentRef]
 */

const contributionSchema = new Schema(
  {
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "usd" },
    message: { type: String, maxlength: 500 },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentProvider: { type: String, enum: ["stripe", "sslcommerz"], required: true },
    paymentRef: { type: String },
  },
  { timestamps: true }
);

contributionSchema.index({ campaign: 1, createdAt: -1 });

export const Contribution =
  mongoose.models.Contribution || mongoose.model("Contribution", contributionSchema);
