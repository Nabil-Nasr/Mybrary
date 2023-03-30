const express = require('express');
const router = express.Router();
const Author = require('../models/authorSchema');
const Book = require('../models/bookSchema');

//for using multiplatform data like images
const multer = require('multer');
const ImageKit = require('imagekit');
const dotenv = require('dotenv');
dotenv.config();
const imageMimeTypes = ['image/jpeg', 'image/bmp', 'image/webp', 'image/png', 'image/gif'];
const storage = multer.memoryStorage();
// the limit is 2MB and 1 file
const MB = 1024 ** 2;
const upload = multer({
  storage,
  limits: { fileSize: 2 * MB, files: 1 },
  fileFilter: (req, file, callback) => {
    // accepting images types only
    // if the second parameter was true then the file will be uploaded
    if (!imageMimeTypes.includes(file.mimetype))
      return callback(new Error('Wrong file type'));
    // add supporting of arabic letters
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf-8');
    callback(null, true);
  }
});

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// all books
router.get('/', async (req, res) => {
  // creates query from the model to search with
  let query = Book.find();
  let authors = await Author.find();
  const searchOptions = {};

  { // =========== add search queries ===========
    if (req.query.title)
      // search by regex in the query documents
      query = query.regex('title', new RegExp(req.query.title, 'i'));
    if (req.query.authorId)
      searchOptions.authorId = req.query.authorId;
    if (req.query.createdBefore)
      // search with condition <=
      query = query.lte('createAt', req.query.createdBefore);
    if (req.query.createdAfter)
      // search with condition >=
      query = query.gte('createAt', req.query.createdAfter);
    if (req.query.publishedBefore)
      query = query.lte('publishDate', req.query.publishedBefore);
    if (req.query.publishedAfter)
      query = query.gte('publishDate', req.query.publishedAfter);
    if (req.query.minPageCount)
      query = query.gte('pageCount', req.query.minPageCount);
    if (req.query.maxPageCount)
      query = query.lte('pageCount', req.query.maxPageCount);
  }

  query.find(searchOptions)
    .then(books => {
      res.render('all-books/index', {
        books,
        searchOptions: req.query,
        authors
      });
    }).catch(err => {
      res.redirect('/');
    });
});

//  /all-books/new-book
router.get('/new-book', (req, res) => {
  Author.find()
    .then(authors => {
      let errorMessage;
      if (authors.length == 0)
        errorMessage = "Create One Author at Least Before Creating a Book";
      res.render('all-books/new-book', {
        book: new Book(),
        authors: authors,
        errorMessage,
        externalJSPath:"/js/new-book.js"
      });
    })
    .catch(err => {
      res.redirect('/all-books');
    });
});
// post request with upload single file with name cover
router.post('/', (req, res) => {
  upload.single('cover')(req, res, async err => {
    let errorMessage;
    let imageFile = {};
    if (err) {
      errorMessage = err.message;
    } else if (req.file) {
      // imagekit adds unique suffix to the filename
      await imageKit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: process.env.IMAGEKIT_UPLOAD_FOLDER,
        useUniqueFileName:true
      }).then(response => {
        imageFile = response;
      }).catch(err => {
        errorMessage = "An error occurred during image upload. Please try again.";
      });
    }

    const {
      title,
      description,
      publishDate,
      pageCount,
      authorId
    } = req.body;
    // createAt will be created automatically
    const book = new Book({
      title,
      description,
      publishDate: new Date(publishDate),
      pageCount,
      authorId,
      coverImageName: imageFile.name,
      coverImageFileId: imageFile.fileId,
      coverImageURL: imageFile.url
    });

    book.save()
      .then(result => {
        res.redirect('/all-books');
      }).catch(err => {
        Author.find()
          .then(authors => {
            res.render('all-books/new-book', { book: book, authors, errorMessage });
          }).catch(err=>{
            res.redirect('/')
          })
      });
  });
});


module.exports = router;