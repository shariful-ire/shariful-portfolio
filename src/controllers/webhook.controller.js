import { Order } from "../models/Order.model.js";
import { constructStripeEvent } from "../lib/stripe.js";
import { validateSslcommerzTransaction } from "../lib/sslcommerz.js";
import { markOrderPaid } from "../services/order.service.js";
import { ApiError } from "../middleware/errorHandler.js";

/** Stripe requires the raw body — mounted with express.raw() before the global JSON parser. */
export async function stripeWebhook(req, res, next) {
  try {
    const signature = req.headers["stripe-signature"];
    const event = constructStripeEvent(req.body, signature);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const order = await Order.findOne({ paymentRef: session.id });
      if (order) await markOrderPaid(order._id);
    }

    res.json({ received: true });
  } catch (err) {
    next(new ApiError(400, `Webhook signature verification failed: ${err.message}`));
  }
}

/**
 * SSLCommerz's IPN is a server-to-server POST — the payload itself is not
 * trusted; we re-verify with their validation API before touching the order.
 */
export async function sslcommerzIpn(req, res, next) {
  try {
    const { val_id: valId, tran_id: tranId } = req.body;
    if (!valId || !tranId) return res.status(400).json({ error: "Missing val_id/tran_id" });

    const validation = await validateSslcommerzTransaction(valId);
    const isValid =
      validation.status === "VALID" || validation.status === "VALIDATED";

    if (isValid) {
      const order = await Order.findById(tranId);
      if (order && order.paymentRef === tranId) {
        await markOrderPaid(order._id);
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

/** Browser-redirect endpoints — informational only, never trusted for confirming payment. */
export function sslcommerzRedirect(req, res) {
  const tranId = req.body?.tran_id;
  const outcome = req.path.includes("fail")
    ? "fail"
    : req.path.includes("cancel")
      ? "cancel"
      : "success";
  res.redirect(
    302,
    `${process.env.CLIENT_ORIGIN}/shop/checkout/${outcome}?order=${tranId || ""}`
  );
}
