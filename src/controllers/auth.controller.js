import { body } from 'express-validator';
import { asyncHandler } from '../utils/async-handler.js';

const registerUser = asyncHandler(async (req, res) => {
    //validation
    
})
const loginUser = asyncHandler(async (req, res) => {
    const {email, password, username, role} = req.body;
})
const VerifyUser = asyncHandler(async (req, res) => {
    const {email, password, username, role} = req.body;
})
const resendVerificationEmail = asyncHandler(async (req, res) => {
    const {email, password, username, role} = req.body;
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const {email, password, username, role} = req.body;
})
const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const {email, password, username, role} = req.body;
})
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {email, password, username, role} = req.body;
})
const getCurrentUser = asyncHandler(async (req, res) => {
    const {email, password, username, role} = req.body;
})

export {
    registerUser,
    loginUser,
    VerifyUser,
    resendVerificationEmail,
    refreshAccessToken,
    forgotPasswordRequest,
    changeCurrentPassword,
    getCurrentUser
}