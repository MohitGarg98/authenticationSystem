//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const expressLayouts = require('express-ejs-layouts');
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const nodemailer = require('nodemailer');
const flash = require('express-flash');
const async = require('async');
const crypto = require('crypto');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
var findOrCreate = require('mongoose-findorcreate')

console.log('18',__dirname ,'18');
app.use(express.static(__dirname + '/public'));
// app.use(express.static('public'));
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

app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.failure_msg = req.flash('failure_msg');
  next();
});

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/logindb", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    name: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
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
    console.log('82', profile, '82');
    User.findOrCreate({ username: profile.id, name:  profile.displayName}, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/', function(req, res){
    if(req.isAuthenticated()){
        res.render("home", {name: req.user.name})
    }else{
        res.redirect('/login');
    }
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

app.get('/register', function(req, res){  
  if(req.isAuthenticated()){
        res.redirect("/home")
  }else{
    res.render('register')
  }
})

app.get('/resetpassword', function(req, res){

  if(req.isAuthenticated()){
    res.render('change-password')
  }else{
    res.redirect('/login')
  }

    
})

app.post('/resetpassword', function(req, res, next){
  User.findById(req.session.passport.user, function (err, user) {  
    const oldPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    console.log(oldPassword,'110', newPassword);

    user.changePassword(oldPassword, newPassword, function(err) {
      if(err){
        console.log('114',err.name,'114');
        req.flash(
                  'failure_msg',
                  'Current Password is Wrong'
                );
        res.redirect('back');
        return;
      }else{
        req.flash(
                  'success_msg',
                  'Password Changed Successfully'
                );
        res.redirect('/login');
      }

    });

  });
  
})

app.get("/home", function(req, res){
    if(req.isAuthenticated()){
      console.log('140',req.user.name,'140');
        res.render("home",{name: req.user.name})
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
  req.flash(
          'success_msg',
          'Please Cheack You Mail..'
        );
  res.redirect('back');
});

app.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.send('Password reset token is invalid or has expired');
    }
    res.render('reset', {
      token: req.params.token
    });
  });
});

app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {

      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return res.send('Password reset token is invalid or has expired');
        }
        console.log('244');
        user.setPassword(req.body.newPassword, function(err){
          console.log('249');
          if(err){
            console.log(err,'251');
          }else{
            console.log('253');
            user.save();
            console.log('255');
          }
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
    console.log(err, '283');
  });
  req.flash(
          'success_msg',
          'Password Changed Successfully'
  );
  res.redirect('/login');
});

app.post("/register", function(req, res){

  User.findOne({ username: req.body.username }, function(err, user) {
    if (user) {
        req.flash(
                  'failure_msg',
                  'Email Already Exists'
                );
        res.redirect('back');
      }else
      {
        User.register({username: req.body.username, name: req.body.name}, req.body.password, function(err, user) {
          if (err) {console.log(err);}
          else{
              passport.authenticate("local")(req, res, function(){
                req.flash(
                  'success_msg',
                  'Registered Successfully'
                );
                res.redirect("/home");
              });
          }       
        });
      }
  });
})

// app.post('/login', function(req, res){
//     const user = new User({
//         username: req.body.username,
//         password: req.body.password
//     });
//     req.login(user, function(err){
//         if(err){
//         }else{
//             passport.authenticate("local")(req, res, function(){
//                 res.redirect("/home");
//             });
//         }
//     })
      
// })

app.get('/login', function(req, res){
  if(req.isAuthenticated()){
        res.render("home",{name: req.user.name})
  }else{
    res.render('login', {
      error: req.flash('error')
    })
  }
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: {type: 'error', message: 'Invalid username or password.'}
  })
);


app.listen(8000, function() {
  console.log("Server started on port 8000");
});