import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import {
  listThemes,
  getActiveTheme,
  createTheme,
  updateTheme,
  activateTheme,
  deleteTheme,
} from "../controllers/theme.controller.js";

const router = Router();

router.get("/active", getActiveTheme);
router.get("/", requireAuth, requireRole("editor", "admin"), listThemes);

router.post("/", requireAuth, requireRole("admin"), createTheme);
router.patch("/:id", requireAuth, requireRole("admin"), updateTheme);
router.post("/:id/activate", requireAuth, requireRole("admin"), activateTheme);
router.delete("/:id", requireAuth, requireRole("admin"), deleteTheme);

export default router;
