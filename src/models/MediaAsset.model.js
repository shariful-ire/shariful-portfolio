import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} MediaAssetDoc
 * @property {string} url - CDN URL (Cloudinary/S3); the file itself is never stored in Mongo
 * @property {string} publicId - provider asset id, used for deletion
 * @property {string} type - "image" | "video" | "file"
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} bytes
 * @property {string} [alt]
 * @property {mongoose.Types.ObjectId} uploadedBy
 */

const mediaAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "file"], required: true },
    width: Number,
    height: Number,
    bytes: { type: Number, required: true },
    alt: { type: String, default: "" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const MediaAsset =
  mongoose.models.MediaAsset || mongoose.model("MediaAsset", mediaAssetSchema);
