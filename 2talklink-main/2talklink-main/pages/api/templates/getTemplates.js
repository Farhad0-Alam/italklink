

import mongoose from "mongoose";
import campaignModal from "../../../models/Campaign";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests are allowed" });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ message: "Slug is required" });
  }

  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.mongodburl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const campaign = await campaignModal.findOne({ slug });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(200).json(campaign.profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
}
