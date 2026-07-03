import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { Theme } from "../models/Theme.model.js";

/** Default "Midnight Indigo" design tokens, per the PortfolioOS brief. */
const midnightIndigo = {
  name: "Midnight Indigo",
  isActive: true,
  fonts: { body: "Inter", heading: "Inter", mono: "JetBrains Mono" },
  radius: 10,
  light: {
    primary: "#4F46E5",
    secondary: "#64748B",
    accent: "#06B6D4",
    base100: "#F8FAFC",
    base200: "#FFFFFF",
    base300: "#E2E8F0",
    heading: "#0F172A",
    body: "#334155",
    muted: "#64748B",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  dark: {
    primary: "#6366F1",
    secondary: "#94A3B8",
    accent: "#22D3EE",
    base100: "#0B1120",
    base200: "#1E293B",
    base300: "#334155",
    heading: "#F1F5F9",
    body: "#CBD5E1",
    muted: "#94A3B8",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
};

async function run() {
  await connectDB();
  await Theme.updateMany({}, { isActive: false });
  const theme = await Theme.findOneAndUpdate(
    { name: midnightIndigo.name },
    midnightIndigo,
    { upsert: true, new: true }
  );
  console.log(`[seed] active theme -> ${theme.name}`);
  await disconnectDB();
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
