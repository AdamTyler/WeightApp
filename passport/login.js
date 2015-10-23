var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){


  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback : true
  },
  function(req, username, password, done) {
    // console.log('login check', req, username, password, done)
    // check in mongo if a user with username exists or not
    User.findOne({ 'email' :  username },
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log the error and redirect back
        if (!user){
          console.log('not found')
          return done(null, false, req.flash('message', 'User Not found.'));
        }
        user.comparePassword(password, function(err, isMatch) {
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
          }
        });
      }  // end function
    ); // end User.fineOne

  } // end function
  )); // end LocalStrategy, passport.use
}
