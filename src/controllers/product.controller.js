import { Product } from "../models/Product.model.js";
import { productSchema, productUpdateSchema } from "../validation/product.schema.js";
import { ApiError } from "../middleware/errorHandler.js";
import { cached, revalidateTag } from "../lib/cache.js";
import { signUploadParams } from "../lib/cloudinary.js";

const TAG = "products";

export async function listProducts(req, res, next) {
  try {
    const isAdmin = req.user?.role === "editor" || req.user?.role === "admin";
    const filter = isAdmin ? {} : { status: "published" };
    const products = await cached(
      `products:list:${isAdmin ? "all" : "published"}`,
      [TAG],
      () => Product.find(filter).sort({ createdAt: -1 }).lean()
    );
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) throw new ApiError(404, "Product not found");
    const isAdmin = req.user?.role === "editor" || req.user?.role === "admin";
    if (product.status !== "published" && !isAdmin) {
      throw new ApiError(404, "Product not found");
    }
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const parsed = productSchema.parse(req.body);
    const product = await Product.create(parsed);
    revalidateTag(TAG);
    res.status(201).json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const parsed = productUpdateSchema.parse(req.body);
    const product = await Product.findByIdAndUpdate(req.params.id, parsed, {
      new: true,
      runValidators: true,
    });
    if (!product) throw new ApiError(404, "Product not found");
    revalidateTag(TAG);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");
    revalidateTag(TAG);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** Signature for uploading a digital deliverable as a Cloudinary "authenticated" asset (never public). */
export function getDigitalAssetUploadSignature(req, res, next) {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "portfolio-os/digital-products";
    const type = "authenticated";
    const { signature, apiKey } = signUploadParams({ timestamp, folder, type });
    res.json({
      data: {
        timestamp,
        folder,
        type,
        signature,
        apiKey,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      },
    });
  } catch (err) {
    next(err);
  }
}
