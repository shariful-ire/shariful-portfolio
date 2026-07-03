import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} CouponDoc
 * @property {string} code - stored uppercase
 * @property {"percent"|"fixed"} discountType
 * @property {number} discountValue - percent (0-100) or fixed smallest-unit amount
 * @property {Date} [expiresAt]
 * @property {number} [maxUses]
 * @property {number} usedCount
 * @property {boolean} isActive
 */

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
