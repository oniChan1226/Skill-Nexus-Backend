import { asyncHandler, ApiResponse, ApiError } from "../../utils/index.js";
import { SkillProfileModel } from "../../models/skillProfile.model.js";
import { SkillModel } from "../../models/skill.model.js";
import { User } from "../../models/user.model.js";
import AIService from "../../services/ai.service.js";
import CustomAIService from "../../services/customAI.service.js";

// Initialize custom AI service
const customAI = new CustomAIService();

/**
 * Get AI-powered skill match between current user and a specific user
 * POST /api/v1/ai/match-score/:userId
 */
export const getSkillMatchScore = asyncHandler(async (req, res) => {
    const { user } = req;
    const { userId } = req.params;

    // Get current user's skill profile
    const currentUserProfile = await SkillProfileModel.findOne({ userId: user._id })
        .populate("offeredSkills")
        .populate("requiredSkills");

    if (!currentUserProfile) {
        throw new ApiError(404, "Your skill profile not found");
    }

    // Get other user's skill profile
    const otherUserProfile = await SkillProfileModel.findOne({ userId })
        .populate("offeredSkills")
        .populate("requiredSkills")
        .populate("userId");

    if (!otherUserProfile) {
        throw new ApiError(404, "User skill profile not found");
    }

    // Calculate bidirectional match
    const matchResult = await AIService.calculateBidirectionalMatch(
        {
            offered: currentUserProfile.offeredSkills,
            required: currentUserProfile.requiredSkills
        },
        {
            offered: otherUserProfile.offeredSkills,
            required: otherUserProfile.requiredSkills
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: {
                    id: otherUserProfile.userId._id,
                    name: otherUserProfile.userId.name,
                    profession: otherUserProfile.userId.profession
                },
                match: matchResult
            },
            "Skill match calculated successfully"
        )
    );
});

/**
 * Get AI-powered recommendations for users to connect with
 * GET /api/v1/ai/recommended-users
 */
export const getRecommendedUsers = asyncHandler(async (req, res) => {
    const { user } = req;
    const { limit = 10 } = req.query;

    // Get current user's profile and skills
    const currentUserProfile = await SkillProfileModel.findOne({ userId: user._id })
        .populate("offeredSkills")
        .populate("requiredSkills");

    if (!currentUserProfile) {
        throw new ApiError(404, "Your skill profile not found");
    }

    // Get all other users with their profiles
    const otherUsers = await SkillProfileModel.find({
        userId: { $ne: user._id }
    })
        .populate("offeredSkills")
        .populate("requiredSkills")
        .populate("userId")
        .limit(50); // Get top 50 to rank

    if (otherUsers.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, { users: [] }, "No users found")
        );
    }

    // Rank users using AI
    const rankedUsers = [];
    
    for (const otherUser of otherUsers) {
        const skillMatch = await AIService.calculateBidirectionalMatch(
            {
                offered: currentUserProfile.offeredSkills,
                required: currentUserProfile.requiredSkills
            },
            {
                offered: otherUser.offeredSkills,
                required: otherUser.requiredSkills
            }
        );

        const score = await AIService.calculateUserScore(
            {
                offeredSkills: currentUserProfile.offeredSkills,
                requiredSkills: currentUserProfile.requiredSkills,
                address: user.address
            },
            {
                offeredSkills: otherUser.offeredSkills,
                requiredSkills: otherUser.requiredSkills,
                rating: otherUser.rating,
                totalExchanges: otherUser.totalExchanges,
                metrics: otherUser.metrics,
                user: otherUser.userId
            }
        );

        rankedUsers.push({
            user: {
                id: otherUser.userId._id,
                name: otherUser.userId.name,
                email: otherUser.userId.email,
                profession: otherUser.userId.profession,
                profileImage: otherUser.userId.profileImage,
                bio: otherUser.userId.bio,
                address: otherUser.userId.address,
                socialLinks: otherUser.userId.socialLinks
            },
            skillProfile: {
                rating: otherUser.rating,
                totalExchanges: otherUser.totalExchanges,
                offeredSkills: otherUser.offeredSkills,
                requiredSkills: otherUser.requiredSkills
            },
            aiScore: score,
            matchPercentage: skillMatch.matchPercentage,
            canTeach: skillMatch.canTeach,
            canLearn: skillMatch.canLearn,
            isMutualMatch: skillMatch.isMutualMatch,
            recommendation: AIService.getRecommendationText(score)
        });
    }

    // Sort by AI score and limit
    rankedUsers.sort((a, b) => b.aiScore - a.aiScore);
    const topUsers = rankedUsers.slice(0, parseInt(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            { users: topUsers },
            "AI-recommended users retrieved successfully"
        )
    );
});

