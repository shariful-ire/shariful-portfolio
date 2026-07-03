import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} CommentDoc
 * @property {"post"} targetType - extensible to other content types later
 * @property {mongoose.Types.ObjectId} targetId
 * @property {mongoose.Types.ObjectId} author
 * @property {string} body
 */

const commentSchema = new Schema(
  {
    targetType: { type: String, enum: ["post"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);
