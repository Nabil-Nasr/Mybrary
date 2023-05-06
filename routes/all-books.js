import express from 'express'
import Author from '../models/authorSchema.js'
import Book from '../models/bookSchema.js'
import fs from 'fs'
import {fileTypeFromFile} from 'file-type'

//for using multiplatform data like images
import multer from 'multer'
import ImageKit from 'imagekit'

const router = express.Router();
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
    const fileNameSuffix = `${(Math.round(Math.random() * 1e9) + "").slice(0, 7)}${Date.now()}`;
    file.originalname = `${file.originalname}${fileNameSuffix}`;
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

  query.find(searchOptions).limit(100)
    .then(books => {
      res.render('all-books/index', {
        books,
        searchOptions: req.query,
        authors,
        minPageCount:Book().minPageCount
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
        authors,
        errorMessage
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
    const {
      title,
      description,
      publishDate,
      pageCount,
      authorId
    } = req.body;
    await validateInputs(req)
    // createAt will be created automatically
    const book = new Book({
      title,
      description,
      publishDate: new Date(publishDate),
      pageCount,
      createAt:Date.now(),
      authorId,
      coverImageName: req.imageFile?.name,
      coverImageFileId: req.imageFile?.fileId,
      coverImageURL: req.imageFile?.url
    });

    book.save()
      .then(newBook => {
        res.redirect(`/all-books/${newBook.id}`);
      }).catch(err => {
        Author.find()
          .then(authors => {
            res.render('all-books/new-book', { 
              book, 
              authors, 
              errorMessage: req.fileErrorMessage});
          }).catch(err => {
            res.redirect('/');
          });
      });
  });
});

router.get('/:id', (req, res) => {
  // populate('authorId') will replace the authorId from it's document  with the author itself
  Book.findById(req.params.id).populate('authorId')
    .then(book => {
      res.render('all-books/show-book', { book, author: book.authorId });
    }).catch(err => {
      res.redirect('/');
    });
});

router.get('/:id/edit', (req, res) => {
  Author.find()
    .then(authors => {
      Book.findById(req.params.id)
        .then(book => {
          res.render('all-books/edit-book', {
            book,
            authors
          });
        });
    })
    .catch(err => {
      res.redirect('/all-books');
    });
});

router.put('/:id', (req, res) => {
  upload.array('cover')(req, res, async err => {
    let book;
    try {
      const {
        title,
        description,
        publishDate,
        pageCount,
        authorId
      } = req.body;
      book = await Book.findById(req.params.id);
      await validateInputs(req,book.coverImageFileId)
      book.title = title;
      book.description = description;
      book.publishDate = new Date(publishDate);
      book.pageCount = pageCount;
      book.authorId = authorId;
      // the information of the new image
      book.coverImageName = req.imageFile?.name;
      book.coverImageFileId = req.imageFile?.fileId;
      book.coverImageURL = req.imageFile?.url;
      await book.save();
      res.redirect(`/all-books/${book.id}`);
    } catch (err) {
      if (book == null)
        res.redirect('/');
      else
        Author.find()
          .then(authors => {
            res.render('all-books/edit-book', { 
              book, 
              authors, 
              errorMessage: req.fileErrorMessage 
            });
          }).catch(err => {
            res.redirect('/');
          });
    }
  });
});

router.delete('/:id', (req, res) => {
  Book.findByIdAndDelete(req.params.id)
    .then(book => {
      imageKit.deleteFile(book.coverImageFileId)
        .then(response => {
          res.redirect('/all-books');
        }).catch(err => {
          res.redirect('/');
        });
    }).catch(err => {
      res.redirect(`/all-books/${req.params.id}`);
    });
});

async function validateInputs(req,fileId=null){
  const minPageCount = Book().minPageCount
  req.imageFile = {};
  if(req.body.pageCount != '' && req.body.pageCount < minPageCount) {
    req.fileErrorMessage = `Minimum Page Count Should be (${minPageCount}) but (${req.body.pageCount}) Provided.`
    console.log(req.fileErrorMessage);
  } else {
    await validateUpload(req,fileId);
  }
}

async function validateUpload (req, fileId = null) {
  const imageMimeTypes = ['image/jpeg', 'image/bmp', 'image/webp', 'image/png', 'image/gif'];
  const maxSize = 2 * 1024 ** 2;

  if (req.files && req.files.length != 0) {
    if (req.files.length != 1)
      req.fileErrorMessage = "Too Many Files";
      // checking type by magic number
    else if (!imageMimeTypes.includes((await fileTypeFromFile(req.files[0].path))?.mime))
      req.fileErrorMessage = "Wrong File Type";
    else if (req.files[0].size > maxSize)
      req.fileErrorMessage = `File Too Large (Maximum => ${maxSize / 1024 ** 2}MB)`;
    else
      await imageUpload(req, fileId);

    req.files.forEach(file => {
      fs.unlink(file.path, err => {
        console.log(file.originalname, err ? err : " deleted");
      });
    });
  } else {
    req.fileErrorMessage = "Cover Image Required";
  }
}


async function imageUpload (req, fileId) {
  // imagekit adds unique suffix to the filename
  await imageKit.upload({
    file: fs.readFileSync(req.files[0].path),
    // add supporting of arabic letters
    fileName: Buffer.from(req.files[0].originalname, 'latin1').toString('utf-8').slice(0, -(7 + `${Date.now()}`.length)),
    folder: process.env.IMAGEKIT_UPLOAD_FOLDER,
    useUniqueFileName: true
  }).then(async newImageResponse => {
    // when PUT request
    if (fileId) {
      // delete old image
      await imageKit.deleteFile(fileId)
        .then(deletedImageResponse => {
          // when uploading and deleting is done
          req.imageFile = newImageResponse;
        }).catch(async err => {
          // when uploading is done and deleting is not (delete the new image and try again to save image server disk size)
          // first condition if the image accidentally deleted from imagekit
          if(err.message.match(/The requested file does not exist/i)) {
            req.imageFile = newImageResponse;
          } else {
            await imageKit.deleteFile(newImageResponse.fileId)
              .catch(err => {
                req.fileErrorMessage = "An Error Occurred During Image Upload. Please Try Again.";
              });
          }
        });
      // when POST request
    } else {
      req.imageFile = newImageResponse;
    }
  }).catch(err => {
    req.fileErrorMessage = "An Error Occurred During Image Upload. Please Try Again.";
  });
}


export default router;