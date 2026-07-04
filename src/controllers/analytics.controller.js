import { z } from "zod";
import { PageView } from "../models/PageView.model.js";

const pageViewSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional(),
});

/** Public, unauthenticated — fired by the frontend on every route change. */
export async function trackPageView(req, res, next) {
  try {
    const parsed = pageViewSchema.parse(req.body);
    await PageView.create(parsed);
    res.status(201).json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
}

/** Admin-only aggregate view for the analytics dashboard. */
export async function getAnalyticsSummary(req, res, next) {
  try {
    const days = Math.min(Number(req.query.days) || 30, 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalViews, viewsByDay, topPaths] = await Promise.all([
      PageView.countDocuments({ createdAt: { $gte: since } }),
      PageView.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      PageView.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      data: {
        totalViews,
        viewsByDay: viewsByDay.map((d) => ({ date: d._id, count: d.count })),
        topPaths: topPaths.map((p) => ({ path: p._id, count: p.count })),
      },
    });
  } catch (err) {
    next(err);
  }
}
