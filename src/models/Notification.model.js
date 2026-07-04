import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} NotificationDoc
 * @property {"comment"|"order"|"contribution"|"system"} type
 * @property {string} message
 * @property {string} [link]
 * @property {mongoose.Types.ObjectId[]} readBy - staff users who've dismissed it
 */

const notificationSchema = new Schema(
  {
    type: { type: String, enum: ["comment", "order", "contribution", "system"], required: true },
    message: { type: String, required: true, maxlength: 300 },
    link: { type: String },
    readBy: { type: [Schema.Types.ObjectId], default: [], ref: "User" },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
