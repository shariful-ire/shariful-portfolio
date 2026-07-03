import { Section } from "../models/Section.model.js";
import {
  parseSectionInput,
  parseSectionUpdate,
} from "../validation/section.schema.js";
import { ApiError } from "../middleware/errorHandler.js";
import { cached, revalidateTag } from "../lib/cache.js";

const LIST_KEY = "sections:list";
const TAG = "sections";

export async function listSections(req, res, next) {
  try {
    const sections = await cached(LIST_KEY, [TAG], () =>
      Section.find().sort({ order: 1 }).lean()
    );
    res.json({ data: sections });
  } catch (err) {
    next(err);
  }
}

export async function getSection(req, res, next) {
  try {
    const section = await Section.findOne({ slug: req.params.slug }).lean();
    if (!section) throw new ApiError(404, "Section not found");
    res.json({ data: section });
  } catch (err) {
    next(err);
  }
}

export async function createSection(req, res, next) {
  try {
    const parsed = parseSectionInput(req.body);
    const section = await Section.create(parsed);
    revalidateTag(TAG);
    res.status(201).json({ data: section });
  } catch (err) {
    next(err);
  }
}

export async function updateSection(req, res, next) {
  try {
    const parsed = parseSectionUpdate(req.body);
    const section = await Section.findByIdAndUpdate(req.params.id, parsed, {
      new: true,
      runValidators: true,
    });
    if (!section) throw new ApiError(404, "Section not found");
    revalidateTag(TAG);
    res.json({ data: section });
  } catch (err) {
    next(err);
  }
}

export async function deleteSection(req, res, next) {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) throw new ApiError(404, "Section not found");
    revalidateTag(TAG);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * Bulk reorder: body = [{ id, order }, ...]
 */
export async function reorderSections(req, res, next) {
  try {
    const updates = req.body;
    if (!Array.isArray(updates)) {
      throw new ApiError(400, "Expected an array of { id, order }");
    }
    await Promise.all(
      updates.map(({ id, order }) =>
        Section.findByIdAndUpdate(id, { order })
      )
    );
    revalidateTag(TAG);
    const sections = await Section.find().sort({ order: 1 }).lean();
    res.json({ data: sections });
  } catch (err) {
    next(err);
  }
}