/**
 * Get AI-powered skill recommendations for learning
 * GET /api/v1/ai/skill-recommendations
 */
export const getSkillRecommendations = asyncHandler(async (req, res) => {
    const { user } = req;

    // Get user's profile and skills
    const userProfile = await SkillProfileModel.findOne({ userId: user._id })
        .populate("offeredSkills")
        .populate("requiredSkills");

    if (!userProfile) {
        throw new ApiError(404, "Skill profile not found");
    }

    // Get user details
    const userDetails = await User.findById(user._id);

    // Generate AI recommendations
    const recommendations = await AIService.generateSkillRecommendations(
        {
            profession: userDetails.profession,
            bio: userDetails.bio
        },
        {
            offered: userProfile.offeredSkills,
            required: userProfile.requiredSkills
        }
    );

    // Generate learning path
    const learningPath = AIService.generateLearningPath(
        userProfile.offeredSkills,
        userProfile.requiredSkills
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                recommendations,
                learningPath,
                currentSkills: {
                    offered: userProfile.offeredSkills.length,
                    required: userProfile.requiredSkills.length
                }
            },
            "Skill recommendations generated successfully"
        )
    );
});

/**
 * Analyze user profile with AI insights
 * GET /api/v1/ai/profile-analysis
 */
export const analyzeProfile = asyncHandler(async (req, res) => {
    const { user } = req;

    // Get user profile
    const userProfile = await SkillProfileModel.findOne({ userId: user._id })
        .populate("offeredSkills")
        .populate("requiredSkills");

    if (!userProfile) {
        throw new ApiError(404, "Skill profile not found");
    }

    // Analyze profile sentiment
    const analysis = await AIService.analyzeProfile({
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks
    });

    // Calculate profile completeness
    const completeness = {
        bio: user.bio ? 15 : 0,
        profileImage: user.profileImage ? 15 : 0,
        address: user.address?.city && user.address?.country ? 10 : 0,
        profession: user.profession ? 10 : 0,
        socialLinks: Object.values(user.socialLinks || {}).filter(link => link).length * 5,
        offeredSkills: Math.min(userProfile.offeredSkills.length * 5, 25),
        requiredSkills: Math.min(userProfile.requiredSkills.length * 5, 20)
    };

    const totalCompleteness = Object.values(completeness).reduce((sum, val) => sum + val, 0);

    // Generate suggestions
    const suggestions = [];
    if (completeness.bio === 0) suggestions.push("Add a bio to tell others about yourself");
    if (completeness.profileImage === 0) suggestions.push("Upload a profile picture");
    if (completeness.address === 0) suggestions.push("Add your location to find local skill traders");
    if (completeness.profession === 0) suggestions.push("Specify your profession");
    if (completeness.socialLinks < 10) suggestions.push("Add more social links (GitHub, LinkedIn, etc.)");
    if (completeness.offeredSkills < 15) suggestions.push("Add more skills you can teach");
    if (completeness.requiredSkills < 10) suggestions.push("Add more skills you want to learn");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                profileStrength: totalCompleteness,
                completeness,
                sentiment: analysis,
                suggestions,
                stats: {
                    rating: userProfile.rating,
                    totalExchanges: userProfile.totalExchanges,
                    offeredSkills: userProfile.offeredSkills.length,
                    requiredSkills: userProfile.requiredSkills.length
                }
            },
            "Profile analysis completed"
        )
    );
});

/**
 * Find best matches for a specific skill
 * GET /api/v1/ai/find-teachers/:skillName
 */
