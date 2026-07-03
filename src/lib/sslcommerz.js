const IS_SANDBOX = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";

const BASE_URL = IS_SANDBOX
  ? "https://sandbox.sslcommerz.com"
  : "https://securepay.sslcommerz.com";

/**
 * Initiates an SSLCommerz session and returns the gateway page the browser
 * should be redirected to. Order confirmation itself happens via the IPN
 * webhook, not this redirect (the redirect alone is not trustworthy).
 * @param {import('../models/Order.model.js').OrderDoc & {_id: any}} order
 * @param {{ name: string, email: string }} customer
 */
export async function initiateSslcommerzSession(order, customer) {
  const params = new URLSearchParams({
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: (order.total / 100).toFixed(2),
    currency: order.currency.toUpperCase(),
    tran_id: order._id.toString(),
    success_url: `${process.env.API_BASE_URL}/api/webhooks/sslcommerz/success`,
    fail_url: `${process.env.API_BASE_URL}/api/webhooks/sslcommerz/fail`,
    cancel_url: `${process.env.API_BASE_URL}/api/webhooks/sslcommerz/cancel`,
    ipn_url: `${process.env.API_BASE_URL}/api/webhooks/sslcommerz/ipn`,
    shipping_method: "NO",
    product_name: order.items.map((i) => i.name).join(", ").slice(0, 255),
    product_category: "general",
    product_profile: "general",
    cus_name: customer.name || "Customer",
    cus_email: customer.email,
    cus_add1: "N/A",
    cus_city: "N/A",
    cus_country: "N/A",
    cus_phone: "N/A",
  });

  const res = await fetch(`${BASE_URL}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await res.json();
  if (data.status !== "SUCCESS") {
    throw new Error(data.failedreason || "SSLCommerz session initiation failed");
  }
  return data.GatewayPageURL;
}

/**
 * Server-to-server validation of an IPN payload — never trust the IPN body
 * alone, always re-verify with SSLCommerz's validation API.
 * @param {string} valId
 */
export async function validateSslcommerzTransaction(valId) {
  const params = new URLSearchParams({
    val_id: valId,
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    format: "json",
  });

  const res = await fetch(
    `${BASE_URL}/validator/api/validationserverAPI.php?${params.toString()}`
  );
  return res.json();
}
