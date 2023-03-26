const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema

const coverImageBasePath = 'uploads/bookCovers'

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
    required:true
  },
  createAt:{
    type:Date,
    required:true,
    default:Date.now()
  },
  coverImageName:{
    type:String,
    required:true
  },
  authorId:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:'Author'
  }
})
// the author type above is referencing for an id in another object
// and ref is what is object model that it refers to

// creates a getter method inside the object model that's shown only if it's called
// the function shouldn't be anonymous to make (this) work
bookSchema.virtual('coverImagePath').get(function(){
  if(this.coverImageName)
    return path.join('/',coverImageBasePath,this.coverImageName);
})



const Book = mongoose.model("Book",bookSchema)


module.exports = Book
module.exports.coverImageBasePath=coverImageBasePath