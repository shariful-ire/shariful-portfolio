import { Theme } from "../models/Theme.model.js";
import { themeSchema, themeUpdateSchema } from "../validation/theme.schema.js";
import { ApiError } from "../middleware/errorHandler.js";
import { cached, revalidateTag } from "../lib/cache.js";

const ACTIVE_KEY = "theme:active";
const TAG = "theme";

export async function listThemes(req, res, next) {
  try {
    const themes = await Theme.find().lean();
    res.json({ data: themes });
  } catch (err) {
    next(err);
  }
}

export async function getActiveTheme(req, res, next) {
  try {
    const theme = await cached(ACTIVE_KEY, [TAG], () =>
      Theme.findOne({ isActive: true }).lean()
    );
    if (!theme) throw new ApiError(404, "No active theme configured");
    res.json({ data: theme });
  } catch (err) {
    next(err);
  }
}

export async function createTheme(req, res, next) {
  try {
    const parsed = themeSchema.parse(req.body);
    const theme = await Theme.create(parsed);
    revalidateTag(TAG);
    res.status(201).json({ data: theme });
  } catch (err) {
    next(err);
  }
}

export async function updateTheme(req, res, next) {
  try {
    const parsed = themeUpdateSchema.parse(req.body);
    const theme = await Theme.findByIdAndUpdate(req.params.id, parsed, {
      new: true,
      runValidators: true,
    });
    if (!theme) throw new ApiError(404, "Theme not found");
    revalidateTag(TAG);
    res.json({ data: theme });
  } catch (err) {
    next(err);
  }
}

/** Marks one theme active and deactivates all others. */
export async function activateTheme(req, res, next) {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) throw new ApiError(404, "Theme not found");
    await Theme.updateMany({}, { isActive: false });
    theme.isActive = true;
    await theme.save();
    revalidateTag(TAG);
    res.json({ data: theme });
  } catch (err) {
    next(err);
  }
}

export async function deleteTheme(req, res, next) {
  try {
    const theme = await Theme.findByIdAndDelete(req.params.id);
    if (!theme) throw new ApiError(404, "Theme not found");
    revalidateTag(TAG);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
