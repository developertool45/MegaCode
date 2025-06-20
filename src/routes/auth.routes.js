import { Router } from 'express';
import { validate } from '../middleware/validator.middleware.js';
import { userRegisterUserValidator, loginUserValidator } from '../validators/index.js';
import { upload } from '../middleware/multer.middleware.js';
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
  changePasswordLogin
} from '../controllers/auth.controller.js';


//register user
router.route('/register').post(userRegisterUserValidator(), validate, registerUser);  
router.route('/verify-email/').get(VerifyUser);
router.route('/login').post(loginUserValidator(), validate, loginUser);
router.route('/verify-email-resend').post(resendVerificationEmail); 
router.route('/get-profile').post(isLoggedIn, getCurrentUser);
router.route('/update-profile').post(isLoggedIn, updateProfile);
router.route('/logout').get(isLoggedIn, logOutUser);
router.route('/forgot-password').post(forgotPasswordRequest);
router.route('/reset-password').post(changeCurrentPassword);
router.route('/refresh-token').post(refreshAccessToken);  
router.route('/upload-avatar').post(isLoggedIn, upload.single('avatar'), uploadUserAvatar);
router.route('/change-password').post(isLoggedIn, changePasswordLogin);

export default router;
