import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {

    console.error("Error:", err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: err?.data || null,
            errors: err.errors || [],
        });
    }

    return res.status(500).json({
        success: false,
        message: err?.message || "Internal Server Error",
        errors: [],
    });
};

export default errorHandler;