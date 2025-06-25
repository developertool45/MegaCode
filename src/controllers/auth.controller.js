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

import { uploadOnCloudinary } from '../utils/cloudinary.js'
import cloudinary from 'cloudinary'
import { UserRolesEnum } from '../utils/contants.js';

//auth register controller
const registerUser = asyncHandler(async (req, res) => {
  //for checking controller
  console.log('========register controller======');
  // await User.deleteMany({});
  try {
    const { fname, email, password, username} = req.body;
    if (!email || !password || !fname) {
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
      role: UserRolesEnum.MEMBER
    });
  
    if (!user) {
      throw new ApiError(400, 'User not created');
    }
    //temporary token generation
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
  
    // send the email
    const verificationUrl = `${process.env.FRONTEND_URL}/email-verified/?token=${unHashedToken}`;
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
      new ApiResponse(201, 
        {
          id: user._id,
          username: user.username,
          email: user.email,
        },      
        'user got registered, please check your email to verify',
      ),
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiResponse(500, error, error.message));
    
  }
});

// verifyUser controller
const VerifyUser = asyncHandler(async (req, res) => {
  console.log('======= verify controller ========');
  try {
    //extract token from link
    const token = req.query?.token;
    console.log(token);

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

    console.log(user);
    
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

    if (!user.isEmailVerified) {       
      const { unHashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();
      
        if (!unHashedToken || !hashedToken || !tokenExpiry) {
          throw new ApiError(400, 'token generation failed');
        }

        user.emailVerificationToken = hashedToken;
        user.emailVerificationTokenExpiry = tokenExpiry;

        // send the email
        const verificationUrl = `${process.env.FRONTEND_URL}/email-verified/?token=${unHashedToken}`;
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

        return res.status(403).send(
          new ApiResponse(403, user.email,              
            'please check your email to verify',
          ),
        );
  }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    console.log("isPasswordCorrect", isPasswordCorrect);
    
    if (!isPasswordCorrect) {
      throw new ApiError(400, 'Entered password is wrong.');
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
            email: loggedInUser.email,
            username: loggedInUser.username,
            fname: loggedInUser.fname,
            id: loggedInUser._id,
            role: loggedInUser.role,
            accessToken, refreshToken,
          },
          
          'User logged In Successfully',
        ),
      );
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, error.message));
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
    const verificationUrl = `${process.env.FRONTEND_URL}/email-verified/?token=${unHashedToken}`;
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
        new ApiResponse(200, {id:user._id}, 'User logged out successfully!'),
      );
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, error.message));
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
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/?token=${unHashedToken}`;
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
    const { password, token } = req.body;
    // const token = req.query?.token;
    console.log("token",token , "password", password);
    
    if (!token) {
      throw new ApiError(400, 'Token is required');
    }
    if (!password) {
      throw new ApiError(400, 'Password is required');
    }

    const hashToken = await crypto.createHash('sha256').update(token).digest('hex');
  
    const user = await User.findOne({
      passwordResetToken: hashToken,
      passwordResetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Token is invalid or has expired');
    }

    if(!user.passwordResetToken){
      throw new ApiError(400, 'Token is invalid or has expired'); 
    }
    
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;
    await user.save(); 
    
    return res.status(200).json(
      new ApiResponse(200, {
        name: user.username,
        email: user.email,
        role: user.role,
        id: user._id,
      }, 'Password reset successfully!, please login with your new password'),
    );
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error, error.message));
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
    const user = await User.findById(userId).select('-password -refreshToken -refreshTokenExpiry -verificationToken -emailVerificationToken -emailVerificationTokenExpiry -emailResetToken -emailResetTokenExpiry');
    if (!user) {
      throw new ApiError(404, 'User not found!');
    }
    return res.status(200).json(
      new ApiResponse(
        200,
        user,
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
    if(user.avatar?.public_id){
      const result = await cloudinary.uploader.destroy(user.avatar.public_id);      
      if(!result){
        throw new ApiError(400, 'Error while deleting avatar');
      }else{
        console.log('Avatar deleted successfully');
      }
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
            public_id: avatar.public_id || '',
          },
        },
      },
      { new: true },
    ).select('-password -refreshToken -refreshTokenExpiry').lean();

    await user.save();
    return res.status(200).json(new ApiResponse(200, updatedUser, 'Avatar uploaded successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error, error.message));
  }
});
const updateProfile = asyncHandler(async (req, res) => {
  console.log('=====updateProfile controller=====');
  const userId = req.user?._id;
  const { fname,username, role } = req.body;
  try {
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found!');
    }
    if(user.role !== UserRolesEnum.ADMIN){
      const updatedUser = await User.findByIdAndUpdate(userId, {
        $set: {
          fname,       
          username        
        },
      }, { new: true })
        .select('-password -refreshToken -refreshTokenExpiry')
        .lean();
      return res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully!'));
    }
    const updatedUser = await User.findByIdAndUpdate(userId, {
      $set: {
        fname,       
        username,
        role
      },
    }, { new: true })
      .select('-password -refreshToken -refreshTokenExpiry')
      .lean();
    return res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error, error.message));
  }
});
const changePasswordLogin = asyncHandler(async (req, res) => {
  console.log('=====changePasswordLogin controller=====');
  const userId = req.user?._id;
  const { oldPassword, newPassword } = req.body;
  console.log(oldPassword, newPassword);
  
  try {
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found!');
    }
    const isMatch = await user.isPasswordCorrect(oldPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Old password is wrong.');
    }
    user.password = newPassword;
    await user.save();
    const updatedUser = await User.findById(userId)
      .select('-password -refreshToken -refreshTokenExpiry')
        
    return res.status(200).json(new ApiResponse(200, {
      id: updatedUser._id, email: updatedUser.email, role: updatedUser.role
    },
      'Password updated successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error, error.message));
  }
})
const getAllUsers = asyncHandler(async (req, res) => {
  console.log('=====getAllUsers controller=====');
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, 'Unauthorized request! Please login first.');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found!');
  if (user.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(401, 'you are not authorized !');
  }  
  try {
    const users = await User.find().select(' -isEmailVerified -password -refreshToken -refreshTokenExpiry -emailVerificationTokenExpiry -verificationToken -emailResetToken -emailResetTokenExpiry -avatar.public_id -avatar.localpath').lean();
    // const findedUsers = users.filter(user => user.role !== UserRolesEnum.ADMIN);
    return res.status(200).json(new ApiResponse(200,  
      users
    , 'Users found successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error, error.message));
  }
})
const promoteToAdmin = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;
  if (!userId) throw new ApiError(401, 'Unauthorized request! Please login first.');
  if(!id) throw new ApiError(400, 'User id is required');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found!');
  if (user.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(401, 'you are not authorized !');
  }  
  try {
    const updatedUser = await User.findByIdAndUpdate(id, {
      $set: {
        role: UserRolesEnum.ADMIN
      },
    }, { new: true })
      .select(' -isEmailVerified -password -refreshToken -refreshTokenExpiry -emailVerificationTokenExpiry -verificationToken -emailResetToken -emailResetTokenExpiry -avatar.public_id -avatar.localpath')
      .lean()
    return res.status(200).json(new ApiResponse(200, updatedUser, 'User promoted to admin successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error, error.message));
  }
})
const promoteToUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;
  if (!userId) throw new ApiError(401, 'Unauthorized request! Please login first.');
  if(!id) throw new ApiError(400, 'User id is required');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found!');
  if (user.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(401, 'you are not authorized !');
  }  
  try {
    const updatedUser = await User.findByIdAndUpdate(id, {
      $set: {
        role: UserRolesEnum.MEMBER
      },
    }, { new: true })
      .select(' -isEmailVerified -password -refreshToken -refreshTokenExpiry -emailVerificationTokenExpiry -verificationToken -emailResetToken -emailResetTokenExpiry -avatar.public_id -avatar.localpath')
      .lean()
    
    return res.status(200).json(new ApiResponse(200, updatedUser, 'User promoted to user successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error, error.message));
  }
})

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;
  if (!userId) throw new ApiError(401, 'Unauthorized request! Please login first.');
  if(!id) throw new ApiError(400, 'User id is required');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found!');
  if (user.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(401, 'you are not authorized !');
  }  
  try {
    const findDeletedUser = await User.findById(id);
    if (!findDeletedUser) {
      throw new ApiError(404, 'User not found!');
    }
    if(findDeletedUser.role === UserRolesEnum.ADMIN) {
      throw new ApiError(400, 'Admin user cannot be deleted!');
    }
    const deletedUser = await User.findByIdAndDelete(id);
    if(!deletedUser) {
      throw new ApiError(404, 'User not deleted!');
    }
    return res.status(200).json(new ApiResponse(200, deletedUser, 'User deleted successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error, error.message));
  }
})
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
  uploadUserAvatar,
  updateProfile,
  changePasswordLogin,
  getAllUsers,
  promoteToAdmin,
  promoteToUser,
  deleteUser
};
