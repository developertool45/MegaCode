import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import dotenv from 'dotenv';
import { ApiError } from '../utils/api-errors.js';
dotenv.config();
import { options } from '../utils/contants.js';
import { asyncHandler } from '../utils/async-handler.js';

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
  const refreshToken = req.cookies?.refreshToken;
  // console.log('accessToken', accessToken);
  // console.log('refreshToken', refreshToken);
  console.log("=======isLoggedIn middleware=======");

  if (!accessToken) {
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      if (!decoded) {
        return res.status(400).json(new ApiError(400, 'Please Login again.'));
      }
      const userId = decoded._id;
      const user = await User.findById(userId).select(
        '-password -refreshToken -verificationToken -emailVerificationToken -emailVerificationTokenExpiry',
      );

      if (!user) {
        return res.status(400).json(new ApiError(400, 'Please Login again.'));
      }
      if (user) {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        res.cookie('accessToken', accessToken, options);
        res.cookie('refreshToken', refreshToken, options);
        req.user = user;
        next();
      }
    } else {
      return res.status(400).json(new ApiError(400, 'Please Login again.'));
    }

    return res.status(401).json(new ApiError(401, 'Please Login again,your token got expired.'));
  } else {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded._id;
    const user = await User.findById(userId).select(
      '-password -refreshToken -verificationToken -emailVerificationToken -emailVerificationTokenExpiry',
    );

    if (!user) {
      return res.status(400).json(new ApiError(400, 'Please Login again.'));
    }
    if (user) {
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
      res.cookie('accessToken', accessToken, options);
      res.cookie('refreshToken', refreshToken, options);
      req.user = user;
      next();
    }
  }
});
