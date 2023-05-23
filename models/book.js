import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator';


const minPagesCount = 1

const bookSchema = new mongoose.Schema({
  title:{
    type:String,
    required:[true,"Book title required"],
    minlength:[5,"Too short book title (5 characters minimum)"],
    maxlength:[100,"Too long book title (100 characters maximum)"],
    unique: true,
    uniqueCaseInsensitive: true,
    trim:true
  },
  description:{
    type:String,
    required:[true,"Book description required"],
    minlength:[20,"Too short book description (20 characters minimum)"],
    maxlength:[3000,"Too long book description (1000 characters maximum)"],
    trim:true
  },
  publishDate:{
    type:Date,
    required:[true,"Book publish date required"]
  },
  pagesCount:{
    type:[Number,"Book pages count must be a number"],
    min:[minPagesCount,`Minimum pages count is (${minPagesCount})`],
    max:[5000,`Maximum pages count is (5000)`],
    required:[true,"Book pages count required"]
  },
  authorId:{
    type:mongoose.Schema.Types.ObjectId,
    required:[true,"Book author required"],
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
  // timestamps for saving updatedAt and createdAt
},{timestamps:true})
// the author type above is referencing for an id in another object
// and ref is what is object model that it refers to

bookSchema.virtual('minPagesCount').get(function(){
  return minPagesCount;
})


bookSchema.plugin(uniqueValidator,{message:"Book {PATH} ({VALUE}) has been used before"});



const Book = mongoose.model("Book",bookSchema)


export default Book;
