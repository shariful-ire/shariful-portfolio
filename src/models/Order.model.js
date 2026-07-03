import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} OrderItem
 * @property {mongoose.Types.ObjectId} product
 * @property {string} name - snapshot at purchase time
 * @property {number} price - snapshot at purchase time (smallest currency unit)
 * @property {number} quantity
 *
 * @typedef {Object} OrderDoc
 * @property {mongoose.Types.ObjectId} user
 * @property {OrderItem[]} items
 * @property {number} subtotal
 * @property {number} discountAmount
 * @property {string} [couponCode]
 * @property {number} total
 * @property {string} currency
 * @property {"pending"|"paid"|"failed"|"refunded"} status
 * @property {"stripe"|"sslcommerz"} paymentProvider
 * @property {string} [paymentRef] - Stripe session id / SSLCommerz transaction id
 */

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    total: { type: Number, required: true },
    currency: { type: String, required: true, default: "usd" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentProvider: { type: String, enum: ["stripe", "sslcommerz"], required: true },
    paymentRef: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentRef: 1 });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
