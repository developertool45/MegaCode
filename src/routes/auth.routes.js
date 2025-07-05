import { Router } from 'express';
import { validate } from '../middleware/validator.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

import {
  userRegisterUserValidator,
  loginUserValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  changePasswordValidator } from '../validators/index.js';
const router = Router();

//login middleware
import { isLoggedIn } from '../middleware/isLoggedIn.middlewares.js';
import {
  registerUser,
  VerifyUser,
  loginUser,
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
} from '../controllers/auth.controller.js';

import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/api-errors.js';

const Limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, next, options) => {
    next(new ApiError(429, ' Too many login attempts. Try again in 10 minutes.'));
  },
});


//register user
router.route('/register').post(userRegisterUserValidator(), validate, registerUser);  
router.route('/verify-email/').get(VerifyUser);
router.route('/login').post(loginUserValidator(), validate, Limiter, loginUser);
router.route('/verify-email-resend').post(Limiter,resendVerificationValidator(), validate, resendVerificationEmail); 
router.route('/get-profile').post(isLoggedIn, getCurrentUser);
router.route('/update-profile').post(isLoggedIn,Limiter, updateProfileValidator(), validate, updateProfile);
router.route('/logout').get(isLoggedIn, logOutUser);
router.route('/forgot-password').post(Limiter,forgotPasswordValidator(), validate, forgotPasswordRequest);
router.route('/reset-password').post(Limiter, resetPasswordValidator(), validate, changeCurrentPassword);
router.route('/refresh-token').post(refreshAccessToken);  
router.route('/upload-avatar').post(isLoggedIn,Limiter, upload.single('avatar'), uploadUserAvatar);
router.route('/change-password').post(isLoggedIn, Limiter, changePasswordValidator(), validate, changePasswordLogin);
router.route('/all-users').get(isLoggedIn, getAllUsers);
router.route('/promote-to-admin/:id').post(isLoggedIn, promoteToAdmin);
router.route('/promote-to-user/:id').post(isLoggedIn, promoteToUser);
router.route('/demote-user/:id').post(isLoggedIn, deleteUser);

export default router;
