import mongoose from "mongoose";

const tradeRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    senderOfferedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skills",
      required: true,
    },
    receiverOfferedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skills",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    completedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  { timestamps: true }
);

export const TradeRequestModel = mongoose.model(
  "TradeRequests",
  tradeRequestSchema
);
