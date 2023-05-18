import express from 'express'
import {getAuthors,getNewAuthorForm,createAuthor,getAuthor,getEditAuthorForm,updateAuthor,deleteAuthor} from '../controllers/authors.js'

const router = express.Router();

//  /authors
router.route('/')
.get(getAuthors)
.post(createAuthor);

//  /authors/new-author
router.get('/new-author',getNewAuthorForm );

//  /authors/:id
router.route('/:id')
.get(getAuthor)
.put(updateAuthor)
.delete(deleteAuthor)

// this route shape is following rest principles
// this page for editing the author
//  /authors/:id/edit-author
router.get("/:id/edit-author",getEditAuthorForm)


export default router;