//import lib
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//config app
var app = new express();
var apiController = require('./controllers/apiController');
var htmlController = require('./controllers/htmlController');
var configDB = require('./config/database.js');
var port = 3000 || process.env.PORT;

mongoose.connect(configDB.url);

app.use('/assets', express.static(__dirname + '/public'));
app.use(bodyParser()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

//using controller 
htmlController(app);
apiController(app);

app.listen(port);
console.log('The magic happens on port '+ port);