const express = require('express');
const router = express.Router();
const passport = require('passport');
const usersControllers = require('../controllers');

router.get('/', usersControllers.firstPage);
router.get('/login', usersControllers.login);
router.get('/register', usersControllers.register);
router.get("/home",usersControllers.home);
router.get('/logout',usersControllers.logout);
router.get('/changepassword',usersControllers.changePassword);
router.get('/forgot',usersControllers.forgot);
router.get('/reset/:token',usersControllers.resetToken);
router.get('/auth/google', usersControllers.authGoogle);
router.get('/auth/google/secrets', 
  passport.authenticate('google', {failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/home');
  }
);

router.post('/login',usersControllers.loginPost)
router.post("/register",usersControllers.registerPost)
router.post('/changepassword',usersControllers.changePasswordPost)
router.post('/reset',usersControllers.resetPost)
router.post('/reset/:token',usersControllers.resetTokenPost)

module.exports = router;