export const findTeachersForSkill = asyncHandler(async (req, res) => {
    const { skillName } = req.params;
    const { limit = 10 } = req.query;

    // Find all users who offer this skill
    const skills = await SkillModel.find({
        name: { $regex: skillName, $options: "i" }
    });

    if (skills.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, { teachers: [] }, "No teachers found for this skill")
        );
    }

    const skillIds = skills.map(s => s._id);

    // Find skill profiles with these skills
    const profiles = await SkillProfileModel.find({
        offeredSkills: { $in: skillIds }
    })
        .populate("offeredSkills")
        .populate("requiredSkills")
        .populate("userId");

    // Rank by proficiency and rating
    const rankedTeachers = profiles
        .map(profile => {
            const matchingSkill = profile.offeredSkills.find(
                s => skillIds.some(id => id.equals(s._id))
            );

            const proficiencyScore = {
                expert: 3,
                intermediate: 2,
                beginner: 1
            }[matchingSkill.proficiencyLevel] || 0;

            const score = (proficiencyScore * 30) + (profile.rating * 14) + (Math.min(profile.totalExchanges, 10) * 2);

            return {
                user: {
                    id: profile.userId._id,
                    name: profile.userId.name,
                    profession: profile.userId.profession,
                    profileImage: profile.userId.profileImage,
                    bio: profile.userId.bio,
                    address: profile.userId.address
                },
                skill: {
                    name: matchingSkill.name,
                    proficiencyLevel: matchingSkill.proficiencyLevel,
                    description: matchingSkill.description
                },
                rating: profile.rating,
                totalExchanges: profile.totalExchanges,
                teacherScore: score
            };
        })
        .sort((a, b) => b.teacherScore - a.teacherScore)
        .slice(0, parseInt(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            { teachers: rankedTeachers },
            "Teachers found successfully"
        )
    );
});

/**
 * Get mutual skill matches (skills both users can teach each other)
 * GET /api/v1/ai/mutual-matches
 */
export const getMutualMatches = asyncHandler(async (req, res) => {
    const { user } = req;
    const { limit = 20 } = req.query;

    // Get current user's profile
    const currentUserProfile = await SkillProfileModel.findOne({ userId: user._id })
        .populate("offeredSkills")
        .populate("requiredSkills");

    if (!currentUserProfile) {
        throw new ApiError(404, "Your skill profile not found");
    }

    // Find users where there's mutual benefit
    const allProfiles = await SkillProfileModel.find({
        userId: { $ne: user._id }
    })
        .populate("offeredSkills")
        .populate("requiredSkills")
        .populate("userId");

    const mutualMatches = [];

    for (const profile of allProfiles) {
        const match = await AIService.calculateBidirectionalMatch(
            {
                offered: currentUserProfile.offeredSkills,
                required: currentUserProfile.requiredSkills
            },
            {
                offered: profile.offeredSkills,
                required: profile.requiredSkills
            }
        );

        if (match.isMutualMatch && match.overallScore > 0.5) {
            mutualMatches.push({
                user: {
                    id: profile.userId._id,
                    name: profile.userId.name,
                    profession: profile.userId.profession,
                    profileImage: profile.userId.profileImage,
                    address: profile.userId.address
                },
                match,
                rating: profile.rating,
                totalExchanges: profile.totalExchanges
            });
        }
    }

    // Sort by match score
    mutualMatches.sort((a, b) => b.match.overallScore - a.match.overallScore);
    const topMatches = mutualMatches.slice(0, parseInt(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            { 
                matches: topMatches,
                totalMutualMatches: mutualMatches.length
            },
            "Mutual matches found successfully"
        )
    );
});

/**
 * Custom AI: Calculate skill similarity using neural network
 * POST /api/v1/ai/custom/skill-similarity
 */
export const getCustomSkillSimilarity = asyncHandler(async (req, res) => {
    const { skill1, skill2 } = req.body;

    if (!skill1 || !skill2) {
        throw new ApiError(400, "Both skill1 and skill2 are required");
    }

    const similarity = customAI.calculateSkillSimilarity(skill1, skill2);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                skill1,
                skill2,
                similarityScore: similarity,
                interpretation: similarity > 0.7 ? "Highly Similar" : 
                               similarity > 0.4 ? "Moderately Similar" : "Different",
                method: "Custom Neural Network (2-Layer Feed-Forward)"
            },
            "Skill similarity calculated using custom AI"
        )
    );
});

/**
 * Custom AI: Get learning path prediction
 * POST /api/v1/ai/custom/learning-path
 */
export const getCustomLearningPath = asyncHandler(async (req, res) => {
    const { user } = req;
    const { targetSkill } = req.body;

    if (!targetSkill) {
        throw new ApiError(400, "Target skill is required");
    }

    // Get user's current skills
    const userProfile = await SkillProfileModel.findOne({ userId: user._id })
        .populate("offeredSkills");

    if (!userProfile) {
        throw new ApiError(404, "Skill profile not found");
    }

    const currentSkills = userProfile.offeredSkills.map(s => s.skillName);
    const learningPath = customAI.predictLearningPath(currentSkills, targetSkill);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                targetSkill,
                currentSkills: currentSkills.slice(0, 10),
                recommendedLearningPath: learningPath,
                totalCurrentSkills: currentSkills.length
            },
            "Learning path predicted using custom AI model"
        )
    );
});

