import { ApiError } from "../utils/ApiError.js";
import { ZodError } from "zod";

const validateRequest = (schema, source = "body") => (req, res, next) => {
  try {
    // Check if schema exists and is a valid Zod schema
    if (!schema || typeof schema.parse !== "function") {
      console.error("❌ Invalid or missing Zod schema in validateRequest");
      throw new ApiError(500, "Internal server error: invalid validation schema");
    }

    // Determine what data to validate
    const dataToValidate = source === "query" ? req.query : req.body;

    // Check for empty body only when validating body (not query)
    if (source === "body" && (!req.body || Object.keys(req.body).length === 0)) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    // Run validation
    const validatedData = schema.parse(dataToValidate);

    // Assign sanitized data back to the appropriate location
    if (source === "query") {
      Object.assign(req.query, validatedData);
    } else {
      Object.assign(req.body, validatedData);
    }

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
