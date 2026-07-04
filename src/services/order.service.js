import { Product } from "../models/Product.model.js";
import { Order } from "../models/Order.model.js";
import { Coupon } from "../models/Coupon.model.js";
import { ApiError } from "../middleware/errorHandler.js";
import { notify } from "../lib/notify.js";

/**
 * @param {{ productId: string, quantity: number }[]} cartItems
 * @returns {Promise<{ items: any[], subtotal: number, currency: string }>}
 */
async function resolveCartItems(cartItems) {
  const productIds = cartItems.map((i) => i.productId);
  const products = await Product.find({
    _id: { $in: productIds },
    status: "published",
  });

  const productsById = new Map(products.map((p) => [p._id.toString(), p]));
  const currency = products[0]?.currency || "usd";

  const items = cartItems.map(({ productId, quantity }) => {
    const product = productsById.get(productId);
    if (!product) throw new ApiError(400, `Product ${productId} is unavailable`);
    if (product.currency !== currency) {
      throw new ApiError(400, "All items in a single order must share one currency");
    }
    if (!product.isDigital && product.stock != null && product.stock < quantity) {
      throw new ApiError(400, `Not enough stock for "${product.name}"`);
    }
    return {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items, subtotal, currency };
}

/**
 * @param {string} code
 * @param {number} subtotal
 */
async function applyCoupon(code, subtotal) {
  if (!code) return { discountAmount: 0, couponCode: undefined };

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isActive) throw new ApiError(400, "Invalid coupon code");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new ApiError(400, "Coupon has expired");
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new ApiError(400, "Coupon has reached its usage limit");
  }

  const discountAmount =
    coupon.discountType === "percent"
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : Math.min(coupon.discountValue, subtotal);

  return { discountAmount, couponCode: coupon.code, couponDoc: coupon };
}

/**
 * Builds and persists a `pending` Order from a cart payload — shared by
 * both the Stripe and SSLCommerz checkout flows.
 * @param {{ userId: string, cartItems: {productId:string, quantity:number}[], couponCode?: string, paymentProvider: "stripe"|"sslcommerz" }} input
 */
export async function createPendingOrder({ userId, cartItems, couponCode, paymentProvider }) {
  const { items, subtotal, currency } = await resolveCartItems(cartItems);
  const { discountAmount, couponCode: appliedCode, couponDoc } = await applyCoupon(
    couponCode,
    subtotal
  );

  const total = Math.max(0, subtotal - discountAmount);

  const order = await Order.create({
    user: userId,
    items,
    subtotal,
    discountAmount,
    couponCode: appliedCode,
    total,
    currency,
    status: "pending",
    paymentProvider,
  });

  if (couponDoc) {
    couponDoc.usedCount += 1;
    await couponDoc.save();
  }

  return order;
}

/** Marks an order paid and decrements stock for non-digital items. Idempotent. */
export async function markOrderPaid(orderId) {
  const order = await Order.findById(orderId);
  if (!order || order.status === "paid") return order;

  order.status = "paid";
  await order.save();

  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, isDigital: false, stock: { $ne: null } },
      { $inc: { stock: -item.quantity } }
    );
  }

  notify({
    type: "order",
    message: `New paid order — ${order.total / 100} ${order.currency.toUpperCase()}`,
    link: `/dashboard/orders`,
  });

  return order;
}
