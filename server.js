import expressLayouts from 'express-ejs-layouts'
import methodOverride from 'method-override'
import indexRouter from './routes/index.js'
import authorsRouter from './routes/authors.js'
import booksRouter from './routes/books.js'
import adminsRouter from './routes/admins.js'
import express from 'express';
import {app,database} from './configs/database.js';

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

database();



if(process.env.NODE_ENV === 'development'){
	try{
		const morgan = (await import('morgan')).default
		app.use(morgan('dev'))
		console.log(`mode:${process.env.NODE_ENV}`);
	}catch(error){
		console.log(error);
	}
}
app.use('/', indexRouter);
app.use('/authors', authorsRouter);
app.use('/books', booksRouter);
app.use('/admins', adminsRouter);