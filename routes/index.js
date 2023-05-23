import express from 'express'
import Book from '../models/book.js'
import {ApiError} from '../utils/api-error.js'

const router = express.Router()



router.get('/',async (req,res,next) => {
  const {page} = req.query
  try{
    if(page != undefined && (isNaN(page) || Math.floor(page) <= 0)){
      return next(new ApiError("Not found", 404))
    }
    const currentPage = page == undefined ? 1: Math.floor(page)
    const booksLimit = 4
    const skippedBooks = (currentPage - 1) * booksLimit
    const booksCount = await Book.countDocuments()
    const pagesCount = Math.ceil(booksCount / booksLimit)

    const books = await Book.find().sort({createdAt:'desc'}).skip(skippedBooks).limit(booksLimit)
    res.render('index',{books,pagesCount,currentPage})
  }catch(err){
    const errorMessage = "Can't connect to database to get books";
    next(new ApiError(errorMessage, 502, 'index', {books:[],pagesCount:1,currentPage:1,errorMessage}))
  }
})

export default router;