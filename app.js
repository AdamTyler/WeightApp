var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
var expressSession = require('express-session');
var expressValidator = require('express-validator');

var db = mongoose.connect('mongodb://localhost:27017/weight', function(err) {
  if(err) {
    console.log('mongo connection error', err);
  } else {
    console.log('mongo connection successful');
  }
});

var app = express();
app.locals.moment = require('moment');

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);
app.use(expressSession({
  secret: 'superSecretKey',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
var flash = require('express-flash');
app.use(flash());

var routes = require('./routes/index')(passport);
var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use(function(req, res, next){
  req.db = db;
  next();
});

app.use(function(req, res, next){
  req.redirect_to = req.url;
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
