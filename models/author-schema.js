import mongoose from 'mongoose'
import Book from './book-schema.js'

const authorSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true
  }
})
// required above means that we can't post to the database without the name 

// preventing deletion of the authors that has books
authorSchema.pre('findOneAndDelete',function(next){
  // this._conditions._id comes from the passed parameter in the function (findByIdAndDelete)
  Book.find({authorId:this._conditions._id})
  .then(books=>{
    if(books.length)
      next(new Error("This author has books"))
    else
      next()
  }).catch(err=>{
    next(err)
  })
})

const Author = mongoose.model("Author",authorSchema)

export default Author;