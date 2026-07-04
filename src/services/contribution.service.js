import { Contribution } from "../models/Contribution.model.js";
import { Campaign } from "../models/Campaign.model.js";
import { notify } from "../lib/notify.js";

/** Marks a contribution paid and adds its amount to the campaign total. Idempotent. */
export async function markContributionPaid(contributionId) {
  const contribution = await Contribution.findById(contributionId);
  if (!contribution || contribution.status === "paid") return contribution;

  contribution.status = "paid";
  await contribution.save();

  const campaign = await Campaign.findByIdAndUpdate(
    contribution.campaign,
    { $inc: { raisedAmount: contribution.amount } },
    { new: true }
  );

  notify({
    type: "contribution",
    message: `New contribution to "${campaign?.title || "a campaign"}" — ${
      contribution.amount / 100
    } ${contribution.currency.toUpperCase()}`,
    link: "/dashboard/campaigns",
  });

  return contribution;
}
