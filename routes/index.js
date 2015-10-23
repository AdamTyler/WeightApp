var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var User = require('../models/user');
var passport = require('passport');
var router = express.Router();

// TODO: Move this to models
var recSchema = mongoose.Schema({
  date: Date,
  weight: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
});
var Recording = mongoose.model('Recording', recSchema);

var isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated())
    return next();
  req.session.redirect_to = req.url;
  res.redirect('/');
}


module.exports = function(passport) {

  /* GET login page. */
  router.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('login', {
      title: 'WeightApp Login',
      message: req.flash('message')
    });
  });

  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    failureRedirect: '/',
    failureFlash: true
  }), function(req, res) {
    res.redirect(req.session.redirect_to || '/home');
  });

  /* Handle Logout */
  router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  /* GET Registration Page */
  router.get('/signup', function(req, res) {
    res.render('signup', {
      title: 'WeightApp Sign Up'
    });
  });

  /* Handle Registration POST */
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash: true
  }));


  /* GET home page. */
  router.get('/home', isAuthenticated, function(req, res, next) {
    var avgWeight = 0;
    var recordings = 7;
    Recording.find({user: req.user}).sort('-date').exec(function(err, rec){
      if(rec.length !== 0) {
        if(rec.length < 7) { recordings = rec.length; }
        for(var i = 0; i < recordings; i++){
          console.log(rec[i])
          avgWeight += rec[i].weight;
        }
      }
      res.render('index', { title: 'The Weight App', rec: rec, avg: avgWeight/recordings });
    });
  });

  router.get('/record', isAuthenticated, function(req, res, next) {
    res.render('record');
  });

  router.post('/save', isAuthenticated, function(req, res, next) {
    var info = req.body;
    info.user = req.user;
    info.date = info.date + ' ' + moment().format('h:mm:ss');
    var rec = new Recording(info);

    rec.save(function(err) {
      if (err){
        console.log('Error in Saving weight: '+err);
        throw err;
      }
      console.log('save succesful');
      return res.redirect('/home');
    });
  });

  return router;
}
