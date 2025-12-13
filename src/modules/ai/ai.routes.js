import { Router } from "express";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
import {
    getSkillMatchScore,
    getRecommendedUsers,
    getSkillRecommendations,
    analyzeProfile,
    findTeachersForSkill,
    getMutualMatches,
    getCustomSkillSimilarity,
    getCustomLearningPath,
    getCustomAdvancedMatches,
    getCustomProficiencyEstimate,
    getCustomModelInfo
} from "./ai.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJwt);

// Get AI-powered skill match score with a specific user
router.get("/match-score/:userId", getSkillMatchScore);

// Get AI-recommended users to connect with
router.get("/recommended-users", getRecommendedUsers);

// Get AI-powered skill recommendations for learning
router.get("/skill-recommendations", getSkillRecommendations);

// Get AI analysis of user profile
router.get("/profile-analysis", analyzeProfile);

// Find best teachers for a specific skill
router.get("/find-teachers/:skillName", findTeachersForSkill);

// Get mutual skill matches (bidirectional)
router.get("/mutual-matches", getMutualMatches);

// ==========================================
// Custom AI Routes (Neural Network Based)
// ==========================================

// Get model information (for FYP presentation)
router.get("/custom/model-info", getCustomModelInfo);

// Calculate skill similarity using custom neural network
router.post("/custom/skill-similarity", getCustomSkillSimilarity);

// Get personalized learning path prediction
router.post("/custom/learning-path", getCustomLearningPath);

// Get advanced user matches using neural network
router.get("/custom/advanced-matches", getCustomAdvancedMatches);

// Estimate proficiency for a new skill
router.post("/custom/estimate-proficiency", getCustomProficiencyEstimate);

export default router;
