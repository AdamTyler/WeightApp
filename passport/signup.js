var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');


module.exports = function(passport){

  passport.use('signup', new LocalStrategy({
      usernameField: 'email',
      passReqToCallback : true
    },
    function(req, email, password, done) {
      console.log('create user', email, password);
      req.assert('email', 'Email is not valid').isEmail();
      req.assert('password', 'Password must be at least 4 characters long').len(4);
      // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

        var errors = req.validationErrors();

        if (errors) {
          req.flash('message', errors);
          return res.redirect('/signup');
        }

      findOrCreateUser = function(){
        // find a user in Mongo with provided email
        User.findOne({'email':email},function(err, user) {
          // In case of any error return
          if (err){
            console.log('Error in SignUp: '+err);
            return done(err);
          }
          // already exists
          if (user) {
            console.log('User already exists');
            return done(null, false,
               req.flash('errors', {msg: 'User Already Exists with that Email Address'}));
          } else {
            // if there is no user with that email
            // create the user
            var newUser = new User();
            // set the user's local credentials
            newUser.username = req.body.username;
            newUser.password = req.body.password;
            newUser.email = email;
            newUser.firstName = req.body.firstName;
            newUser.lastName = req.body.lastName;

            // save the user
            newUser.save(function(err) {
              if (err){
                console.log('Error in Saving user: '+err);
                throw err;
              }
              console.log('User Registration succesful');
              return done(null, newUser);
            });
          }
        });
      };

      // Delay the execution of findOrCreateUser and execute
      // the method in the next tick of the event loop
      process.nextTick(findOrCreateUser);
    })
  );

  // Generates hash using bCrypt
  var createHash = function(password){
   return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  }

}
