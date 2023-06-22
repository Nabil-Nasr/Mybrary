import { validatorMiddleware } from "../../middlewares/validator.js";
import { body } from "express-validator";

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage("Email required")
    .isEmail().withMessage("Invalid email address"),
  body('password')
    .notEmpty().withMessage("Password required")
    .isLength({min:8}).withMessage("Password must be at least 8 characters"),
    
  validatorMiddleware('admin')
];