import jwt from "jsonwebtoken";
import { User } from "../../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js"

const options = {
    httpOnly: true,
    secure: false,
};

const generateAccessAndRefreshToken = async function (userId) {
    try {
        const userInstance = await User.findById(userId);
        const accessToken = await userInstance.generateAccessToken();
        const refreshToken = await userInstance.generateRefreshToken();

        userInstance.refreshToken = refreshToken;

        await userInstance.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to generate tokens");
    }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(400, "no token provided");
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "refresh token expired or invalid")
    }

    const user = await User.findById(decodedToken._id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "token verification failed");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken
                },
                "tokens refreshed successfully"
            )
        );

});

const signup = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const existingUser = await User.findOne({
        email: email,
    }).lean();

    if (existingUser) {
        throw new ApiError(409, "User already exists with this email");
    }

    const user = await User.create({ ...req.body });

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res.status(201)
        .cookie("accessToken", accessToken, { ...options })
        .cookie("refreshToken", refreshToken, { ...options })
        .json(
            new ApiResponse(
                201,
                { user },
                "Registered successfully"
            )
        );
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({email: email});

    if (!user) {
        throw new ApiError(404, "User not found with specified Email");
    }

    const doesPasswordMatch = await user.isPasswordCorrect(password);
    if (!doesPasswordMatch) {
        throw new ApiError(401, "Invalid password");
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...options })
        .cookie("refreshToken", refreshToken, { ...options })
        .json(
            new ApiResponse(200, { user }, "Logged in successfully")
        );
});

const logOut = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req?.user?.id,
        {
            $unset: { refreshToken: 1 },
        },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, "user not found")
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
        new ApiResponse(
            200,
            {},
            "Logged out successfully"
        )
    );
});

const me = asyncHandler(async (req, res) => {
    const { user } = req;

    return res.status(200).json(
        new ApiResponse(
            200,
            { user },
            "User fetched successfully"
        )
    );
});

export {
    refreshAccessToken,
    signup,
    login,
    logOut,
    me,
};