import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import { trackPageView, getAnalyticsSummary } from "../controllers/analytics.controller.js";

const router = Router();

router.post("/pageview", trackPageView);
router.get("/summary", requireAuth, requireRole("editor", "admin"), getAnalyticsSummary);

export default router;
