import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/rbac.js";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  listComments,
  createComment,
  deleteComment,
  toggleLike,
  getLikeStatus,
} from "../controllers/blog.controller.js";

const router = Router();

router.get("/", listPosts);
router.get("/:slug", getPost);
router.post("/", requireAuth, requireRole("editor", "admin"), createPost);
router.patch("/:id", requireAuth, requireRole("editor", "admin"), updatePost);
router.delete("/:id", requireAuth, requireRole("admin"), deletePost);

router.get("/:slug/comments", listComments);
router.post("/:slug/comments", requireAuth, createComment);
router.delete("/comments/:commentId", requireAuth, deleteComment);

router.get("/:slug/like", getLikeStatus);
router.post("/:slug/like", requireAuth, toggleLike);

export default router;
