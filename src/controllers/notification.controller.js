import { Notification } from "../models/Notification.model.js";

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const data = notifications.map((n) => ({
      ...n,
      isRead: n.readBy.some((id) => id.toString() === req.user.id),
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user.id },
    });
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany({}, { $addToSet: { readBy: req.user.id } });
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
}
