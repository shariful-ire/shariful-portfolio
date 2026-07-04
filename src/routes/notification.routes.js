import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(requireAuth, requireRole("editor", "admin"));
router.get("/", listNotifications);
router.post("/read-all", markAllNotificationsRead);
router.post("/:id/read", markNotificationRead);

export default router;
