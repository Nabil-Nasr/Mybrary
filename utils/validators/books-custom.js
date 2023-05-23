import Author from "../../models/author.js"
import Book from "../../models/book.js"
import {fileTypeFromFile} from 'file-type'

export const validateCoverImage = async (value,{req})=>{
  const imageMimeTypes = ['image/jpeg', 'image/bmp', 'image/webp', 'image/png', 'image/gif'];
  const maxSize = 2 * 1024 ** 2;
  if(!req.files || !req.files.length){
    if(req.method=="POST"){
      throw new Error("Book cover image required")
    }
  }else if(req.files.length!=1){
    throw new Error("Too many uploaded files")
  }else if(!imageMimeTypes.includes((await fileTypeFromFile(req.files[0].path))?.mime)){
    throw new Error("Wrong file type")
  }else if (req.files[0].size > maxSize){
    throw new Error(`File too large (Maximum => ${maxSize / 1024 ** 2}MB)`)
  }else{
    if(req.method=="PUT"){
      try{
        const coverImageFileId=(await Book.findById(req.params.id))?.coverImageFileId
        if(!coverImageFileId){
          throw new Error("ObjectId")
        }
        req.oldCoverImageFileId = coverImageFileId
      }catch(err){
        if(`${err.message}`.match("ObjectId")){
          throw new Error("Can't get the old image to replace because of wrong book id")
        }
        throw new Error("Can't connect to database to update cover image")
      }
    }
    req.hasImageToUploadToImageKit = true;
  }
}

export const checkAuthorExistence = async value=>{
  try{
    const author = await Author.findById(value);
    if(!author){
      throw new Error("ObjectId")
    }
  }catch(err){
    // matches my message and mongoose message
    if(`${err.message}`.match("ObjectId")){
      throw new Error("The author id not belongs to any author")
    }else{
      throw new Error("Can't connect to database to check author existence")
    }
  }
}