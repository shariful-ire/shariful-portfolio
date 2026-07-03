import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * @param {import('../models/Order.model.js').OrderDoc & {_id: any}} order
 */
export async function createStripeCheckoutSession(order) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: order.items.map((item) => ({
      price_data: {
        currency: order.currency,
        product_data: { name: item.name },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    })),
    ...(order.discountAmount > 0
      ? {
          discounts: [
            {
              coupon: await ensureStripeAdHocCoupon(order.discountAmount, order.currency),
            },
          ],
        }
      : {}),
    metadata: { orderId: order._id.toString() },
    success_url: `${process.env.CLIENT_ORIGIN}/shop/checkout/success?order=${order._id}`,
    cancel_url: `${process.env.CLIENT_ORIGIN}/shop/checkout/cancel?order=${order._id}`,
  });

  return session;
}

/** Stripe coupons aren't "amount off this order" natively per-session, so mint a one-off amount-off coupon. */
async function ensureStripeAdHocCoupon(amountOff, currency) {
  const coupon = await stripe.coupons.create({
    amount_off: amountOff,
    currency,
    duration: "once",
  });
  return coupon.id;
}

/**
 * @param {string} rawBody
 * @param {string} signature
 */
export function constructStripeEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
