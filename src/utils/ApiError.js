
class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        data = null,
        errors= []
    ) {
        super(message);
        this.date = null;
        this.success = false;
        this.message = message;
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = data;
    }
};

export { ApiError };