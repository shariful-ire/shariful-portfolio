import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";

const router = Router();

router.post("/validate", validateCoupon);
router.get("/", requireAuth, requireRole("admin"), listCoupons);
router.post("/", requireAuth, requireRole("admin"), createCoupon);
router.patch("/:id", requireAuth, requireRole("admin"), updateCoupon);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCoupon);

export default router;
