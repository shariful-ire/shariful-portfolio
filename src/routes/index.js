import { Router } from "express";
import sectionRoutes from "./section.routes.js";
import themeRoutes from "./theme.routes.js";
import mediaRoutes from "./media.routes.js";
import blogRoutes from "./blog.routes.js";
import productRoutes from "./product.routes.js";
import couponRoutes from "./coupon.routes.js";
import orderRoutes from "./order.routes.js";
import campaignRoutes from "./campaign.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import notificationRoutes from "./notification.routes.js";

const router = Router();

router.get("/health", (req, res) => res.json({ ok: true }));
router.use("/sections", sectionRoutes);
router.use("/themes", themeRoutes);
router.use("/media", mediaRoutes);
router.use("/blog", blogRoutes);
router.use("/products", productRoutes);
router.use("/coupons", couponRoutes);
router.use("/orders", orderRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/notifications", notificationRoutes);

export default router;
