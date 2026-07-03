import { checkoutSchema } from "../validation/coupon.schema.js";
import { createPendingOrder } from "../services/order.service.js";
import { createStripeCheckoutSession } from "../lib/stripe.js";
import { initiateSslcommerzSession } from "../lib/sslcommerz.js";

export async function checkout(req, res, next) {
  try {
    const parsed = checkoutSchema.parse(req.body);

    const order = await createPendingOrder({
      userId: req.user.id,
      cartItems: parsed.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      couponCode: parsed.couponCode,
      paymentProvider: parsed.paymentProvider,
    });

    if (parsed.paymentProvider === "stripe") {
      const session = await createStripeCheckoutSession(order);
      order.paymentRef = session.id;
      await order.save();
      return res.json({ data: { url: session.url, orderId: order._id } });
    }

    const gatewayUrl = await initiateSslcommerzSession(order, {
      name: req.user.name,
      email: req.user.email,
    });
    order.paymentRef = order._id.toString();
    await order.save();
    res.json({ data: { url: gatewayUrl, orderId: order._id } });
  } catch (err) {
    next(err);
  }
}
