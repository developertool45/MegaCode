import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-errors.js';
import { User } from '../models/user.models.js';
import ApiResponse from '../utils/api-response.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { options } from '../utils/contants.js';
dotenv.config({
  path: '../.env',
});
import {
  sendMail,
  emailVerificationMailGenContent,
  emailRestPasswordMailGenContent,
} from '../utils/mail.js';

import {uploadOnCloudinary} from '../utils/cloudinary.js'

//auth register controller
const registerUser = asyncHandler(async (req, res) => {
  //for checking controller
  console.log('========register controller======');

  // console.log(req.body);
  // await User.deleteMany({});

  const { fname, email, password, username, role } = req.body;
  if (!email || !password || !username) {
    throw new ApiError(400, 'All fields are required');
  }
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }
  const user = await User.create({
    email,
    password,
    username,
    fname,
    role,
  });

  if (!user) {
    throw new ApiError(400, 'User not created');
  }
  //temporary token generation
  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;

  // send the email
  const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify-email/?token=${unHashedToken}`;
  const verificationEmailGenContent = emailVerificationMailGenContent(
    user.username,
    verificationUrl,
  );
  await sendMail({
    email: user.email,
    subject: 'Please Verify your email',
    mailgenContent: verificationEmailGenContent,
  });
  await user.save();
  return res.send(
    new ApiResponse(201, {
      message: 'user got registered, please check your email to verify',
    }),
  );
});

// verifyUser controller
const VerifyUser = asyncHandler(async (req, res) => {
  console.log('======= verify controller ========');
  try {
    //extract token from link
    const token = req.query?.token;

    if (!token) {
      throw new ApiError(400, 'token not found, link got expired');
    }

    const convertedHashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: convertedHashedToken,
      emailVerificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return new ApiResponse(400, {
        message: 'token expired',
      });
    }
    // empty these fields
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
    user.isEmailVerified = true;

    // save user
    await user.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          id: user._id,
          email: user.email,
          username: user.username,
          fname: user.fname,
        },
        'user verification completed. please go for Login.',
      ),
    );
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, 'user not verified.'));
  }
});

//login user controller
const loginUser = asyncHandler(async (req, res) => {
  console.log('=====loginUser controller=====');
  //get extracted data for login
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(403, 'all fields are required.');
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(400, 'your credentials are wrong, please re-enter the right One.');
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      throw new ApiError(400, 'password is wrong.');
    }

    if (!user.isEmailVerified) {
      throw new ApiError(400, 'please verify your email first.');
    }

    // generate tokens
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // token and expiry in db
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;

    await user.save();

    const loggedInUser = await User.findById(user._id).select(
      '-password -refreshToken -refreshTokenExpiry',
    );

    // response send to user
    return res
      .status(200)
      .cookie('refreshToken', refreshToken, options)
      .cookie('accessToken', accessToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: {
              email: loggedInUser.email,
              username: loggedInUser.username,
              fname: loggedInUser.fname,
            },
          },
          'User logged In Successfully',
        ),
      );
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, 'login failed.'));
  }
});
// resend verification email
const resendVerificationEmail = asyncHandler(async (req, res) => {
  console.log('=====resendVerificationEmail controller=====');
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'email is required');
    }
    const user = await User.findOne({ email }).select(
      '-password -refreshToken -refreshTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry',
    );

    if (!user) {
      throw new ApiError(400, 'user not found');
    }
    if (user.isEmailVerified) {
      throw new ApiError(400, 'email already verified');
    }
    const { unHashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();

    if (!unHashedToken || !hashedToken || !tokenExpiry) {
      throw new ApiError(400, 'token generation failed');
    }

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    // send the email
    const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify-email/?token=${unHashedToken}`;
    const verificationEmailGenContent = emailVerificationMailGenContent(
      user.username,
      verificationUrl,
    );
    await sendMail({
      email: user.email,
      subject: 'Please Verify your email',
      mailgenContent: verificationEmailGenContent,
    });
    await user.save();
    return res.status(201).json(
      new ApiResponse(201, {
        message: 'email verification link sent, please check your email to verify',
      }),
    );
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, 'email verification failed.'));
  }
});

