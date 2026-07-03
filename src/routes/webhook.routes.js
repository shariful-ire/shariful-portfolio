import { Router } from "express";
import express from "express";
import {
  stripeWebhook,
  sslcommerzIpn,
  sslcommerzRedirect,
} from "../controllers/webhook.controller.js";

const router = Router();

// Stripe needs the raw body to verify the signature — mounted with
// express.raw() ahead of the global express.json() in app.js.
router.post("/stripe", express.raw({ type: "application/json" }), stripeWebhook);

const formParser = express.urlencoded({ extended: true });
router.post("/sslcommerz/ipn", formParser, sslcommerzIpn);
router.post("/sslcommerz/success", formParser, sslcommerzRedirect);
router.post("/sslcommerz/fail", formParser, sslcommerzRedirect);
router.post("/sslcommerz/cancel", formParser, sslcommerzRedirect);

export default router;
