import { body } from "express-validator"

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
      .withMessage('Password must be at most 16 characters long'),
  ];
};

const loginUserValidator = () => {
    return [
      body('email')
        .isEmail()
        .notEmpty()
        .withMessage('Please enter a valid email address'),
      body('password')
        .notEmpty()
        .trim()
        .isLength({ min: 6 })
        .isLength({ max: 20 })
        .withMessage('Password must be at least 6 characters long'),
    ];
}
export { userRegisterUserValidator, loginUserValidator }; 