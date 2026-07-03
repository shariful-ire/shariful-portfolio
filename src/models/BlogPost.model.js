import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} BlogPostDoc
 * @property {string} title
 * @property {string} slug
 * @property {string} excerpt
 * @property {string} coverImageUrl
 * @property {string} body - markdown
 * @property {string[]} tags
 * @property {"draft"|"published"} status
 * @property {Date} [publishedAt]
 * @property {mongoose.Types.ObjectId} author
 * @property {number} likeCount
 * @property {number} commentCount
 */

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, default: "", maxlength: 300 },
    coverImageUrl: { type: String, default: "" },
    body: { type: String, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogPostSchema.index({ publishedAt: -1 });

export const BlogPost =
  mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);
