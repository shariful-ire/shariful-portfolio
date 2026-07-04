import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import {
  listSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  duplicateSection,
} from "../controllers/section.controller.js";

const router = Router();

router.get("/", listSections);
router.get("/:slug", getSection);

router.post("/", requireAuth, requireRole("editor", "admin"), createSection);
router.patch(
  "/:id",
  requireAuth,
  requireRole("editor", "admin"),
  updateSection
);
router.post(
  "/reorder",
  requireAuth,
  requireRole("editor", "admin"),
  reorderSections
);
router.post(
  "/:id/duplicate",
  requireAuth,
  requireRole("editor", "admin"),
  duplicateSection
);
router.delete("/:id", requireAuth, requireRole("admin"), deleteSection);

export default router;
