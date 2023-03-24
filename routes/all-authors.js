const express = require('express');
const router = express.Router();
const Author = require('../models/authorSchema');

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
      res.render('all-authors/index', {
        authors: authors,
        searchQuery: req.query.name
      });
    }).catch(err => {
      res.redirect('/');
    });
});


router.get('/new-author', (req, res) => {
  // when we rendering index.ejs we call it's layout
  res.render('all-authors/new-author', { author: new Author() });
});

router.post('/', (req, res) => {
  const author = new Author({
    name: req.body.name
  });
  // the callback no longer supported
  /*   author.save((err,newAuthor) => {
      if(err) {
        // if the author doesn't sended to database it opens again the page of the creation
        res.render('all-authors/new-author',{
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
      // res.redirect(`/all-authors/${newAuthor.id}`)
      res.redirect(`/all-authors`);
    }).catch(err => {
      res.render('all-authors/new-author', {
        author: author,
        errorMessage: "Error creating author"
      });
    });
});

module.exports = router;