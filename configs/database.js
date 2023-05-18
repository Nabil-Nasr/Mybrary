import mongoose from "mongoose";
import express from "express";
const PORT = process.env.PORT || 3000;

const app = express();

const database=()=>{
  mongoose.connect(process.env.DATABASE_URL)
    .then(result => {
      app.listen(PORT, (req, res) => {
        console.log(`mybrary app is listening at http://localhost:${PORT}`);
        console.log("Mongoose Connected");
      });
    }).catch(err => {
      console.error(err);
    });
}

export {app,database};

// another way to check the connection
/* 
const db = mongoose.connection
db.on('error',(err) => {
	console.error(err);
})
db.once('open',() => {
	console.error("Mongoose Connected");
})
 */