/**
 * Custom AI: Advanced user matching with neural network
 * GET /api/v1/ai/custom/advanced-matches
 */
export const getCustomAdvancedMatches = asyncHandler(async (req, res) => {
    const { user } = req;
    const { limit = 10 } = req.query;

    // Get current user's profile
    const currentUserProfile = await SkillProfileModel.findOne({ userId: user._id })
        .populate("offeredSkills")
        .populate("requiredSkills");

    if (!currentUserProfile) {
        throw new ApiError(404, "Your skill profile not found");
    }

    // Get all other users
    const otherProfiles = await SkillProfileModel.find({ 
        userId: { $ne: user._id } 
    })
        .populate("offeredSkills")
        .populate("requiredSkills")
        .populate("userId");

    // Calculate custom AI similarity for each user
    const matches = [];
    for (const profile of otherProfiles) {
        const currentOffered = currentUserProfile.offeredSkills.map(s => s.skillName);
        const currentRequired = currentUserProfile.requiredSkills.map(s => s.skillName);
        const otherOffered = profile.offeredSkills.map(s => s.skillName);
        const otherRequired = profile.requiredSkills.map(s => s.skillName);

        // Forward match: My required vs their offered
        const forwardScore = customAI.calculateUserSimilarity(
            currentRequired,
            otherOffered
        );

        // Backward match: Their required vs my offered
        const backwardScore = customAI.calculateUserSimilarity(
            otherRequired,
            currentOffered
        );

        // Overall score
        const overallScore = (forwardScore + backwardScore) / 2;

        if (overallScore > 0.3) { // Threshold
            matches.push({
                user: {
                    id: profile.userId._id,
                    name: profile.userId.name,
                    profession: profile.userId.profession,
                    profileImage: profile.userId.profileImage
                },
                matchScore: {
                    overall: overallScore,
                    canTeachYou: forwardScore,
                    canLearnFrom: backwardScore
                },
                method: "Custom Neural Network",
                offeredSkills: otherOffered.slice(0, 5),
                requiredSkills: otherRequired.slice(0, 5)
            });
        }
    }

    // Sort by overall score
    matches.sort((a, b) => b.matchScore.overall - a.matchScore.overall);
    const topMatches = matches.slice(0, parseInt(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                matches: topMatches,
                totalMatches: matches.length,
                algorithm: "Custom 2-Layer Neural Network with TF-IDF Embeddings"
            },
            "Advanced matches calculated using custom AI"
        )
    );
});

/**
 * Custom AI: Estimate proficiency for a skill
 * POST /api/v1/ai/custom/estimate-proficiency
 */
export const getCustomProficiencyEstimate = asyncHandler(async (req, res) => {
    const { user } = req;
    const { skillName } = req.body;

    if (!skillName) {
        throw new ApiError(400, "Skill name is required");
    }

    // Get user's current skills with proficiency
    const userProfile = await SkillProfileModel.findOne({ userId: user._id })
        .populate("offeredSkills");

    if (!userProfile) {
        throw new ApiError(404, "Skill profile not found");
    }

    const relatedSkills = userProfile.offeredSkills.map(s => s.skillName);
    const userRatings = userProfile.offeredSkills.map(s => s.proficiencyLevel || 3);

    const estimatedProficiency = customAI.estimateProficiency(
        skillName,
        relatedSkills,
        userRatings
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                skillName,
                estimatedProficiency: Math.round(estimatedProficiency * 10) / 10,
                proficiencyLevel: estimatedProficiency >= 4 ? "Advanced" :
                                 estimatedProficiency >= 3 ? "Intermediate" : "Beginner",
                basedOnSkills: relatedSkills.length,
                method: "Weighted similarity-based estimation"
            },
            "Proficiency estimated using custom AI"
        )
    );
});

/**
 * Custom AI: Get model information (for FYP presentation)
 * GET /api/v1/ai/custom/model-info
 */
export const getCustomModelInfo = asyncHandler(async (req, res) => {
    const modelInfo = customAI.getModelInfo();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...modelInfo,
                implementation: "Built from scratch in JavaScript",
                performanceMetrics: {
                    averageInferenceTime: "< 5ms",
                    embeddingDimension: 50,
                    supportedSkillCategories: 6
                },
                advantages: [
                    "No external API dependencies",
                    "Offline capability",
                    "Customizable for domain-specific needs",
                    "Fast inference",
                    "Educational demonstration of ML concepts"
                ]
            },
            "Custom AI model information retrieved"
        )
    );
});
