import { Campaign } from "../models/Campaign.model.js";
import { Contribution } from "../models/Contribution.model.js";
import {
  campaignSchema,
  campaignUpdateSchema,
  contributeSchema,
} from "../validation/campaign.schema.js";
import { ApiError } from "../middleware/errorHandler.js";
import { cached, revalidateTag } from "../lib/cache.js";
import { createStripeContributionSession } from "../lib/stripe.js";
import { initiateSslcommerzContributionSession } from "../lib/sslcommerz.js";

const TAG = "campaigns";

export async function listCampaigns(req, res, next) {
  try {
    const isAdmin = req.user?.role === "editor" || req.user?.role === "admin";
    const filter = isAdmin ? {} : { status: "published" };
    const campaigns = await cached(
      `campaigns:list:${isAdmin ? "all" : "published"}`,
      [TAG],
      () => Campaign.find(filter).sort({ createdAt: -1 }).lean()
    );
    res.json({ data: campaigns });
  } catch (err) {
    next(err);
  }
}

export async function getCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug }).lean();
    if (!campaign) throw new ApiError(404, "Campaign not found");
    const isAdmin = req.user?.role === "editor" || req.user?.role === "admin";
    if (campaign.status !== "published" && !isAdmin) {
      throw new ApiError(404, "Campaign not found");
    }
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req, res, next) {
  try {
    const parsed = campaignSchema.parse(req.body);
    const campaign = await Campaign.create(parsed);
    revalidateTag(TAG);
    res.status(201).json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function updateCampaign(req, res, next) {
  try {
    const parsed = campaignUpdateSchema.parse(req.body);
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, parsed, {
      new: true,
      runValidators: true,
    });
    if (!campaign) throw new ApiError(404, "Campaign not found");
    revalidateTag(TAG);
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function deleteCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) throw new ApiError(404, "Campaign not found");
    revalidateTag(TAG);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function contribute(req, res, next) {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug, status: "published" });
    if (!campaign) throw new ApiError(404, "Campaign not found");

    const parsed = contributeSchema.parse(req.body);
    const contribution = await Contribution.create({
      campaign: campaign._id,
      user: req.user.id,
      amount: parsed.amount,
      currency: campaign.currency,
      message: parsed.message,
      isAnonymous: parsed.isAnonymous,
      status: "pending",
      paymentProvider: parsed.paymentProvider,
    });

    if (parsed.paymentProvider === "stripe") {
      const session = await createStripeContributionSession(contribution, campaign);
      contribution.paymentRef = session.id;
      await contribution.save();
      return res.json({ data: { url: session.url, contributionId: contribution._id } });
    }

    contribution.paymentRef = `contrib_${contribution._id}`;
    await contribution.save();
    const gatewayUrl = await initiateSslcommerzContributionSession(contribution, campaign, {
      name: req.user.name,
      email: req.user.email,
    });
    res.json({ data: { url: gatewayUrl, contributionId: contribution._id } });
  } catch (err) {
    next(err);
  }
}

/** Public supporter wall for a campaign — hides anonymous contributors' names. */
export async function listContributions(req, res, next) {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug }).lean();
    if (!campaign) throw new ApiError(404, "Campaign not found");

    const contributions = await Contribution.find({
      campaign: campaign._id,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .lean();

    const data = contributions.map((c) => ({
      _id: c._id,
      amount: c.amount,
      currency: c.currency,
      message: c.message,
      createdAt: c.createdAt,
      name: c.isAnonymous ? "Anonymous" : c.user?.name || "Anonymous",
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
}
