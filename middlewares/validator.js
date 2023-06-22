import { validationResult } from "express-validator";
import Author from "../models/author.js";
import { ApiError } from "../utils/api-error.js";
import { uploadImageToImagKit ,removeUploadedFiles} from "../utils/image-upload.js";


export const validatorMiddleware = (modelName) =>
  async (req, res, next) => {
    const errors = validationResult(req);

    if(req.hasImageToUploadToImageKit &&  errors.isEmpty()) {
      try{
        await uploadImageToImagKit(req)
      }catch(err){
        req.coverImageErrorMessage = err.message
      }
    }
    removeUploadedFiles(req)

    if (errors.isEmpty()&&!req.coverImageErrorMessage) {
      next()
    } else {
      const errorsMapped = errors.mapped();
      if (req.method === "GET") {
        if (errorsMapped.id) {
          next(new ApiError("not found", 404));
        }
      } else if ((req.method === "POST" || req.method === "PUT") && !errorsMapped.id) {
        let errorMessages = [];
        if(req.coverImageErrorMessage){
          errorMessages.push(req.coverImageErrorMessage)
        }
        for (let error of errors.array()) {
          errorMessages.push(error.msg);
        }
        const viewMethod = req.method === "POST" ? "new" : "edit";
        if (modelName.toLowerCase() === "book") {
          let authors = [];
          try {
            authors = await Author.find();
          } catch {
            errorMessages.unshift(`Can't connect to database to ${req.method==="POST"?"add new book":"update book details"}`);
            return next(new ApiError(errorMessages[0], 502, `books/${viewMethod}-book`, { errorMessages }));
          }
          if (authors.length == 0) {
            errorMessages.unshift("One Author at Least Required Before Creating a Book");
          }
          next(new ApiError("Invalid book details", 502, `books/${viewMethod}-book`, { book: { ...req.body, id: req.params?.id }, authors, errorMessages }));
        } else if (modelName.toLowerCase() === "author") {
          next(new ApiError("Invalid author name", 502, `authors/${viewMethod}-author`, { author: { ...req.body, id: req.params?.id }, errorMessages }));
        } else {
          next(new ApiError("Invalid login details", 401, `admins/login`,{errorMessages}));
        }

      } else if ((req.method === "PUT" || req.method === "DELETE") && errorsMapped.id) {
        const errorMessage = errorsMapped.id.msg;
        next(new ApiError(errorMessage, 502, 'errors/404', { errorMessage }));
      }
    }
  };
