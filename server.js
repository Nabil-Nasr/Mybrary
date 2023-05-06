import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import methodOverride from 'method-override'
import indexRouter from './routes/index.js'
import allAuthorsRouter from './routes/all-authors.js'
import allBooksRouter from './routes/all-books.js'
import mongoose from 'mongoose'

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');
// two lines below will extract js ,link and style tags from the rendered ejs to layout.ejs 
// in the variables script and style
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)
app.use(expressLayouts);


// _method will be used in front-end post request
app.use(methodOverride("_method"));
app.use(express.static('public'));
// for receiving post requests from front-end
app.use(express.urlencoded({ limit: '10mb', extended: false }));



mongoose.connect(process.env.DATABASE_URL)
	.then(result => {
		app.listen(PORT, (req, res) => {
			console.log(`mybrary app is listening at http://localhost:${PORT}`);
			console.log("Mongoose Connected");
		});
	}).catch(err => {
		console.error(err);
	});

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
app.use('/', indexRouter);
app.use('/all-authors', allAuthorsRouter);
app.use('/all-books', allBooksRouter);