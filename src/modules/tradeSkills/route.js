import express from "express";
import { createTradeRequest, getSentTradeRequests } from "./controller.js";
import { getReceivedTradeRequests } from "./controller.js";
import { updateTradeStatus } from "./controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ✅ All routes below require authentication
router.use(verifyJwt);

/**
 * @route POST /api/trades
 * @desc Create a new skill trade (barter) request
 */
router.post("/", createTradeRequest);

/**
 * @route GET /api/trades/sent
 * @desc Get all trade requests the user has sent
 */
router.get("/sent", getSentTradeRequests);

/**
 * @route GET /api/trades/received
 * @desc Get all trade requests the user has received
 */
router.get("/received", getReceivedTradeRequests);

/**
 * @route GET /api/trades/:id
 * @desc Get detailed info for a single trade request
 */

/**
 * @route PATCH /api/trades/:id/status
 * @desc Accept / Reject / Complete a trade request
 */
router.patch("/:id/status", updateTradeStatus);

export default router;
