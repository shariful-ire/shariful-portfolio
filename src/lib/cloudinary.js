import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Produces a signature so the client can upload directly to Cloudinary
 * (the file bytes never pass through this server).
 * @param {Record<string, string|number>} paramsToSign
 */
export function signUploadParams(paramsToSign) {
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );
  return { signature, apiKey: process.env.CLOUDINARY_API_KEY };
}

export function destroyAsset(publicId, resourceType = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
