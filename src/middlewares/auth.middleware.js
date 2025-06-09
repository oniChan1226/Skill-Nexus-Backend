import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


const verifyJwt = asyncHandler(async (req, res, next) => {

    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!accessToken) {
        throw new ApiError(401, "access denied, access token not provided");
    }

    const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedAccessToken?._id).select("-password -refreshToken");

    if(!user) {
        throw new ApiError(401, "either expired or invalid access token")
    }

    req.user = user;

    next();
});

export { verifyJwt };