import express from 'express'
import {getAuthors,getNewAuthorForm,createAuthor,getAuthor,getEditAuthorForm,updateAuthor,deleteAuthor} from '../controllers/authors.js'
import { getAuthorValidator,createAuthorValidator,updateAuthorValidator,deleteAuthorValidator ,getEditAuthorFormValidator} from "../utils/validators/authors.js";
import { protect,checkAdmin } from "../middlewares/auth.js";

const router = express.Router();

//  /authors
router.route('/')
.get(checkAdmin,getAuthors)
.post(protect,createAuthorValidator,createAuthor);

//  /authors/new-author
router.get('/new-author',protect,getNewAuthorForm);

//  /authors/:id
router.route('/:id')
.get(checkAdmin,getAuthorValidator,getAuthor)
.put(protect,updateAuthorValidator,updateAuthor)
.delete(protect,deleteAuthorValidator,deleteAuthor)

// this route shape is following rest principles
// this page for editing the author
//  /authors/:id/edit-author
router.get("/:id/edit-author",protect,getEditAuthorFormValidator,getEditAuthorForm)


export default router;