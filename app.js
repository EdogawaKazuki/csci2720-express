var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require ('cors');
var session = require('express-session')

var apiRouter = require('./routes/api')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// allow cors
app.use(cors());


// logger
app.use(logger('dev'));

// express parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cookie
app.use(cookieParser());

// session
app.use(session({
  secret: 'csci2720'
}))

// static file
app.use(express.static(path.join(__dirname, 'public')));

// router
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
