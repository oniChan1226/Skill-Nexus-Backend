import { SkillModel } from "../../models/skill.model.js";
import { SkillProfileModel } from "../../models/skillProfile.model.js";
import { ApiResponse, asyncHandler } from "../../utils/index.js";

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