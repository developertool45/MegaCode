import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api-errors.js';
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  // console.log('type of errors', errors);

  if (errors.isEmpty()) {
    return next();
  }
  const extractedError = [];
  errors.array().map((err) =>
    extractedError.push({
      [err.path]: err.msg,
    }),
  );

  throw new ApiError(422, errors.array()[0].msg || 'Validation Error', extractedError);
};
