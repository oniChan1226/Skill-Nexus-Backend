import { SkillModel } from "../../models/skill.model.js";
import { SkillProfileModel } from "../../models/skillProfile.model.js";
import { User } from "../../models/user.model.js";
import { ApiResponse, asyncHandler, ApiError } from "../../utils/index.js";

export const getMyOfferedSkills = asyncHandler(async (req, res) => {
    const { user } = req;

    const skillProfile = await SkillProfileModel.findOne({ userId: user._id });

    if (!skillProfile) {
        throw new ApiError(404, "Skill profile not found");
    }

    const offeredSkills = await SkillModel.find({
        _id: { $in: skillProfile.offeredSkills },
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { offeredSkills },
            "Offered skills retrieved successfully"
        )
    );
});

export const getMyRequiredSkills = asyncHandler(async (req, res) => {
    const { user } = req;

    const skillProfile = await SkillProfileModel.findOne({ userId: user._id });

    if (!skillProfile) {
        throw new ApiError(404, "Skill profile not found");
    }

    const requiredSkills = await SkillModel.find({
        _id: { $in: skillProfile.requiredSkills },
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { requiredSkills },
            "Required skills retrieved successfully"
        )
    );
});

export const addOfferedSkill = asyncHandler(async (req, res) => {
    const { user } = req;

    const skill = await SkillModel.create(req.body);

    const skillProfile = await SkillProfileModel.findOne({ userId: user._id });

    if (!skillProfile) {
        throw new ApiError(404, "Skill profile not found");
    }

    skillProfile.offeredSkills.push(skill._id);
    await skillProfile.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { skillProfile },
            "Skill added successfully"
        )
    );
});

export const addRequiredSkill = asyncHandler(async (req, res) => {
    const { user } = req;

    const skill = await SkillModel.create(req.body);

    const skillProfile = await SkillProfileModel.findOne({ userId: user._id });

    if (!skillProfile) {
        throw new ApiError(404, "Skill profile not found");
    }

    skillProfile.requiredSkills.push(skill._id);
    await skillProfile.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { skillProfile },
            "Skill added successfully"
        )
    );
});

export const getUsersForSkillTrading = asyncHandler(async (req, res) => {
    const { user } = req;
    const {
        offeredSkill,
        requiredSkill,
        proficiencyLevel,
        learningPriority,
        categories,
        country,
        city,
        minRating,
        sortBy = "rating",
        sortOrder = "desc",
        page = 1,
        limit = 10
    } = req.query;

    const skillProfileQuery = {
        userId: { $ne: user._id } // exclude current user
    };

    const pipeline = [
        { $match: skillProfileQuery },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                pipeline: [
                    { $project: { name: 1, profileImage: 1, profession: 1, address: 1 } }
                ],
                as: "userDetails"
            }
        },
        { $unwind: "$userDetails" },
        {
            $lookup: {
                from: "skills",
                localField: "offeredSkills",
                foreignField: "_id",
                pipeline: [
                    { $project: { name: 1, proficiencyLevel: 1, categories: 1 } }
                ],
                as: "offeredSkillsDetails"
            }
        },
        {
            $lookup: {
                from: "skills",
                localField: "requiredSkills",
                foreignField: "_id",
                pipeline: [
                    { $project: { name: 1, proficiencyLevel: 1, categories: 1 } }
                ],
                as: "requiredSkillsDetails"
            }
        }
    ];

    // --- Dynamic filters ---
    if (offeredSkill) {
        pipeline.push({
            $match: {
                "offeredSkillsDetails.name": { $regex: offeredSkill, $options: "i" }
            }
        });
    }

    if (requiredSkill) {
        pipeline.push({
            $match: {
                "requiredSkillsDetails.name": { $regex: requiredSkill, $options: "i" }
            }
        });
    }

    if (proficiencyLevel) {
        pipeline.push({
            $match: {
                "offeredSkillsDetails.proficiencyLevel": proficiencyLevel
            }
        });
    }

    if (learningPriority) {
        pipeline.push({
            $match: {
                "requiredSkillsDetails.learningPriority": learningPriority
            }
        });
    }

    if (categories) {
        const categoryArray = categories.split(",").map(cat => cat.trim());
        pipeline.push({
            $match: {
                $or: [
                    { "offeredSkillsDetails.categories": { $in: categoryArray } },
                    { "requiredSkillsDetails.categories": { $in: categoryArray } }
                ]
            }
        });
    }

    if (country) {
        pipeline.push({
            $match: {
                "userDetails.address.country": { $regex: country, $options: "i" }
            }
        });
    }

    if (city) {
        pipeline.push({
            $match: {
                "userDetails.address.city": { $regex: city, $options: "i" }
            }
        });
    }

    if (minRating) {
        pipeline.push({
            $match: {
                rating: { $gte: parseFloat(minRating) }
            }
        });
    }

    // --- Projection ---
    pipeline.push({
        $project: {
            _id: 1,
            rating: 1,
            totalExchanges: 1,
            createdAt: 1,
            user: {
                _id: "$userDetails._id",
                name: "$userDetails.name",
                profileImage: "$userDetails.profileImage",
                profession: "$userDetails.profession",
                address: "$userDetails.address"
            },
            offeredSkills: "$offeredSkillsDetails",
            requiredSkills: "$requiredSkillsDetails"
        }
    });

    // --- Sorting ---
    const sortOptions = {};
    switch (sortBy) {
        case "rating":
            sortOptions.rating = sortOrder === "asc" ? 1 : -1;
            break;
        case "totalExchanges":
            sortOptions.totalExchanges = sortOrder === "asc" ? 1 : -1;
            break;
        case "createdAt":
            sortOptions.createdAt = sortOrder === "asc" ? 1 : -1;
            break;
        default:
            sortOptions.rating = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // --- FACET Pagination ---
    pipeline.push({
        $facet: {
            data: [
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ],
            totalCount: [
                { $count: "total" }
            ]
        }
    });

    const result = await SkillProfileModel.aggregate(pipeline);

    const users = result[0]?.data || [];
    const totalCount = result[0]?.totalCount[0]?.total || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalUsers: totalCount
                }
            },
            "Users for skill trading retrieved successfully"
        )
    );
});

export const getUserDetailsForTrading = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const skillProfile = await SkillProfileModel.findById(id)
    .populate('userId', 'name profileImage profession address')
    .populate('offeredSkills')
    .populate('requiredSkills')
    .lean();

    if (!skillProfile) {
        throw new ApiError(404, "Skill profile not found for the user");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { skillProfile },
            "User details retrieved successfully"
        )
    );
});