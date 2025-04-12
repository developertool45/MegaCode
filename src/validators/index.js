import { body } from "express-validator"

const userRegisterUserValidator = () => {
    return [
      body('email').isEmail().notEmpty().withMessage('Please enter a valid email address'),
      body('password')
        .notEmpty()
        .trim()
        .isLength({ min: 6 })
        .isLength({ max: 20 })
        .withMessage('Password must be at least 6 characters long'),
      body('username')
        .isLength({ min: 3 })
        .trim()
        .withMessage('Username must be at least 3 characters long')
        .isLength({ max: 13 })
        .withMessage('Username must be at least 3 characters long'),
    ];
}

const loginUserValidator = () => {
    return [
        body('email').isEmail().notEmpty().withMessage('Please enter a valid email address'),
        body('password')
            .notEmpty()
            .trim()
            .isLength({ min: 6 })
            .isLength({ max: 20 })
            .withMessage('Password must be at least 6 characters long'),
    ];
}
export { userRegisterUserValidator, loginUserValidator }; 