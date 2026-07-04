import { BlogPost } from "../models/BlogPost.model.js";
import { Comment } from "../models/Comment.model.js";
import { Like } from "../models/Like.model.js";
import {
  blogPostSchema,
  blogPostUpdateSchema,
  commentSchema,
} from "../validation/blog.schema.js";
import { ApiError } from "../middleware/errorHandler.js";
import { cached, revalidateTag } from "../lib/cache.js";
import { notify } from "../lib/notify.js";

const TAG = "blog";

export async function listPosts(req, res, next) {
  try {
    const { limit } = req.query;
    const isAdmin = req.user?.role === "editor" || req.user?.role === "admin";
    const filter = isAdmin ? {} : { status: "published" };

    const posts = await cached(
      `blog:list:${isAdmin ? "all" : "published"}:${limit || ""}`,
      [TAG],
      () => {
        let query = BlogPost.find(filter).sort({ publishedAt: -1, createdAt: -1 });
        if (limit) query = query.limit(Number(limit));
        return query.lean();
      }
    );
    res.json({ data: posts });
  } catch (err) {
    next(err);
  }
}

export async function getPost(req, res, next) {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).lean();
    if (!post) throw new ApiError(404, "Post not found");
    const isAdmin = req.user?.role === "editor" || req.user?.role === "admin";
    if (post.status !== "published" && !isAdmin) {
      throw new ApiError(404, "Post not found");
    }
    res.json({ data: post });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req, res, next) {
  try {
    const parsed = blogPostSchema.parse(req.body);
    if (parsed.status === "published") parsed.publishedAt = new Date();
    const post = await BlogPost.create({ ...parsed, author: req.user.id });
    revalidateTag(TAG);
    res.status(201).json({ data: post });
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req, res, next) {
  try {
    const parsed = blogPostUpdateSchema.parse(req.body);
    if (parsed.status === "published") {
      const existing = await BlogPost.findById(req.params.id);
      if (existing && !existing.publishedAt) parsed.publishedAt = new Date();
    }
    const post = await BlogPost.findByIdAndUpdate(req.params.id, parsed, {
      new: true,
      runValidators: true,
    });
    if (!post) throw new ApiError(404, "Post not found");
    revalidateTag(TAG);
    res.json({ data: post });
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req, res, next) {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");
    await Comment.deleteMany({ targetType: "post", targetId: post._id });
    await Like.deleteMany({ targetType: "post", targetId: post._id });
    revalidateTag(TAG);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listComments(req, res, next) {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).lean();
    if (!post) throw new ApiError(404, "Post not found");
    const comments = await Comment.find({ targetType: "post", targetId: post._id })
      .sort({ createdAt: -1 })
      .populate("author", "name image")
      .lean();
    res.json({ data: comments });
  } catch (err) {
    next(err);
  }
}

export async function createComment(req, res, next) {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) throw new ApiError(404, "Post not found");
    const parsed = commentSchema.parse(req.body);
    const comment = await Comment.create({
      targetType: "post",
      targetId: post._id,
      author: req.user.id,
      body: parsed.body,
    });
    post.commentCount += 1;
    await post.save();
    const populated = await comment.populate("author", "name image");
    notify({
      type: "comment",
      message: `New comment on "${post.title}"`,
      link: `/dashboard/blog/${post._id}/edit`,
    });
    res.status(201).json({ data: populated });
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const isOwner = comment.author.toString() === req.user.id;
    const isModerator = req.user.role === "editor" || req.user.role === "admin";
    if (!isOwner && !isModerator) {
      throw new ApiError(403, "You can't delete this comment");
    }

    await comment.deleteOne();
    await BlogPost.findByIdAndUpdate(comment.targetId, { $inc: { commentCount: -1 } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** Toggles the current user's like on a post; returns the new liked state + count. */
export async function toggleLike(req, res, next) {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) throw new ApiError(404, "Post not found");

    const existing = await Like.findOne({
      targetType: "post",
      targetId: post._id,
      user: req.user.id,
    });

    if (existing) {
      await existing.deleteOne();
      post.likeCount = Math.max(0, post.likeCount - 1);
      await post.save();
      return res.json({ data: { liked: false, likeCount: post.likeCount } });
    }

    await Like.create({ targetType: "post", targetId: post._id, user: req.user.id });
    post.likeCount += 1;
    await post.save();
    res.json({ data: { liked: true, likeCount: post.likeCount } });
  } catch (err) {
    next(err);
  }
}

export async function getLikeStatus(req, res, next) {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).lean();
    if (!post) throw new ApiError(404, "Post not found");
    const liked = req.user
      ? Boolean(
          await Like.exists({
            targetType: "post",
            targetId: post._id,
            user: req.user.id,
          })
        )
      : false;
    res.json({ data: { liked, likeCount: post.likeCount } });
  } catch (err) {
    next(err);
  }
}
