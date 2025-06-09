
const asyncHandler = (handleRequest) => {
    return async (req, res, next) => {
        try {
         await handleRequest(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

export { asyncHandler };