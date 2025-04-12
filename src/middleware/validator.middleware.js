import { validationResult } from "express-validator";
import ApiError from "../utils/api-errors.js"
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    // what is type of errors do console and data type
    console.log("errors ka type", errors);
    
    if (errors.isEmpty()) {
        return next()
    }
    const extractedError = []
    errors.array().map((err) => extractedError.push({
        [err.path]: err.msg
    }));

   throw new ApiError(422, "Recieved data is not valid", extractedError)
}