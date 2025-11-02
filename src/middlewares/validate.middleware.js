import { ApiError } from "../utils/ApiError.js";
import { ZodError } from "zod";

const validateRequest = (schema) => (req, res, next) => {
  try {
    // Check if schema exists and is a valid Zod schema
    if (!schema || typeof schema.parse !== "function") {
      console.error("❌ Invalid or missing Zod schema in validateRequest");
      throw new ApiError(500, "Internal server error: invalid validation schema");
    }

    // Check for empty body (e.g., undefined or empty object)
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    // Run validation
    const validatedData = schema.parse(req.body);

    // Assign sanitized data back to req.body
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages =
        error.errors?.map((e) => e.message).join(", ") || "Invalid request data";
      return next(new ApiError(400, errorMessages, error));
    }

    // Pass other errors (like ApiError or unexpected ones)
    next(error);
  }
};

export { validateRequest };
