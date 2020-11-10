//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const expressLayouts = require('express-ejs-layouts');
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const nodemailer = require('nodemailer');
const flash = require('express-flash');
const async = require('async');
const crypto = require('crypto');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
var findOrCreate = require('mongoose-findorcreate')

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.set('layout extractStyles', true);
app.set('layout extractScripts', true);
app.use(expressLayouts);

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/logindb", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    name: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model('User', userSchema);
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
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/', function(req, res){
    res.render('login')
})

app.get('/auth/google',
  passport.authenticate('google', {scope: ['profile'] })
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', {failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/home');
  }
);

app.get('/login', function(req, res){
    res.render('login')
})

app.get('/register', function(req, res){
    res.render('register')
})

app.get('/resetpassword', function(req, res){
    res.render('change-password')
})

app.post('/resetpassword', function(req, res, next){
  User.findById(req.session.passport.user, function (err, user) {  
    const oldPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    console.log(oldPassword,'110', newPassword);

    user.changePassword(oldPassword, newPassword, function(err) {
      if(err){
        console.log('114',err.name,'114');
        res.send('wrong password');
        return;
      }else{
        res.send('datajbkcjsfdzcm');
      }

    });

  });
  
})

app.get("/home", function(req, res){
    if(req.isAuthenticated()){
        res.render("home")
    }else{
        res.redirect('/login');
    }
})

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login')
})

app.get('/forgot', function(req, res){
    res.render('forgot');
})

app.post('/reset', function(req, res, next){
    
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
        console.log(req.body.username);
      User.findOne({ username: req.body.username }, function(err, user) {
        if (!user) {
          return res.send('No account with that email address exists.');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'magrawal.mca98@gmail.com',
          pass: 'Mohit@1998'
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'magrawal.mca98@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.username + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
  });
  res.send('please check your mail')
});

app.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.send('Password reset token is invalid or has expired');
    }
    console.log('184', req.user);
    res.render('reset', {
      token: req.params.token
    });
  });
});

app.post('/reset/:token', function(req, res) {
    console.log('192');
  async.waterfall([
    function(done) {
      console.log(req.params.token);

      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return res.send('Password reset token is invalid or has expired');
        }

        user.setPassword(req.body.password, function(){
            user.save();
            console.log('password reset successful');
        });
        
        console.log(req.body.password);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'magrawal.mca98@gmail.com',
          pass: 'Mohit@1998'
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'magrawal.mca98@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    console.log(err, '261');
  });
  res.render('login');
});

app.post("/register", function(req, res){

    User.register({username: req.body.username, name: req.body.name}, req.body.password, function(err, user) {
        if (err) {console.log(err); res.redirect("/register"); }
        else{
            passport.authenticate("local")(req, res, function(){
                console.log('reg');
                return res.redirect("/home")
            });
        }
        
    });

})

app.post('/login', function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    console.log(user,'293');
    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/home");
            });
        }
    })
      
})


app.listen(8000, function() {
  console.log("Server started on port 8000");
});