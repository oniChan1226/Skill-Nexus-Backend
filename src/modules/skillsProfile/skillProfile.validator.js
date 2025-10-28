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
