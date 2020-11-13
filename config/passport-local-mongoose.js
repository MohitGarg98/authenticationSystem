const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../models/user");

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: "553569977948-ud500ib1c3t7kvmq37dsdvt2rmh5kb4r.apps.googleusercontent.com",
    clientSecret: "6yT0aECZyGAkn_AoVHT2pQ5I",
    callbackURL: "http://localhost:8000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ username: profile.id, name:  profile.displayName}, function (err, user) {
      return cb(err, user);
    });
  }
));

module.exports = passport;
