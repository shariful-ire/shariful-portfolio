import cloudinary from "../lib/cloudinary.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
}

export async function listAllOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) throw new ApiError(404, "Order not found");

    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) throw new ApiError(403, "Not your order");

    res.json({ data: order });
  } catch (err) {
    next(err);
  }
}

/**
 * Mints a short-lived, signed Cloudinary download URL for a digital
 * product on a paid order the requester owns, then redirects to it.
 * The signature + expiry come from Cloudinary's "authenticated" delivery
 * type — this endpoint just gates *who* gets one minted.
 */
export async function getDownloadUrl(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    if (order.user.toString() !== req.user.id) {
      throw new ApiError(403, "Not your order");
    }
    if (order.status !== "paid") {
      throw new ApiError(403, "Order is not paid yet");
    }

    const owns = order.items.some(
      (item) => item.product.toString() === req.params.productId
    );
    if (!owns) throw new ApiError(404, "Product not found in this order");

    const product = await Product.findById(req.params.productId);
    if (!product?.isDigital || !product.digitalAsset?.publicId) {
      throw new ApiError(404, "No digital file for this product");
    }

    const url = cloudinary.utils.private_download_url(
      product.digitalAsset.publicId,
      product.digitalAsset.format,
      {
        resource_type: product.digitalAsset.resourceType || "raw",
        type: "authenticated",
        expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
      }
    );

    res.redirect(302, url);
  } catch (err) {
    next(err);
  }
}
