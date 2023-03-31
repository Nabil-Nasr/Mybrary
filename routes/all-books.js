const express = require('express');
const router = express.Router();
const Author = require('../models/authorSchema');
const Book = require('../models/bookSchema');
const fs = require('fs');

//for using multiplatform data like images
const multer = require('multer');
const ImageKit = require('imagekit');
// we shouldn't change this path because it's the only writable path on cyclic.sh
const tempUploadPath = "/tmp";
// add file to disk storage then upload the buffer to the image server
// this saving the app from crashing because out of memory
const storage = multer.diskStorage({
  destination: tempUploadPath,
  filename: (req, file, callback) => {
    // for saving the user file name (not giving random name)
    // then add random number to avoid users overwriting files
    // then deleting the suffix when uploading to the image server
    file.originalname = `${file.originalname}${Math.round(Math.random()*1e9)}${Date.now()}`
    callback(null, file.originalname);
  }
});
const upload = multer({ storage });

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
        externalJSPath: "/js/new-book.js"
      });
    })
    .catch(err => {
      res.redirect('/all-books');
    });
});

// post request with upload single file with cover fieldName 
router.post('/', (req, res) => {
  // uploading 1 file as array to validate the files number (avoiding manipulating in the file input)
  upload.array('cover')(req, res, async err => {
    // filtering and limiting the file by our method not by multer methods to avoid some multer crashes
    await validateUpload(req);
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
      coverImageName: req.imageFile.name,
      coverImageFileId: req.imageFile.fileId,
      coverImageURL: req.imageFile.url
    });

    book.save()
      .then(result => {
        res.redirect('/all-books');
      }).catch(err => {
        Author.find()
          .then(authors => {
            res.render('all-books/new-book', { book: book, authors, errorMessage: req.fileErrorMessage });
          }).catch(err => {
            res.redirect('/');
          });
      })
  });
});

async function validateUpload (req) {
  const imageMimeTypes = ['image/jpeg', 'image/bmp', 'image/webp', 'image/png', 'image/gif'];
  const maxSize = 2 * 1024 ** 2;
  req.imageFile = {};
  if (req.files && req.files.length != 0) {
    if (req.files.length != 1) {
      req.fileErrorMessage = "Too many files";
    }
    else if (!imageMimeTypes.includes(req.files[0].mimetype))
      req.fileErrorMessage = "Wrong file type";
    else if (req.files[0].size > maxSize)
      req.fileErrorMessage = `File too large (Maximum => ${maxSize / 1024 ** 2}MB)`;
    else {
      // imagekit adds unique suffix to the filename
      await imageKit.upload({
        file: fs.readFileSync(req.files[0].path),
        // add supporting of arabic letters
        fileName: Buffer.from(req.files[0].originalname, 'latin1').toString('utf-8').slice(0,-(9+(`${Date.now()}`).length)),
        folder: process.env.IMAGEKIT_UPLOAD_FOLDER,
        useUniqueFileName: true
      }).then(response => {
        req.imageFile = response;
      }).catch(err => {
        req.fileErrorMessage = "An error occurred during image upload. Please try again.";
      });
    }
    req.files.forEach(file=>{
      fs.unlink(file.path,err=>{
        console.log(file.originalname," deleted",err)
      })
    })
  } else {
    req.fileErrorMessage = "Cover image required";
  }
}

module.exports = router;