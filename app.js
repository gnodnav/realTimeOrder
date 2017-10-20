var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var orderController = require('./api/controllers/orderController.js');
var employeeController = require('./api/controllers/employeeController.js');
var uploadController = require('./api/controllers/uploadController.js');
var customerController = require('./api/controllers/customerController.js');
//conneted database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/order_manager', { useMongoClient: true });
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'views')));
app.use('/views', express.static(__dirname + '/views'));
app.use('/assets', express.static(__dirname + '/public'));
app.use('/bower', express.static(__dirname + '/bower_components'));

app.use('/', index);
app.use('/users', users);
//api
orderController(app);
employeeController(app);
uploadController(app);
customerController(app);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
