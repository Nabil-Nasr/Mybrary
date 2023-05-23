import express from 'express';
import { getBooks, getNewBookForm, createBook, getBook, getEditBookForm, updateBook, deleteBook } from '../controllers/books.js';
import { getBookValidator, createBookValidator, updateBookValidator, deleteBookValidator, getEditBookFormValidator } from "../utils/validators/books.js";

const router = express.Router();

//  /books
router.route('/')
  .get(getBooks)
  .post(createBookValidator, createBook);

//  /books/new-book
router.get('/new-book', getNewBookForm);

//  /books/:id
router.route('/:id')
  .get(getBookValidator, getBook)
  .put(updateBookValidator, updateBook)
  .delete(deleteBookValidator, deleteBook);

//  /books/:id/edit-book
router.get('/:id/edit-book', getEditBookFormValidator, getEditBookForm);




export default router;