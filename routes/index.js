const express = require('express');
const router = express.Router()
const Book=require('../models/bookSchema')



router.get('/',(req,res) => {
  // when we rendering index.ejs we call it's layout
  // sort query by creation
  // with limit 10 books
  Book.find().sort({createAt:'desc'}).limit(50)
  .then(books=>{
    // sorting by creation time
    // res.render('index',{books:books.reverse()})
    res.render('index',{books})
  }).catch(err=>{
    res.render('index',{books:[]})
  })
})

module.exports =router