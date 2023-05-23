import express from 'express'
import {getAuthors,getNewAuthorForm,createAuthor,getAuthor,getEditAuthorForm,updateAuthor,deleteAuthor} from '../controllers/authors.js'
import { getAuthorValidator,createAuthorValidator,updateAuthorValidator,deleteAuthorValidator ,getEditAuthorFormValidator} from "../utils/validators/authors.js";

const router = express.Router();

//  /authors
router.route('/')
.get(getAuthors)
.post(createAuthorValidator,createAuthor);

//  /authors/new-author
router.get('/new-author',getNewAuthorForm);

//  /authors/:id
router.route('/:id')
.get(getAuthorValidator,getAuthor)
.put(updateAuthorValidator,updateAuthor)
.delete(deleteAuthorValidator,deleteAuthor)

// this route shape is following rest principles
// this page for editing the author
//  /authors/:id/edit-author
router.get("/:id/edit-author",getEditAuthorForm)


export default router;