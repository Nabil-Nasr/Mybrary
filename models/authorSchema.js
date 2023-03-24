const mongoose = require('mongoose');
const Schema =mongoose.Schema

const authorSchema = new Schema({
  name:{
    type:String,
    required:true
  }
})
// required above means that we can't post to the database without the name 


const Author = mongoose.model("Author",authorSchema)

module.exports = Author