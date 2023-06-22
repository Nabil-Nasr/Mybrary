import mongoose from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';

const adminSchema = new mongoose.Schema({
  email:{
    type:String,
    unique: true,
    uniqueCaseInsensitive: true,
    required:true,
    trim:true,
    lowercase:true,
  },
  // hashed password
  password:{
    type:String,
    required:true,
  },
})

adminSchema.plugin(uniqueValidator,{message:"Admin {PATH} ({VALUE}) has been used before"});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;