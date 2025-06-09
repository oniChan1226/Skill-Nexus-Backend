import { User } from "../../models/index.js";
import { getAvailableSuggestions } from "../../utils/helpers.js";
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

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    }).lean();

    if (existingUser) {
        let message = "User already exists with this ";
        let suggestions = [];
        if (existingUser.email === email && existingUser.username === username) {
            message += "email and username";
        } else if (existingUser.email === email) {
            message += "email";
        } else {
            message += "username";
            suggestions = await getAvailableSuggestions(username, 3);
            throw new ApiError(409, message, suggestions);
        }

        throw new ApiError(409, message);
    }

    const user = await User.create({ ...req.body });

    return res.status(201).json(
        new ApiResponse(
            201,
            { user },
            "Registered successfully"
        )
    );
});

const login = asyncHandler(async (req, res) => {
    const { credential, password } = req.body;

    if (!credential || !password) {
        throw new ApiError(400, "Credential and password are required");
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credential);

    const user = await User.findOne(isEmail ? { email: credential } : { username: credential });

    if (!user) {
        throw new ApiError(404, "Invalid username or email");
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

const validateUsername = asyncHandler(async (req, res) => {
    const { username } = req.query;

    const existingUser = await User.findOne({ username }).lean();
    const isAvailable = !existingUser;
    let suggestions = [];

    if (!isAvailable) {
        suggestions = generateUsernameSuggestions(username, 3);
        const availableSuggestions = await Promise.all(
            suggestions.map(async (suggestion) => {
                const user = await User.findOne({ username: suggestion }).lean();
                return user ? null : suggestion;
            })
        );

        suggestions = [...new Set(availableSuggestions.filter(Boolean))].slice(0, 3);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                available: isAvailable,
                suggestions: isAvailable ? [] : suggestions,
            },
            "Checked successfully"
        )
    );
});

export {
    refreshAccessToken,
    signup,
    login,
    logOut,
    me,
    validateUsername,
};