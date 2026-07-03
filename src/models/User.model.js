import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Mirrors the `user` collection that BetterAuth's mongodb adapter manages.
 * Read-only convenience model for our own queries (e.g. admin user list,
 * populate refs) — never write auth-owned fields through this model;
 * mutate users via BetterAuth's own API instead.
 *
 * @typedef {"viewer"|"editor"|"admin"} Role
 */

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    image: String,
    role: {
      type: String,
      enum: ["viewer", "editor", "admin"],
      default: "viewer",
    },
  },
  { timestamps: true, strict: false, collection: "user" }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
