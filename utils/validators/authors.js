import { validatorMiddleware } from "../../middlewares/validator.js";
import { param, body, query } from "express-validator";
import Author from "../../models/author.js";

// to make the edit of constraints only in the model
const { name: authorName } = Author.schema.obj;


export const getAuthorValidator = [
  param('id')
    .isMongoId().withMessage("Invalid author id"),

  validatorMiddleware('author')
];

export const getAuthorsValidator = [
  query('name')
    .if(value => value ?? null)
    .optional()
    .trim()
    .isLength({ max: authorName.maxlength[0] }).withMessage(authorName.maxlength[1]),

  validatorMiddleware('author')
];

export const createAuthorValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage(authorName.required[1])
    .isLength({ min: authorName.minlength[0] }).withMessage(authorName.minlength[1])
    .isLength({ max: authorName.maxlength[0] }).withMessage(authorName.maxlength[1]),

  validatorMiddleware('author')
];

export const updateAuthorValidator = [
  param('id')
    .isMongoId().withMessage("Invalid author id for updating"),

  ...createAuthorValidator
];

export const deleteAuthorValidator = [
  param('id')
    .isMongoId().withMessage("Invalid author id for deleting"),

  validatorMiddleware('author')
];

export const getEditAuthorFormValidator = [
  param('id')
    .isMongoId().withMessage("Invalid author id"),

  validatorMiddleware('author')
];