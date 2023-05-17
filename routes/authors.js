import express from 'express'
import Author from '../models/author-schema.js'
import Book from '../models/book-schema.js'

const router = express.Router();

// all authors
router.get('/', (req, res) => {
  let searchOptions = {};
  // req.query comes from get request in the form
  // query is string in the url
  if (req.query.name) {
    // making the search query a regular expression
    searchOptions.name = new RegExp(req.query.name, 'i');
  } 
  // it searching (finding) by regular expression
  Author.find(searchOptions)
    .then(authors => {
      // when we rendering index.ejs we call it's layout
      res.render('authors/index', {
        authors: authors,
        searchNameQuery: req.query.name
      });
    }).catch(err => {
      res.redirect('/');
    });
});


router.get('/new-author', (req, res) => {
  // when we rendering index.ejs we call it's layout
  res.render('authors/new-author', { author: new Author() });
});

router.post('/', (req, res) => {
  const author = new Author({
    name: req.body.name
  });
  // the callback no longer supported
  /*   author.save((err,newAuthor) => {
      if(err) {
        // if the author doesn't sended to database it opens again the page of the creation
        res.render('authors/new-author',{
          author:author,
          errorMessage:"Error creating author"
        })
      }else {
        console.log(newAuthor.id,author.id);
      }
    }) */
  author.save()
    .then(newAuthor => {
      // newAuthor is same as author above
      res.redirect(`/authors/${newAuthor.id}`);
    }).catch(err => {
      res.render('authors/new-author', {
        author,
        errorMessage: "Error creating author"
      });
    });
});

router.get("/:id",(req,res)=>{
    Author.findById(req.params.id)
    .then(author=>{
      Book.find({authorId:author.id}).limit(50)
      .then(books=>{
        res.render('authors/show-author',{author,books})
      }).catch(err=>{
        res.redirect('/')
      })
    }).catch(err=>{
      res.redirect('/')
    })
})

// this route shape is following rest principles
// this page for editing the author
router.get("/:id/edit",(req,res)=>{
  Author.findById(req.params.id)
  .then(author=>{
    res.render('authors/edit-author', { author });
  }).catch(err=>{
    res.redirect("/authors")
  })
})

// this page doing what happened in the edit page
router.put("/:id",async(req,res)=>{
  let author;
  try{
    author= await Author.findById(req.params.id)
    author.name=req.body.name
    await author.save()
    res.redirect(`/authors/${author.id}`)
  }catch{
    // first condition if the id not exists or there is no internet
    if(author==null)
      res.redirect('/')
    // second condition if there is a problem when saving the author
    else 
      res.render('authors/edit-author', {
        author,
        errorMessage: "Error updating author"
      });
  }
  /* //another way
  Author.findById(req.params.id)
  .then(author=>{
    author.name=req.body.name
    author.save()
    .then(author=>{
      res.redirect(`/authors/${author.id}`)
    }).catch(err=>{
      res.render('authors/edit-author', {
        author,
        errorMessage: "Error updating author"
      });
    })
  }).catch(err=>{
    res.redirect('/')
  }) 
  */
})

router.delete("/:id", (req,res)=>{
  Author.findByIdAndDelete(req.params.id)
  .then(author=>{
    res.redirect('/authors')
  }).catch(err=>{
    res.redirect(`/authors/${req.params.id}`)
  })
})

export default router;