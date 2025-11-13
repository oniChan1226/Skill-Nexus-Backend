import mongoose from "mongoose";

const skillProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    offeredSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skills",
      },
    ],
    requiredSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skills",
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    totalExchanges: {
      type: Number,
      default: 0,
    },
    metrics: {
      pendingRequests: { type: Number, default: 0 },
      acceptedRequests: { type: Number, default: 0 },
      completedRequests: { type: Number, default: 0 },
      rejectedRequests: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const SkillProfileModel = mongoose.model(
  "SkillsProfile",
  skillProfileSchema
);
