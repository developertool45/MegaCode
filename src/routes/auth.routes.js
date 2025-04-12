import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validator.middleware.js"
import { userRegisterUserValidator } from '../validators/index.js';
const router = Router();

router.route('/register')
    .post(userRegisterUserValidator(), validate, registerUser);

export default router;