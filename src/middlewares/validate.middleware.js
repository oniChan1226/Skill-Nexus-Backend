import { ApiError } from "../utils/ApiError.js";


const validateRequest = (schema) =>  (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if(error) {
        const errorMessages = error.details.map(detail => detail?.message).join(", ");
        throw new ApiError(400, errorMessages);
    }

    console.log("value in validator::", value)

    req.body = value;
    next();
};

export { validateRequest };