const IS_SANDBOX = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";

const BASE_URL = IS_SANDBOX
  ? "https://sandbox.sslcommerz.com"
  : "https://securepay.sslcommerz.com";

/**
 * Shared session-init call — `tranId` is our own reference (prefixed so the
 * IPN/redirect handlers can tell an order from a contribution) and is never
 * trusted on its own; confirmation always goes through the IPN webhook.
 */
async function initSession({ tranId, totalAmount, currency, productName, customer }) {
  const params = new URLSearchParams({
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: (totalAmount / 100).toFixed(2),
    currency: currency.toUpperCase(),
    tran_id: tranId,
    success_url: `${process.env.API_BASE_URL}/api/webhooks/sslcommerz/success`,
    fail_url: `${process.env.API_BASE_URL}/api/webhooks/sslcommerz/fail`,
    cancel_url: `${process.env.API_BASE_URL}/api/webhooks/sslcommerz/cancel`,
    ipn_url: `${process.env.API_BASE_URL}/api/webhooks/sslcommerz/ipn`,
    shipping_method: "NO",
    product_name: productName.slice(0, 255),
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
 * @param {import('../models/Order.model.js').OrderDoc & {_id: any}} order
 * @param {{ name: string, email: string }} customer
 */
export function initiateSslcommerzSession(order, customer) {
  return initSession({
    tranId: `order_${order._id}`,
    totalAmount: order.total,
    currency: order.currency,
    productName: order.items.map((i) => i.name).join(", "),
    customer,
  });
}

/**
 * @param {import('../models/Contribution.model.js').ContributionDoc & {_id: any}} contribution
 * @param {import('../models/Campaign.model.js').CampaignDoc} campaign
 * @param {{ name: string, email: string }} customer
 */
export function initiateSslcommerzContributionSession(contribution, campaign, customer) {
  return initSession({
    tranId: `contrib_${contribution._id}`,
    totalAmount: contribution.amount,
    currency: contribution.currency,
    productName: `Contribution to ${campaign.title}`,
    customer,
  });
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
