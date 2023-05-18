import express from 'express'
import Book from '../models/book.js'

const router = express.Router()



router.get('/',async (req,res) => {
  try{
    if(req.query.page != undefined && (isNaN(req.query.page) || Math.floor(req.query.page) <= 0)){
      res.redirect('/not-found')
      return
    }
    const currentPage = req.query.page == undefined ? 1: Math.floor(req.query.page)
    const booksLimit = 1
    const skippedBooks = (currentPage - 1) * booksLimit
    const booksCount = await Book.countDocuments()
    const pagesCount = Math.ceil(booksCount / booksLimit)

    const books = await Book.find().sort({createdAt:'desc'}).skip(skippedBooks).limit(booksLimit)
    res.render('index',{books,pagesCount,currentPage})
  }catch(err){
    res.render('index',{books:[],pagesCount:1})
  }
})

export default router;