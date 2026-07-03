import { Router } from "express";
import sectionRoutes from "./section.routes.js";
import themeRoutes from "./theme.routes.js";
import mediaRoutes from "./media.routes.js";

const router = Router();

router.get("/health", (req, res) => res.json({ ok: true }));
router.use("/sections", sectionRoutes);
router.use("/themes", themeRoutes);
router.use("/media", mediaRoutes);

export default router;
