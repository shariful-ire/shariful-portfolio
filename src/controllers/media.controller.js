import { z } from "zod";
import { MediaAsset } from "../models/MediaAsset.model.js";
import { signUploadParams, destroyAsset } from "../lib/cloudinary.js";
import { ApiError } from "../middleware/errorHandler.js";

const registerAssetSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  type: z.enum(["image", "video", "file"]),
  width: z.number().optional(),
  height: z.number().optional(),
  bytes: z.number(),
  alt: z.string().max(200).optional().default(""),
});

export async function listMedia(req, res, next) {
  try {
    const assets = await MediaAsset.find().sort({ createdAt: -1 }).lean();
    res.json({ data: assets });
  } catch (err) {
    next(err);
  }
}

/** Returns a signed payload so the client can upload directly to Cloudinary. */
export function getUploadSignature(req, res, next) {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "portfolio-os";
    const { signature, apiKey } = signUploadParams({ timestamp, folder });
    res.json({
      data: {
        timestamp,
        folder,
        signature,
        apiKey,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** Registers a DB record for an asset the client already uploaded to Cloudinary. */
export async function createMediaAsset(req, res, next) {
  try {
    const parsed = registerAssetSchema.parse(req.body);
    const asset = await MediaAsset.create({
      ...parsed,
      uploadedBy: req.user?.id,
    });
    res.status(201).json({ data: asset });
  } catch (err) {
    next(err);
  }
}

export async function deleteMediaAsset(req, res, next) {
  try {
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) throw new ApiError(404, "Media asset not found");
    await destroyAsset(asset.publicId, asset.type === "video" ? "video" : "image");
    await asset.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
