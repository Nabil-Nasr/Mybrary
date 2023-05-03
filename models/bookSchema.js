const mongoose = require('mongoose');
const Schema = mongoose.Schema

const minPageCount = 1

const bookSchema = new Schema({
  title:{
    type:String,
    required:true
  },
  description:String,
  publishDate:{
    type:Date,
    required:true
  },
  pageCount:{
    type:Number,
    min:[minPageCount,`Minimum Page Count Should be (${minPageCount})`],
    required:true
  },
  createAt:{
    type:Date,
    required:true,
  },
  authorId:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:'Author'
  },
  coverImageName:{
    type:String,
    required:true
  },
  coverImageFileId:{
    type:String,
    required:true
  },
  coverImageURL:{
    type:String,
    required:true
  }
})
// the author type above is referencing for an id in another object
// and ref is what is object model that it refers to

bookSchema.virtual('minPageCount').get(function(){
  return minPageCount;
})



const Book = mongoose.model("Book",bookSchema)


module.exports = Book
