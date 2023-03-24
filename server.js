const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const port = process.env.PORT || 3000;
const indexRouter = require('./routes/index');
const allAuthorsRouter = require('./routes/all-authors');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
// for receiving post requests from front-end
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
// another way
// app.use(express.urlencoded({ extended: true }));

//for live reload
//=====================
/* {
	const path = require("path");
	const livereload = require("livereload");
	const liveReloadServer = livereload.createServer();
	liveReloadServer.watch(path.join(__dirname, 'public'));

	const connectLivereload = require("connect-livereload");
	app.use(connectLivereload());

	liveReloadServer.server.once("connection", () => {
		setTimeout(() => {
			liveReloadServer.refresh("/");
		}, 100);
	});
} */
//======================


const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
	.then(result => {
		app.listen(port, (req, res) => {
			console.log(`${require('./package.json').name} app is listening at http://localhost:${port}`);
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

