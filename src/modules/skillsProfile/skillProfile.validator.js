import { z } from "zod";

// ===== Offered Skill Validation =====
export const offeredSkillSchema = z.object({
    name: z
        .string({ required_error: "Skill name is required" })
        .min(2, "Skill name must be at least 2 characters long"),

    proficiencyLevel: z.enum(["beginner", "intermediate", "expert"], {
        required_error: "Proficiency level is required",
    }),

    description: z
        .string()
        .max(300, "Description cannot exceed 300 characters")
        .optional()
        .or(z.literal("")),

    categories: z
        .array(z.string())
        .nonempty("At least one category is required")
        .optional(),

    // Optional metrics, auto-managed by backend
    metrics: z
        .object({
            totalRequests: z.number().optional(),
            acceptedRequests: z.number().optional(),
            completedRequests: z.number().optional(),
        })
        .optional(),
});

// ===== Required Skill Validation =====
export const requiredSkillSchema = z.object({
    name: z
        .string({ required_error: "Skill name is required" })
        .min(2, "Skill name must be at least 2 characters long"),

    learningPriority: z.enum(["high", "medium", "low"], {
        required_error: "Learning priority is required",
    }),

    description: z
        .string()
        .max(300, "Description cannot exceed 300 characters")
        .optional()
        .or(z.literal("")),

    categories: z
        .array(z.string())
        .nonempty("At least one category is required")
        .optional(),

    metrics: z
        .object({
            totalRequests: z.number().optional(),
            acceptedRequests: z.number().optional(),
            completedRequests: z.number().optional(),
        })
        .optional(),
});

// ===== Skill Trading Query Validation =====
export const skillTradingQuerySchema = z.object({
    offeredSkill: z.string().optional(),
    requiredSkill: z.string().optional(),
    proficiencyLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
    learningPriority: z.enum(["high", "medium", "low"]).optional(),
    categories: z.string().optional(), // Comma-separated string
    country: z.string().optional(),
    city: z.string().optional(),
    minRating: z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid number").optional(),
    sortBy: z.enum(["rating", "totalExchanges", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.string().regex(/^\d+$/, "Must be a valid number").optional(),
    limit: z.string().regex(/^\d+$/, "Must be a valid number").optional(),
});

