import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import dotenv from 'dotenv';
import { ApiError } from '../utils/api-errors.js';
import { options } from '../utils/contants.js';
import { asyncHandler } from '../utils/async-handler.js';
dotenv.config();

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
  const refreshToken = req.cookies?.refreshToken;

  console.log("=======isLoggedIn middleware=======");   

  console.log('refresh token', refreshToken);
  if (!accessToken) {
    
    if (refreshToken) {            
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      if (!decoded) {
        throw new ApiError(400, 'Please Login again.');
      }
      const userId = decoded._id;
      const user = await User.findById(userId).select(
        '-password -verificationToken -emailVerificationToken -emailVerificationTokenExpiry',
      );

      if (!user) {
        return res.status(401).json(new ApiError(401, 'Please Login again.'));
      }
      if (user) {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('accessToken', accessToken, options);
        res.cookie('refreshToken', refreshToken, options);
        req.user = user;
        next();
      }
    } else {
      return res.status(401).json(new ApiError(401, 'Please Login again,your token got expired.'));
    }
  } else {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      if (!decoded) {
        throw new ApiError(400, 'Please Login again.');
      }
      const userId = decoded._id;
      const user = await User.findById(userId).select(
        '-password -verificationToken -emailVerificationToken -emailVerificationTokenExpiry',
      );  
      if (!user) {
        throw new ApiError(401, 'user not found!');
      }
      if (user) { 
        req.user = user;
      }
      next();
    } catch (error) {
      return res.status(401).json(new ApiError(401, error?.message || 'Please Login again,your token got expired.'));
    }
  }
});
