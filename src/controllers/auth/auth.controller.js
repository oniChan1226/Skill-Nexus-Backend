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

        await userInstance.save({ validateBeforeSave: false }).catch((error) => {
            throw new ApiError(500, error?.message || "Failed to save refresh token");
        });

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

    const { email, username } = req.body;

    const doesUserExist = await User.findOne({
        $or: [{ email }, { username }]
    }).lean();

    if (doesUserExist) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    const user = await User.create({ ...req.body });

    return res.status(201)
        .json(
            new ApiResponse(
                201,
                { user: user },
                "Registered successfully",
            )
        );
});

const login = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;

    if (!email && !username) throw new ApiError(400, "Either email or username is required");

    const user = await User.findOne({
        $or: [
            email ? { email } : null,
            username ? { username } : null,
        ].filter(Boolean),
    });

    if (!user) {
        throw new ApiError(404, "No user found against this email or username");
    }

    const doesPasswordMatch = await user.isPasswordCorrect(password);

    if (!doesPasswordMatch) {
        throw new ApiError(401, "Invalid password");
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user?._id);

    return res.status(200)
        .cookie("accessToken", accessToken, { ...options })
        .cookie("refreshToken", refreshToken, { ...options })
        .json(
            new ApiResponse(
                200,
                { user: user },
                "Logged in successfully",
            )
        );
});

const logOut = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req?.user?.id,
        {
            $unset: { refreshToken: 1 },
        },
        {new: true}
    );

    if(!user) {
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

export {
    refreshAccessToken,
    signup,
    login,
    logOut,
};