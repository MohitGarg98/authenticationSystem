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
    clientID: "553569977948-p21dv9tnkm68dklit9c48qnh0f3rmb31.apps.googleusercontent.com",
    clientSecret: "SeK_yJs_gFRdoWRzlPgyaqi2",
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ username: profile.id, name:  profile.displayName}, function (err, user) {
      return cb(err, user);
    });
  }
));

module.exports = passport;
