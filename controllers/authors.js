import Author from '../models/author.js';
import Book from '../models/book.js';
import { ApiError } from "../utils/api-error.js";
import { paginate } from "../utils/api-features.js";

// @desc   Get all authors
// @route  Get /authors
// @access Public
export const getAuthors = async (req, res, next) => {
  const { name } = req.query;
  try {
    const searchOptions = {};
    if (name) {
      searchOptions.name = new RegExp(name, 'i');
    }

    const pagination = await paginate({ req, limit: 2, model: Author, modelOptions: searchOptions });
    const { findDocuments, pagesCount, currentPage, urlQuery } = pagination;
    const authors = await findDocuments();

    res.render('authors', {
      authors,
      searchNameQuery: name,
      pagesCount, currentPage, urlQuery
    });
  } catch (err) {

    if (err.statusCode === 404) {
      return next(err);
    }

    const errorMessage = "Can't connect to database to get authors";
    next(new ApiError(errorMessage, 502, 'authors', { authors: [], searchNameQuery: name, errorMessage, pagesCount: 1, currentPage: 1, urlQuery: "" }));
  }
};

// @desc   Get new author page
// @route  Get /authors/new-author
// @access Public
export const getNewAuthorForm = async (req, res) => {
  res.render('authors/new-author', { author: new Author() });
};


// @desc   Create a new author
// @route  POST /authors
// @access Public
export const createAuthor = async (req, res, next) => {
  const { name } = req.body;
  try {
    const author = await Author.create({ name });
    res.redirect(`/authors/${author.id}`);
  } catch (err) {
    let errorMessages = [];

    if (err.errors) {
      for (let errorMessage of Object.values(err.errors).map(val => val.message)) {
        errorMessages.push(errorMessage);
      }
    }
    const tempMessage = "Can't connect to database to add new book";
    if (!errorMessages.length) {
      errorMessages[0] = tempMessage;
    }
    next(new ApiError(errorMessages[0], 502, 'authors/new-author', { author: { name }, errorMessages }));
  }
};

// @desc   Get author details
// @route  Get /authors/:id
// @access Public
export const getAuthor = async (req, res, next) => {
  const { id } = req.params;
  let errorMessage;
  if (req.session[id]) {
    ({ authorErrorMessage: errorMessage } = req.session[id]);
    delete req.session[id];
  }
  try {
    // throws error if the author id in wrong format
    // and this handled before in the validator
    const author = await Author.findById(id);
    if (!author) {
      // 404 statusCode calls the error page from the global error handler
      return next(new ApiError("Wrong author id", 404));
    }

    const pagination = await paginate({ req, limit: 4, model: Book, modelOptions: { authorId: id } });
    const { findDocuments, pagesCount, currentPage, urlQuery } = pagination;
    const books = await findDocuments();

    res.render('authors/show-author', {
      author, books,
      pagesCount, currentPage, urlQuery, errorMessage
    });
  } catch (err) {

    if (err.statusCode === 404) {
      return next(err);
    }

    const errorMessage = "Can't connect to database to get author details";
    next(new ApiError(errorMessage, 502, 'authors/show-author', { errorMessage }));
  }
};

// @desc   Get author edit page
// @route  Get /authors/:id/edit-author
// @access Public
export const getEditAuthorForm = async (req, res, next) => {
  const { id } = req.params;
  try {
    // throws error if the author id in wrong format
    // and this handled before in the validator
    const author = await Author.findById(id);
    if (!author) {
      return next(new ApiError("Wrong author id", 404));
    }
    res.render('authors/edit-author', { author });
  } catch {
    const errorMessage = "Can't connect to database to get author details that will be edited";
    next(new ApiError(errorMessage, 502, 'authors/edit-author', { errorMessage }));
  }
};

// @desc   Update author details
// @route  PUT /authors/:id
// @access Public
export const updateAuthor = async (req, res, next) => {
  const { id } = req.params;
  try {
    // the last option required for running mongoose unique validator
    const author = await Author.findById(id);
    if (!author) {
      const errorMessage = "Wrong author id for updating";
      return next(new ApiError(errorMessage, 502, 'errors/404', { errorMessage }));
    }
    await author.updateOne(req.body, { runValidators: true });
    res.redirect(`/authors/${author.id}`);
  } catch (err) {
    let errorMessages = [];
    if (err.errors) {
      for (let errorMessage of Object.values(err.errors).map(val => val.message)) {
        errorMessages.push(errorMessage);
      }
    }
    const tempMessage = "Can't connect to database to update author details";
    if (!errorMessages.length) {
      errorMessages[0] = tempMessage;
    }
    next(new ApiError(errorMessages[0], 502, 'authors/edit-author', { author: { ...req.body, id }, errorMessages }));
  }
};

// @desc   Delete an author
// @route  DELETE /authors/:id
// @access Public
export const deleteAuthor = async (req, res, next) => {
  const { id } = req.params;
  try {
    const author = await Author.findByIdAndDelete(id);
    if (!author) {
      const errorMessage = "Wrong author id for deleting";
      return next(new ApiError(errorMessage, 502, 'errors/404', { errorMessage }));
    }
    res.redirect('/authors');
  } catch (err) {
    // this message comes from the pre function in Author model
    if (`${err.message}`.match("has books and can't be deleted")) {
      req.session[id] = {};
      req.session[id].authorErrorMessage = err.message;
      return res.redirect(`/authors/${id}`);
    }
    const errorMessage = "Can't connect to database to delete author details";
    next(new ApiError(errorMessage, 502, 'authors/show-author', { errorMessage }));
  }
};