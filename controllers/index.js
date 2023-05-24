import Book from '../models/book.js';
import { ApiError } from '../utils/api-error.js';
import { paginate } from "../utils/api-features.js";

export const getBooks = async (req, res, next) => {
  try {
    const pagination = await paginate({ req, limit: 4, model: Book });

    const { findDocuments, pagesCount, currentPage, urlQuery } = pagination;

    const books = await findDocuments().sort({ createdAt: 'desc' });
    res.render('index', { books, pagesCount, currentPage, urlQuery });

  } catch (err) {
    console.log(err);
    if (err.statusCode === 404) {
      return next(err);
    }

    const errorMessage = "Can't connect to database to get books";
    next(new ApiError(errorMessage, 502, 'index', { books: [], pagesCount: 1, currentPage: 1, errorMessage, urlQuery: "" }));
  }
}