//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const expressLayouts = require('express-ejs-layouts');
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
// const passport = require('passport');
const passport = require('./config/passport');
const flash = require('express-flash');
const app = express();

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

app.use('/', require('./routes'));

app.listen(3000, function() {
  console.log("Server started on port 3000");
});