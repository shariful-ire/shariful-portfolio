import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  contribute,
  listContributions,
} from "../controllers/campaign.controller.js";

const router = Router();

router.get("/", listCampaigns);
router.get("/:slug", getCampaign);
router.get("/:slug/contributions", listContributions);
router.post("/:slug/contribute", requireAuth, contribute);

router.post("/", requireAuth, requireRole("editor", "admin"), createCampaign);
router.patch("/:id", requireAuth, requireRole("editor", "admin"), updateCampaign);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCampaign);

export default router;
