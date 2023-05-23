import mongoose from "mongoose";
import express from "express";
const PORT = process.env.PORT || 3000;

const app = express();

const dbConnection=async ()=>{
  await mongoose.connect(process.env.DATABASE_URL)
    
  return app.listen(PORT, (req, res) => {
        console.log(`mybrary app is listening at http://localhost:${PORT}`);
        console.log("Mongoose Connected");
      })

}

export {app,dbConnection};