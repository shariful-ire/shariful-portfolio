import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import { checkout } from "../controllers/checkout.controller.js";
import {
  listMyOrders,
  listAllOrders,
  getOrder,
  getDownloadUrl,
} from "../controllers/order.controller.js";

const router = Router();

router.post("/checkout", requireAuth, checkout);
router.get("/mine", requireAuth, listMyOrders);
router.get("/all", requireAuth, requireRole("admin"), listAllOrders);
router.get("/:id", requireAuth, getOrder);
router.get("/:id/download/:productId", requireAuth, getDownloadUrl);

export default router;
