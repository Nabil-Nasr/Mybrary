import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email:{
    type:String,
    unique:true,
    required:true,
    trim:true,
    lowercase:true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  },
  password:{
    type:String,
    required:true,
    minlength:8
  }
})