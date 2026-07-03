import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} ThemeTokens
 * @property {string} primary
 * @property {string} secondary
 * @property {string} accent
 * @property {string} base100
 * @property {string} base200
 * @property {string} base300
 * @property {string} heading
 * @property {string} body
 * @property {string} muted
 * @property {string} success
 * @property {string} warning
 * @property {string} error
 * @property {string} info
 */

const tokenSet = {
  primary: String,
  secondary: String,
  accent: String,
  base100: String,
  base200: String,
  base300: String,
  heading: String,
  body: String,
  muted: String,
  success: String,
  warning: String,
  error: String,
  info: String,
};

const themeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: false },
    fonts: {
      body: { type: String, default: "Inter" },
      heading: { type: String, default: "Inter" },
      mono: { type: String, default: "JetBrains Mono" },
    },
    radius: { type: Number, default: 10 },
    light: { type: tokenSet, required: true },
    dark: { type: tokenSet, required: true },
  },
  { timestamps: true }
);

export const Theme =
  mongoose.models.Theme || mongoose.model("Theme", themeSchema);
