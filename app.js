var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require ('cors');
var session = require('express-session')
const bodyParser = require('body-parser');

var apiRouter = require('./routes/api')
var indexRouter = require('./routes/index')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// allow cors
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));


// logger
app.use(logger('dev'));

// express parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: false}));

// cookie
app.use(cookieParser());

// session
app.use(session({
  secret: 'csci2720',
  cookie: { httpOnly: false }
}))

// static file
app.use(express.static(path.join(__dirname, 'public')));

// router
app.use('/api', apiRouter);
app.use('/index', indexRouter)

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
