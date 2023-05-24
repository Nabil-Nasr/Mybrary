import { ApiError } from "./api-error.js";
import querystring from 'querystring';


export const paginate = async ({ req, limit, model, modelOptions = {} }) => {

  const { page } = req.query;
  delete req.query.page;
  if (page != undefined && (isNaN(page) || Math.floor(page) <= 0)) {
    throw new ApiError("not found", 404);
  }

  const currentPage = page == undefined ? 1 : Math.floor(page);
  const skippedDocuments = (currentPage - 1) * limit;
  // using find() to accept the use of clone()
  const documentsCount = await model.find().clone().countDocuments(modelOptions);
  const pagesCount = Math.ceil(documentsCount / limit);

  const findDocuments = () => model.find(modelOptions).skip(skippedDocuments).limit(limit);


  return { findDocuments, pagesCount, currentPage, urlQuery: querystring.stringify(req.query) };
};