import Author from '../models/author.js';
import Book from '../models/book.js';
import { ApiError } from "../utils/api-error.js";
import { paginate } from "../utils/api-features.js";
import { imageKit } from "../utils/image-upload.js";


// @desc   Get all books
// @route  GET /books
// @access Public
export const getBooks = async (req, res, next) => {
  const { title, authorId, createdBefore, createdAfter, publishedBefore, publishedAfter, minPagesCount, maxPagesCount } = req.query;
  try {
    let query = Book.find();
    const searchOptions = {};

    { // =========== add search queries ===========
      if (title)
        query = query.regex('title', new RegExp(title, 'i'));
      if (authorId)
        searchOptions.authorId = authorId;
      if (createdBefore)
        query = query.lte('createdAt', createdBefore);
      if (createdAfter)
        query = query.gte('createdAt', createdAfter);
      if (publishedBefore)
        query = query.lte('publishDate', publishedBefore);
      if (publishedAfter)
        query = query.gte('publishDate', publishedAfter);
      if (minPagesCount)
        query = query.gte('pagesCount', minPagesCount);
      if (maxPagesCount)
        query = query.lte('pagesCount', maxPagesCount);
    }

    const pagination = await paginate({ req, limit: process.env.PAGINATION_BOOKS_LIMIT, model: query, modelOptions: searchOptions });
    const { findDocuments, pagesCount, currentPage, urlQuery } = pagination;

    const books = await findDocuments();
    const authors = await Author.find();

    res.render('books', {
      books,
      searchOptions: req.query,
      authors,
      minPagesCount: Book().minPagesCount,
      pagesCount, currentPage, urlQuery
    });
  } catch (err) {

    if (err.statusCode === 404) {
      return next(err);
    }

    const errorMessage = "Can't connect to database to get books or authors";
    next(new ApiError(errorMessage, 502, 'books', { books: [], authors: [], minPagesCount: Book().minPagesCount, searchOptions: req.query, errorMessage, currentPage: 1, pagesCount: 1, urlQuery: "" }));
  }
};

// @desc   Get new book form page
// @route  GET /books/new-book
// @access Private
export const getNewBookForm = async (req, res, next) => {
  try {
    const authors = await Author.find();
    let errorMessage;
    if (authors.length == 0) {
      errorMessage = "One Author at Least Required Before Creating a Book";
    }
    res.render('books/new-book', {
      book: new Book(),
      authors,
      errorMessage
    });
  } catch {
    const errorMessage = "Can't connect to database to get the available authors before creating a Book";
    next(new ApiError(errorMessage, 502, `books/new-book`, { errorMessage }));
  }
};

// @desc   Create a new book
// @route  POST /books
// @access Private
export const createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.redirect(`/books/${book.id}`);
  } catch (err) {
    let errorMessages = [];
    // for uniqueness error most of the time
    if (err.errors) {
      // push all error messages from schema paths
      for (let errorMessage of Object.values(err.errors).map(val => val.message)) {
        errorMessages.push(errorMessage);
      }
    }
    const tempMessage = "Can't connect to database to add new book";
    if (!errorMessages.length) {
      errorMessages[0] = tempMessage;
    }

    let authors = [];
    try {
      if (req.body.coverImageFileId) {
        await imageKit.deleteFile(req.body.coverImageFileId);
      }
      authors = await Author.find();
    } catch {
      return next(new ApiError(tempMessage, 502, `books/new-book`, { errorMessage: tempMessage }));
    }
    if (authors.length == 0) {
      errorMessages.unshift("One Author at Least Required Before Creating a Book");
    }

    next(new ApiError("Invalid book details", 502, `books/new-book`, { book: req.body, authors, errorMessages }));
  }
};

// @desc   Get book details
// @route  GET /books/:id
// @access Public
export const getBook = async (req, res, next) => {
  const { id } = req.params;
  const { bookErrorMessage: errorMessage } = req.session;
  delete req.session.bookErrorMessage;
  try {
    const book = await Book.findById(id).populate('authorId');
    if (!book) {
      return next(new ApiError("Wrong book id", 404));
    }
    res.render('books/show-book', { book, author: book.authorId, errorMessage });
  } catch {
    const errorMessage = "Can't connect to database to get book details";
    next(new ApiError(errorMessage, 502, 'books/show-book', { errorMessage }));
  }
};

// @desc   Get edit book details
// @route  GET /books/:id/edit-book
// @access Private
export const getEditBookForm = async (req, res, next) => {
  const { id } = req.params;
  try {
    const authors = await Author.find();
    const book = await Book.findById(id);
    if (!book) {
      return next(new ApiError("Wrong book id", 404));
    }
    res.render('books/edit-book', { book, authors });
  } catch {
    const errorMessage = "Can't connect to database to get book details that will be edited";
    next(new ApiError(errorMessage, 502, 'books/edit-book', { errorMessage }));
  }
};

// @desc   Update book details
// @route  PUT /books/:id
// @access Private
export const updateBook = async (req, res, next) => {
  const { id } = req.params;
  try {
    const book = await Book.findById(id);
    if (!book) {
      const errorMessage = "Wrong book id for updating";
      return next(new ApiError(errorMessage, 502, 'errors/404', { errorMessage }));
    }
    await book.updateOne(req.body, { runValidators: true });
    res.redirect(`/books/${book.id}`);
  } catch (err) {
    let errorMessages = [];
    // for uniqueness error most of the time
    if (err.errors) {
      // push all error messages from schema paths
      for (let errorMessage of Object.values(err.errors).map(val => val.message)) {
        errorMessages.push(errorMessage);
      }
    }
    const tempMessage = "Can't connect to database to update book details";
    if (!errorMessages.length) {
      errorMessages[0] = tempMessage;
    }

    let authors = [];
    try {
      if (req.body.coverImageFileId) {
        await imageKit.deleteFile(req.body.coverImageFileId);
      }
      authors = await Author.find();
    } catch (err) {
      return next(new ApiError(tempMessage, 502, `books/edit-book`, { errorMessage: tempMessage }));
    }
    if (authors.length == 0) {
      errorMessages.unshift("One Author at Least Required Before Creating a Book");
    }

    next(new ApiError("Invalid book details", 502, `books/edit-book`, { book: { ...req.body, id }, authors, errorMessages }));
  }
};

// @desc   Delete a book
// @route  DELETE /books/:id
// @access Private
export const deleteBook = async (req, res, next) => {
  const { id } = req.params;
  let book;
  let deleted = {};
  try {
    book = await Book.findByIdAndDelete(id);
    if (!book) {
      const errorMessage = "Wrong book id for deleting";
      return next(new ApiError(errorMessage, 502, 'errors/404', { errorMessage }));
    }
    deleted.book = true;
    await imageKit.deleteFile(book.coverImageFileId);
    deleted.image = true;
    res.redirect('/books');
  } catch {
    let errorMessage = "Can't connect to database to delete book details";

    if (deleted.book && !deleted.image) {
      try {
        book = await Book.create(book);
        req.session.bookErrorMessage = errorMessage;
        return res.redirect(`/books/${book.id}`);
      } catch {
        errorMessage = "Can't connect to image server to delete cover image";
      }
    }

    next(new ApiError(errorMessage, 502, 'books/show-book', { errorMessage }));
  }
};