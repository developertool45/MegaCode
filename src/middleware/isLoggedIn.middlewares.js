import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import dotenv from 'dotenv';
import { ApiError } from '../utils/api-errors.js';
import { asyncHandler } from '../utils/async-handler.js';
dotenv.config();

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
  if (!accessToken) {
     throw new ApiError(400, 'Please Login first.');
  }
  try {
    const decoded =  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        
    if (!decoded) {
      throw new ApiError(400, 'Please Login again.');
    }
    const userId = decoded._id;
    const user = await User.findById(userId).select(
      '-password -verificationToken -emailVerificationToken -emailVerificationTokenExpiry',
    );
    if (!user) {
      throw new ApiError(401, 'Please Login again.');
    }
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {      
    return res.status(401).json(new ApiError(401 , error?.message || 'Please Login again,your token got expired'));
  }
});
