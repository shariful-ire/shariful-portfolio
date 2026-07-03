import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} LikeDoc
 * @property {"post"} targetType
 * @property {mongoose.Types.ObjectId} targetId
 * @property {mongoose.Types.ObjectId} user
 */

const likeSchema = new Schema(
  {
    targetType: { type: String, enum: ["post"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

likeSchema.index({ targetType: 1, targetId: 1, user: 1 }, { unique: true });

export const Like = mongoose.models.Like || mongoose.model("Like", likeSchema);
