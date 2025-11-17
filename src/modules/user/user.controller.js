import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { User } from "../../models/index.js";


export const updateUserProfile = asyncHandler(async (req, res) => {
    const { user: existingUser } = req;
    console.log(req.body);
    const user = await User.findByIdAndUpdate(existingUser._id, req.body, { new: true });
    if (!user) {
        throw new ApiError(404, "User now found")
    }
    return res.status(200).json(new ApiResponse(200, user.toJSON(), "User updated successfully"));
});

