import express from 'express';
import { getBooks, getNewBookForm, createBook, getBook, getEditBookForm, updateBook, deleteBook } from '../controllers/books.js';
import { getBookValidator, createBookValidator, updateBookValidator, deleteBookValidator, getEditBookFormValidator } from "../utils/validators/books.js";
import { checkAdmin, protect } from "../middlewares/auth.js";

const router = express.Router();

//  /books
router.route('/')
  .get(checkAdmin,getBooks)
  .post(protect,createBookValidator, createBook);

//  /books/new-book
router.get('/new-book',protect, getNewBookForm);

//  /books/:id
router.route('/:id')
  .get(checkAdmin,getBookValidator, getBook)
  .put(protect,updateBookValidator, updateBook)
  .delete(protect,deleteBookValidator, deleteBook);

//  /books/:id/edit-book
router.get('/:id/edit-book',protect, getEditBookFormValidator, getEditBookForm);




export default router;