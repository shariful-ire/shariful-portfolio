import { Coupon } from "../models/Coupon.model.js";
import { couponSchema, couponUpdateSchema } from "../validation/coupon.schema.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function listCoupons(req, res, next) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json({ data: coupons });
  } catch (err) {
    next(err);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const parsed = couponSchema.parse(req.body);
    const coupon = await Coupon.create(parsed);
    res.status(201).json({ data: coupon });
  } catch (err) {
    next(err);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const parsed = couponUpdateSchema.parse(req.body);
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, parsed, {
      new: true,
      runValidators: true,
    });
    if (!coupon) throw new ApiError(404, "Coupon not found");
    res.json({ data: coupon });
  } catch (err) {
    next(err);
  }
}

export async function deleteCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new ApiError(404, "Coupon not found");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** Public validity check — used by the cart to preview a discount before checkout. */
export async function validateCoupon(req, res, next) {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });

    if (!coupon || !coupon.isActive) throw new ApiError(400, "Invalid coupon code");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new ApiError(400, "Coupon has expired");
    }
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      throw new ApiError(400, "Coupon has reached its usage limit");
    }

    const discountAmount =
      coupon.discountType === "percent"
        ? Math.round((Number(subtotal) * coupon.discountValue) / 100)
        : Math.min(coupon.discountValue, Number(subtotal));

    res.json({ data: { valid: true, discountAmount } });
  } catch (err) {
    next(err);
  }
}
