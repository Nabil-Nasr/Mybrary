import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import Book from './book.js';

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Author name required"],
    trim: true,
    minlength: [3, "Too short author name (3 characters minimum)"],
    maxlength: [32, "Too long author name (32 characters maximum)"],
    unique: true,
    uniqueCaseInsensitive: true,
  }
}, { timestamps: true });


// preventing deletion of the authors that has books
authorSchema.pre('findOneAndDelete', async function (next) {
  try {
    // this._conditions._id comes from the passed parameter in the function (findByIdAndDelete)
    const books = await Book.find({ authorId: this._conditions._id }).populate('authorId');
    if (books.length){
      const {authorId:author}=books[0]
      next(new Error(`The author (${author.name}) has books and can't be deleted`));
    }
    else
      next();
  } catch (err) {
    next(err);
  }
});

// creating error object for uniqueness like the other validation errors
authorSchema.plugin(uniqueValidator,{message:"Author {PATH} ({VALUE}) has been used before"});

const Author = mongoose.model("Author", authorSchema);

export default Author;