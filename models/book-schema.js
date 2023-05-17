import mongoose from 'mongoose'

const minPageCount = 1

const bookSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true,
    trim:true
  },
  description:{
    type:String,
    trim:true
  },
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
    type:mongoose.Schema.Types.ObjectId,
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


export default Book;
