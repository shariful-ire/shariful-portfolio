import { Notification } from "../models/Notification.model.js";

/**
 * Creates a staff notification (new comment, paid order, paid contribution, ...).
 * Fire-and-forget from the caller's perspective — failures are logged, not thrown,
 * so a notification bug never breaks the underlying action (posting a comment,
 * confirming a payment, etc).
 * @param {{ type: "comment"|"order"|"contribution"|"system", message: string, link?: string }} input
 */
export async function notify({ type, message, link }) {
  try {
    await Notification.create({ type, message, link });
  } catch (err) {
    console.error("[notify] failed to create notification:", err);
  }
}
