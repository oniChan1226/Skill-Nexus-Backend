import { SkillModel } from "../../models/skill.model.js";
import { SkillProfileModel } from "../../models/skillProfile.model.js";
import { asyncHandler } from "../../utils/index.js";


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