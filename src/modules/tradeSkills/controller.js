import { TradeRequestModel } from "../../models/tradeRequest.model.js";
import { ApiResponse, ApiError, asyncHandler } from "../../utils/index.js";

/**
 * @desc Create a new barter (two-way) trade request
 * @route POST /api/v1/trades
 */
export const createTradeRequest = asyncHandler(async (req, res) => {
  const { receiverId, senderOfferedSkillId, receiverOfferedSkillId, message } =
    req.body;
  const senderId = req.user._id;

  if (!receiverId || !senderOfferedSkillId || !receiverOfferedSkillId) {
    throw new ApiError(400, "Missing required fields");
  }

  if (receiverId.toString() === senderId.toString()) {
    throw new ApiError(400, "You cannot trade with yourself");
  }

  // Prevent duplicate pending requests between same users
  const existing = await TradeRequestModel.findOne({
    sender: senderId,
    receiver: receiverId,
    senderOfferedSkill: senderOfferedSkillId,
    receiverOfferedSkill: receiverOfferedSkillId,
    status: "pending",
  });
  if (existing) throw new ApiError(400, "A pending trade already exists");

  const trade = await TradeRequestModel.create({
    sender: senderId,
    receiver: receiverId,
    senderOfferedSkill: senderOfferedSkillId,
    receiverOfferedSkill: receiverOfferedSkillId,
    message,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, trade, "Trade request created successfully"));
});

/**
 * @desc Get all trades initiated by the logged-in user
 * @route GET /api/v1/trades/sent
 */
export const getSentTradeRequests = asyncHandler(async (req, res) => {
  const trades = await TradeRequestModel.find({ sender: req.user._id })
    .populate("receiver", "name profileImage")
    .populate("senderOfferedSkill", "name")
    .populate("receiverOfferedSkill", "name")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, trades, "Sent trades retrieved"));
});

/**
 * @desc Get all trades received by the logged-in user
 * @route GET /api/v1/trades/received
 */
export const getReceivedTradeRequests = asyncHandler(async (req, res) => {
  const trades = await TradeRequestModel.find({ receiver: req.user._id })
    .populate("sender", "name profileImage")
    .populate("senderOfferedSkill", "name")
    .populate("receiverOfferedSkill", "name")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, trades, "Received trades retrieved"));
});

/**
 * @desc Update trade status (accept/reject/complete)
 * @route PATCH /api/v1/trades/:id/status
 */
export const updateTradeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user._id;

  const trade = await TradeRequestModel.findById(id);
  if (!trade) throw new ApiError(404, "Trade not found");

  if (
    ![trade.sender.toString(), trade.receiver.toString()].includes(
      userId.toString()
    )
  ) {
    throw new ApiError(403, "Not authorized");
  }

  if (!["accepted", "rejected", "completed"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  if (status === "accepted" || status === "rejected") {
    trade.status = status;
  }

  if (status === "completed") {
    if (!trade.completedBy.includes(userId)) {
      trade.completedBy.push(userId);
    }

    if (
      trade.completedBy.length === 2 &&
      trade.completedBy.includes(trade.sender) &&
      trade.completedBy.includes(trade.receiver)
    ) {
      trade.status = "completed";
    }
  }

  await trade.save();

  return res
    .status(200)
    .json(new ApiResponse(200, trade, "Trade updated successfully"));
});
