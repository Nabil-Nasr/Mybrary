import { validatorMiddleware } from "../../middlewares/validator.js";
import { uploadImageToExpress } from "../image-upload.js";
import { body, param } from "express-validator";
import Book from "../../models/book.js";
import { validateCoverImage, checkAuthorExistence } from "./books-custom.js";

const { title: bookTitle, description: bookDescription, publishDate: bookPublishDate, pagesCount: bookPagesCount, authorId: bookAuthorId } = Book.schema.obj;

export const getBookValidator = [
  param('id')
    .isMongoId().withMessage("Invalid book id"), 

  validatorMiddleware('book')
];

export const createBookValidator = [
  // the function below should be the first middleware (to put the multipart/form-data into req.body)
  uploadImageToExpress('cover'),

  body('cover')
    .custom(validateCoverImage),

  body("title")
    .trim()
    .notEmpty().withMessage(bookTitle.required[1])
    .isLength({ min: bookTitle.minlength[0] }).withMessage(bookTitle.minlength[1])
    .isLength({ max: bookTitle.maxlength[0] }).withMessage(bookTitle.maxlength[1]),

  body("authorId")
    .notEmpty().withMessage(bookAuthorId.required[1])
    .isMongoId().withMessage("Invalid author id")
    .custom(checkAuthorExistence),

  body("publishDate")
    .notEmpty().withMessage(bookPublishDate.required[1])
    .isDate().withMessage("Wrong publish date format"),

  body("pagesCount")
    .notEmpty().withMessage(bookPagesCount.required[1])
    .isInt().withMessage(bookPagesCount.type[1].replace("a number", "an integer"))
    .isInt({ min: bookPagesCount.min[0] }).withMessage(bookPagesCount.min[1])
    .isInt({ max: bookPagesCount.max[0] }).withMessage(bookPagesCount.max[1]),

  body("description")
    .notEmpty().withMessage(bookDescription.required[1])
    .isLength({ min: bookDescription.minlength[0] }).withMessage(bookDescription.minlength[1])
    .isLength({ max: bookDescription.maxlength[0] }).withMessage(bookDescription.maxlength[1]),

  validatorMiddleware('book'),
];

export const updateBookValidator = [
  param('id')
    .isMongoId().withMessage("Invalid book id for updating"),

  ...createBookValidator
]

export const deleteBookValidator = [
  param('id')
    .isMongoId().withMessage("Invalid book id for deleting"), 

  validatorMiddleware('book')
];

export const getEditBookFormValidator = [
  param('id')
    .isMongoId().withMessage("Invalid book id"), 
    
  validatorMiddleware('book')
];

