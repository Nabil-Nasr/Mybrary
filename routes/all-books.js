const express = require('express'); 
const mongoose = require('mongoose')
const router = express.Router();
//for using multiplatform data like images
const multer = require('multer');
const Author = require('../models/authorSchema');
const Book = require('../models/bookSchema');
const fs = require('fs');
const path = require('path');
const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg','image/bmp','image/webp', 'image/png', 'image/gif'];

const storage = multer.diskStorage({
  destination:(req,file,callback)=>{
    // searching for directory existence
    if(!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath)
    callback(null,uploadPath)
  },
  filename:(req,file,callback)=>{
    const fileNamePrefix = `${Date.now()}-${Math.round(Math.random()*1e9)}-`
    callback(null,fileNamePrefix+file.originalname)
  }
})
// when using option storage(it gives error when the destination not exists)
// but it is replaced with dest:pathName it creates the path automatically
// the limit is 2MB and 1 file
const MB = 1024**2;
const upload = multer({
  storage,
  limits:{fileSize:2*MB,files:1},
  fileFilter: (req, file, callback) => {
    // accepting images types only
    // if the second parameter was true then the file will be uploaded
    callback(null, imageMimeTypes.includes(file.mimetype));
  }
});

// all books
router.get('/', async(req, res) => {
  // creates query from the model to search with
  let query = Book.find()
  let authors = await Author.find()
  const searchOptions={}

{ // =========== add search queries ===========
  if(req.query.title)
  // search by regex in the query documents
    query=query.regex('title', new RegExp(req.query.title,'i'))
  if(req.query.authorId)
    searchOptions.authorId=req.query.authorId
  if(req.query.createdBefore)
  // search with condition <=
    query = query.lte('createAt', req.query.createdBefore)
  if(req.query.createdAfter)
  // search with condition >=
    query = query.gte('createAt', req.query.createdAfter)
  if(req.query.publishedBefore)
    query = query.lte('publishDate', req.query.publishedBefore)
  if(req.query.publishedAfter)
    query = query.gte('publishDate', req.query.publishedAfter)
  if(req.query.minPageCount)
    query = query.gte('pageCount', req.query.minPageCount)
  if(req.query.maxPageCount)
    query = query.lte('pageCount', req.query.maxPageCount)

}

  query.find(searchOptions)
  .then(books=>{
      res.render('all-books/index',{
        books,
        searchOptions:req.query,
        authors
      })
  }).catch(err=>{
    res.redirect('/')
  })
});

//  /all-books/new-book
router.get('/new-book', (req, res) => {
  Author.find()
    .then(authors => {
      res.render('all-books/new-book', {
        book: new Book(),
        authors: authors
      });
    })
    .catch(err => {
      res.redirect('/all-books');
    });
});
// post request with upload single file with name cover
router.post('/',(req, res) => {
  upload.single('cover')(req,res, err=>{
    let errorMessage;
    const fileName = req.file?req.file.filename:null;
    if(err){
      errorMessage = err.message;
    }
    const { title, authorId, pageCount,publishDate, description } = req.body;
    // createAt will be created automatically
    const book = new Book({
      title, authorId, pageCount, description,coverImageName:fileName,publishDate:new Date(publishDate)
    });

    book.save()
    .then(result=>{
      res.redirect('/all-books')
    }).catch(err=>{
      // if the file has a name then it's created
      if(fileName) {
      fs.unlink(path.join(uploadPath,fileName),err=>{
        console.log(fileName+" was deleted");
      })
      }
      Author.find()
      .then(authors=>{
        res.render('all-books/new-book',{book:book,authors,errorMessage})
      })
    })
  })
});


module.exports = router;