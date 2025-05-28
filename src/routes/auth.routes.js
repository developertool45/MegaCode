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
  uploadUserAvatar
} from '../controllers/auth.controller.js';


//register user
router
  .route('/register')
  .post(userRegisterUserValidator(), validate, registerUser);
  
router
  .route('/verify-email')
  .get(VerifyUser);
router
  .route('/login')
  .post(loginUserValidator(), validate, loginUser);

router
  .route('/verify-email-resend')
  .post(resendVerificationEmail); 

router
  .route('/get-profile')
  .post(isLoggedIn, getCurrentUser);

//logout user
router
  .route('/logout')
  .get(isLoggedIn, logOutUser);
//forgot password
router
  .route('/forgot-password')
  .post(forgotPasswordRequest);

//change password
router
  .route('/reset-password')
  .post(changeCurrentPassword);

//refresh token
router
  .route('/refresh-token')
  .post(refreshAccessToken);
  
router.
  route('/upload-avatar')
  .patch(isLoggedIn, upload.single('avatar'), uploadUserAvatar);


export default router;
