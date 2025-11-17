import mongoose from "mongoose";

const skillsSchema = new mongoose.Schema({
    name: { type: String },
    proficiencyLevel: { type: String, enum: ["beginner", "intermediate", "expert"] },
    learningPriority: { type: String, enum: ["high", "medium", "low"] },
    description: { type: String },
    categories: { type: [String] },
    metrics: {
        totalRequests: { type: Number, default: 0 },
        acceptedRequests: { type: Number, default: 0 },
        completedRequests: { type: Number, default: 0 },
    }
}, { timestamps: true });

export const SkillModel = mongoose.model("Skills", skillsSchema);