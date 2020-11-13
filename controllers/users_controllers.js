const User = require('../models/user');
const passport = require('passport');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

module.exports.firstPage = function(req, res){
    if(req.isAuthenticated()){
        res.render("home", {name: req.user.name})
    }else{
        res.redirect('/login');
    }
}

module.exports.login = function(req, res){
  if(req.isAuthenticated()){
        res.redirect("home")
  }else{
    res.render('login', {
      error: req.flash('error')
    })
  }
}

module.exports.register = function(req, res){  
  if(req.isAuthenticated()){
        res.redirect("/home")
  }else{
    res.render('register')
  }
}

module.exports.home = function(req, res){
    if(req.isAuthenticated()){
        res.render("home",{name: req.user.name})
    }else{
        res.redirect('/login');
    }
}

module.exports.logout = function(req, res){
    req.logout();
    res.redirect('/login')
}

module.exports.changePassword = function(req, res){
  if(req.isAuthenticated()){
    res.render('change-password')
  }else{
    res.redirect('/login')
  }   
}

module.exports.forgot = function(req, res){
    res.render('forgot');
}

module.exports.resetToken = function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.send('Password reset token is invalid or has expired');
    }
    res.render('reset', {
      token: req.params.token
    });
  });
}

module.exports.authGoogle = passport.authenticate('google', {scope: ['profile'] });

module.exports.loginPost = passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: {type: 'error', message: 'Invalid username or password.'}
});

module.exports.registerPost = function(req, res){

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
}

module.exports.changePasswordPost = function(req, res, next){
  User.findById(req.session.passport.user, function (err, user) {  
    const oldPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    user.changePassword(oldPassword, newPassword, function(err) {
      if(err){
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
        res.redirect('/home');
      }
    });
  });  
}

module.exports.resetPost = function(req, res, next){
    
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
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
}

module.exports.resetTokenPost = function(req, res) {
  async.waterfall([
    function(done) {

      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return res.send('Password reset token is invalid or has expired');
        }
        user.setPassword(req.body.newPassword, function(err){
          if(err){
            console.log(err);
          }else{
            user.save();
          }
        });

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
  });
  req.flash(
          'success_msg',
          'Password Changed Successfully'
  );
  res.redirect('/login');
}
