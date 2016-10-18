//import lib
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');

//config app
var app = new express();

//import router 
var apiRouter = require('./app/routers/apiRouter');
var htmlRouter = require('./app/routers/htmlRouter');
var authRouter = require('./app/routers/authRouter');

var config = require('./config/database.js');
var port = 3000 || process.env.PORT;

//setting database
mongoose.connect(config.url);

app.use('/assets', express.static(__dirname + '/public'));
app.use(bodyParser()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));

//allow web page can access control to the api
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
     // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
});
//setting template for app
app.set('view engine','ejs');

//using router for each router file
app.use('/',htmlRouter);
app.use('/api',apiRouter);
app.use('/auth',authRouter);


app.listen(port);
console.log('The magic happens on port '+ port);