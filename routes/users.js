const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');


// Express Messages Middleware
router.use(require('connect-flash')());
router.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator
router.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//INCLUDE USER model

let User = require('../models/user');

router.get('/register', function(req,res){
  res.render('register');
});

//Register Process
router.post('/register', function(req,res){
  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password1 = req.body.password1;

  req.checkBody('name', 'Podaj Imię').notEmpty();
  req.checkBody('email', 'Nieprawidłowy Adres Email').isEmail();
  req.checkBody('username', 'Podaj nazwę Użytkownika').notEmpty();
  req.checkBody('email', 'Podaj Email').notEmpty();
  req.checkBody('password', 'Podaj Hasło').notEmpty();
  req.checkBody('password1', 'Hasła się nie zgadzają').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors:errors
    });
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });
    bcrypt.genSalt(10,function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log('error');
          req.flash('success', 'error');
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            req.flash('success', 'error');
            return;
          } else {
            req.flash('success', 'Zarejestrowano, możesz się zalogować');
            res.redirect('/users/login')
          }
        });
      });
    });
  }
});

// LOGIN FORM
router.get('/login', function(req,res){
  res.render('login');
});


// LOGIN PROCESS
router.post('/login', function(req,res, next){
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash:true
  })(req,res,next);
});

// logout
router.get('/logout', function(req,res){
  req.logout();
  req.flash('success', 'Wylogowano');
  res.redirect('/users/login');
});
module.exports = router;
