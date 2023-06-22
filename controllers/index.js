import Book from '../models/book.js';
import { ApiError } from '../utils/api-error.js';
import { paginate } from "../utils/api-features.js";

// @desc   Get home page
// @route  GET /
// @access Public
export const getBooks = async (req, res, next) => {
  let {errorMessage} = req.session;
  if(errorMessage){
    delete req.session.errorMessage;
  }
  try {
    const pagination = await paginate({ req, limit: process.env.PAGINATION_BOOKS_LIMIT, model: Book });

    const { findDocuments, pagesCount, currentPage, urlQuery } = pagination;

    const books = await findDocuments().sort({ createdAt: 'desc' });
    res.render('index', { books, pagesCount, currentPage, urlQuery, errorMessage });

  } catch (err) {
    console.log(err);
    if (err.statusCode === 404) {
      return next(err);
    }

    const errorMessage = "Can't connect to database to get books";
    next(new ApiError(errorMessage, 502, 'index', { books: [], pagesCount: 1, currentPage: 1, errorMessage, urlQuery: "" }));
  }
}