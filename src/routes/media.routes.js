import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import {
  listMedia,
  getUploadSignature,
  createMediaAsset,
  deleteMediaAsset,
} from "../controllers/media.controller.js";

const router = Router();

router.get("/", requireAuth, requireRole("editor", "admin"), listMedia);
router.post(
  "/sign",
  requireAuth,
  requireRole("editor", "admin"),
  getUploadSignature
);
router.post(
  "/",
  requireAuth,
  requireRole("editor", "admin"),
  createMediaAsset
);
router.delete("/:id", requireAuth, requireRole("admin"), deleteMediaAsset);

export default router;
