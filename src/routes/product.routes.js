import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getDigitalAssetUploadSignature,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", listProducts);
router.get("/:slug", getProduct);
router.post("/", requireAuth, requireRole("editor", "admin"), createProduct);
router.patch("/:id", requireAuth, requireRole("editor", "admin"), updateProduct);
router.delete("/:id", requireAuth, requireRole("admin"), deleteProduct);
router.post(
  "/upload/digital-asset-signature",
  requireAuth,
  requireRole("editor", "admin"),
  getDigitalAssetUploadSignature
);

export default router;
