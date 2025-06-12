import { User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(401, "Access denied, access token not provided");
  }

  let decodedAccessToken;
  try {
    decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decodedAccessToken?._id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(401, "User not found for this token");
  }

  req.user = user;
  next();
});

export { verifyJwt };