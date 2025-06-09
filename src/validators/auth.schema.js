import Joi from "joi";

export const signUpSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is required",
    }),
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        "string.empty": "Username is required",
        "string.alphanum": "Username must only contain letters and numbers",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must be at most 30 characters",
        "any.required": "Username is required",
    }),
    email: Joi.string().email().trim().lowercase().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "any.required": "Password is required",
    }),
    age: Joi.number().min(0).optional().messages({
        "number.base": "Age must be a number",
        "number.min": "Age cannot be negative",
    }),
    bio: Joi.string().max(500).optional(),
    address: Joi.object({
        country: Joi.string().optional(),
        city: Joi.string().optional(),
    }).optional(),
    socialLinks: Joi.object({
        github: Joi.string().uri().allow("").messages({
            "string.uri": "GitHub must be a valid URL",
        }),
        linkedin: Joi.string().uri().allow(""),
        twitter: Joi.string().uri().allow(""),
        portfolio: Joi.string().uri().allow(""),
    }).optional(),
})
    .required()
    .messages({
        "object.missing": "Request body is empty",
    });;

export const loginSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().messages({
        "string.email": "Email must be a valid email address",
    }),
    username: Joi.string().alphanum().min(3).max(30),
    password: Joi.string().required().messages({
        "string.empty": "Password is required",
        "any.required": "Password is required",
    }),
})
    .xor("email", "username")
    .required()
    .messages({
        "object.missing": "Either email or username is required",
        "object.xor": "Please provide either email or username (not both)",
    });