// logout user
const logOutUser = asyncHandler(async (req, res) => {
  console.log('=====logoutUser controller=====');
  const userId = req.user?._id;
  try {
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found!');
    }
    user.refreshToken = null;
    user.refreshTokenExpiry = null;
    await user.save();

    return res
      .status(200)
      .clearCookie('refreshToken', options)
      .clearCookie('accessToken', options)
      .json(
        new ApiResponse(200, {
          message: 'User logged out successfully',
        }),
      );
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, 'User logout failed.'));
  }
});

// forgot password
const forgotPasswordRequest = asyncHandler(async (req, res) => {
  console.log('=====forgotPasswordRequest controller=====');
  const { email } = req.body;
  try {
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, 'User not found');
    }
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    console.log(unHashedToken, hashedToken, tokenExpiry);

    if (!unHashedToken || !hashedToken || !tokenExpiry) {
      throw new ApiError(400, 'token generation failed');
    }
    user.passwordResetToken = hashedToken;
    user.passwordResetTokenExpiry = tokenExpiry;

    // send the email
    const resetPasswordUrl = `${process.env.BASE_URL}/api/v1/users/reset-password/?token=${unHashedToken}`;
    const resetPasswordEmailGenContent = emailRestPasswordMailGenContent(
      user.username,
      resetPasswordUrl,
    );
    await sendMail({
      email: user.email,
      subject: 'Password Reset Request',
      mailgenContent: resetPasswordEmailGenContent,
    });

    await user.save();

    return res.status(200).json(new ApiResponse(200, 'Password reset link sent successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error.message, 'Password reset failed.'));
  }
});
// change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  console.log('=====changeCurrentPassword controller=====');
  try {
    const { password } = req.body;
    const token = req.query?.token;

    if (!token) {
      throw new ApiError(400, 'Token is required');
    }
    if (!password) {
      throw new ApiError(400, 'Password is required');
    }

    const hashToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashToken,
      passwordResetTokenExpiry: { $gt: Date.now() },
    }).select('-password -refreshToken -refreshTokenExpiry');

    if (!user) {
      throw new ApiError(400, 'Token is invalid or has expired');
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;
    await user.save();

    return res.status(200).json(new ApiResponse(200, 'Password reset successfully!'));
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, 'Password reset failed.'));
  }
});
// get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  console.log('=====getCurrentUser controller=====');
  const userId = req.user?._id;
  try {
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    const user = await User.findById(userId).select('-password -refreshToken -refreshTokenExpiry');
    if (!user) {
      throw new ApiError(404, 'User not found!');
    }
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          name: user.fname,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        'User found successfully!',
      ),
    );
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, 'User not found!'));
  }
});
// refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  console.log('=====refreshAccessToken controller=====');
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token not found');
    }

    const user = await User.findOne({ refreshToken }).select('-password');
    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const accessToken = await user.generateAccessToken();

    res.cookie('accessToken', accessToken, options);

    return res.status(200).json(new ApiResponse(200, 'Access token refreshed successfully!'));
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, 'User logged In failed.'));
  }
});

const uploadUserAvatar = asyncHandler(async (req, res) => {
  console.log('=====uploadUserAvatar controller=====');
  const userId = req.user?._id;
  const avatarLocalPath = req.file?.path;
  console.log('local path', avatarLocalPath);

  try {
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    if (!avatarLocalPath) {
      throw new ApiError(400, 'Avatar not found!');
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found!');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) {
      throw new ApiError(400, 'Error while uploading avatar');
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar: {
            url: avatar.url,
            localpath: avatarLocalPath || '',
          },
        },
      },
      { new: true },
    ).select('-password -refreshToken -refreshTokenExpiry');

    await user.save();
    return res.status(200).json(new ApiResponse(200, updatedUser, 'Avatar uploaded successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error, 'User logged In failed.'));
  }
});

export {
  registerUser,
  loginUser,
  VerifyUser,
  resendVerificationEmail,
  logOutUser,
  refreshAccessToken,
  forgotPasswordRequest,
  changeCurrentPassword,
  getCurrentUser,
  uploadUserAvatar
};
