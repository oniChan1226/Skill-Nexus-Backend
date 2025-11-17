import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters long"),

  age: z
    .number()
    .int()
    .positive("Age must be a positive number")
    .optional(),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password too long"),

  profileImage: z
    .string()
    .url("Invalid image URL")
    .optional()
    .or(z.literal("")),

  profession: z.string().optional(),

  bio: z
    .string()
    .max(250, "Bio cannot exceed 250 characters")
    .optional()
    .or(z.literal("")),

  address: z
    .object({
      country: z.string().optional().or(z.literal("")),
      city: z.string().optional().or(z.literal("")),
    })
    .optional(),

  socialLinks: z
    .object({
      github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
      linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
      twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
      portfolio: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})