import express from 'express';
import { getBooks, getNewBookForm, createBook, getBook, getEditBookForm, updateBook, deleteBook } from '../controllers/books.js';
const router = express.Router();

//  /books
router.route('/')
  .get(getBooks)
  .post(createBook);

//  /books/new-book
router.get('/new-book', getNewBookForm);

//  /books/:id
router.route('/:id')
  .get(getBook)
  .put(updateBook)
  .delete(deleteBook);

//  /books/:id/edit-book
router.get('/:id/edit-book', getEditBookForm);




export default router;