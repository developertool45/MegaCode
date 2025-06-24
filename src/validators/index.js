import { body } from "express-validator"
import { AvailableUserRoles, UserRolesEnum } from "../utils/contants.js";

const userRegisterUserValidator = () => {
  console.log('userRegisterUserValidator');
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email'),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long')
      .isLength({ max: 12 })
      .withMessage('Username must be at most 12 characters long'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 4 })
      .withMessage('Password must be at least 8 characters long')
      .isLength({ max: 16 })
      .withMessage('Password must be at most 16 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      .withMessage("Password must contain at least one uppercase, one lowercase letter and one number")
     ];
};

const loginUserValidator = () => {
    return [
      body('email')
        .isEmail()
        .notEmpty()
        .withMessage('Please enter a valid email address'),
      body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 4 })
        .withMessage('Password must be at least 8 characters long')
        .isLength({ max: 16 })
        .withMessage('Password must be at most 16 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
        .withMessage("Password must contain at least one uppercase, one lowercase letter and one number")
        
    ];
}
// 🔒 Resend Verification Email
const resendVerificationValidator = () => [
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email"),
];

// 🔒 Forgot Password
const forgotPasswordValidator = () => [
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email"),
];

// 🔐 Reset Password
const resetPasswordValidator = () => [
  body("password")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6, max: 20 }).withMessage("Password must be 6-20 characters long"),
];

// 🔄 Update Profile
const updateProfileValidator = () => [
  body("username")
    .optional()
    .isLength({ min: 3, max: 12 }).withMessage("Username must be 3-12 characters"),
  body("email")
    .optional()
    .isEmail().withMessage("Enter a valid email"),
];

// 🔐 Change Password while logged in
const changePasswordValidator = () => [
  body("oldPassword")
    .notEmpty().withMessage("oldPassword password is required"),
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6, max: 20 }).withMessage("Password must be 6-20 characters long"),
];


// ✅ Create Project Validator
const createProjectValidator = () => [
  body("name")
    .notEmpty().withMessage("Project name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be 3 to 50 characters long"),

  body("description")
    .optional()
    .isLength({ max: 200 }).withMessage("Description must be under 200 characters"),

  body("dueDate")
    .optional()
    .isISO8601().withMessage("Due date must be a valid date"),
];

// ✅ Update Project Validator
const updateProjectValidator = () => [
  body("name")
    .optional()
    .isLength({ min: 3, max: 50 }).withMessage("Name must be 3 to 50 characters long"),

  body("description")
    .optional()
    .isLength({ max: 200 }).withMessage("Description must be under 200 characters"),

  body("dueDate")
    .optional()
    .isISO8601().withMessage("Due date must be a valid date"),
];

// ✅ Add Member Validator
const addMemberValidator = () => [
  body("email")
    .notEmpty().withMessage("Member email is required")
    .isEmail().withMessage("Must be a valid email"),
];

// ✅ Update Member Role Validator
const updateMemberRoleValidator = () => [
  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn([UserRolesEnum.MEMBER, UserRolesEnum.PROJECT_ADMIN]).withMessage("Role must be admin or member"),
];

// ✅ Create Task Validator
const createTaskValidator = () => [
  body("title")
    .notEmpty().withMessage("Task title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be 3 to 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 500 }).withMessage("Description must be under 500 characters"),

  body("assignedTo")
    .notEmpty().withMessage("AssignedTo (userId) is required")
    .isMongoId().withMessage("AssignedTo must be a valid Mongo ID"),

  body("status")
    .optional()
    .isIn(["todo", "in_progress", "done"]).withMessage("Status must be one of: todo, in_progress, done")
];

// ✅ Update Task Validator (can be partial)
const updateTaskValidator = () => [
  body("title")
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage("Title must be 3 to 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 500 }).withMessage("Description must be under 500 characters"),

  body("assignedTo")
    .optional()
    .isMongoId().withMessage("AssignedTo must be a valid Mongo ID"),

  body("status")
    .optional()
    .isIn(["todo", "in_progress", "done"]).withMessage("Status must be one of: todo, in_progress, done")
];

// ✅ Create Subtask Validator
const createSubtaskValidator = () => [
  body("title")
    .notEmpty()
    .withMessage("Subtask title is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be 2 to 100 characters"),

  body("status")
    .optional()
    .isBoolean()
    .withMessage("Status must be a boolean (true/false)"),
];

// ✅ Update Subtask Validator
const updateSubtaskValidator = () => [
  body("title")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be 2 to 100 characters"),

  body("status")
    .optional()
    .isBoolean()
    .withMessage("Status must be a boolean (true/false)"),
];


// ✅ Create Note Validator
const createNoteValidator = () => [
  body("title")
    .notEmpty()
    .withMessage("Note title is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be 2 to 100 characters"),

  body("content")
    .notEmpty()
    .withMessage("Note content is required")
    .isLength({ min: 5 })
    .withMessage("Content must be at least 5 characters long")
];

// ✅ Update Note Validator
const updateNoteValidator = () => [
  body("title")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be 2 to 100 characters"),

  body("content")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Content must be at least 5 characters long")
];

export {
  userRegisterUserValidator,
  loginUserValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  changePasswordValidator,
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
  updateMemberRoleValidator,
  createTaskValidator,
  updateTaskValidator,
  createSubtaskValidator,
  updateSubtaskValidator,
  createNoteValidator,
  updateNoteValidator,
}; 