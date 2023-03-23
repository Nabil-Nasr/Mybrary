const express = require('express');
const router = express.Router()

router.get('/',(req,res) => {
  // when we rendering index.ejs we call it's layout
  res.render('index')
})

module.exports =router