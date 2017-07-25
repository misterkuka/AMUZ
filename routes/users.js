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

// CHECK FOR EXISTANCE
function mail_exists(query){
    var x = 0;
    User.count({email:query}, function (error, count) {
      console.log('mail', count, query);
      x = count;
    });

console.log('x=', x);
  if(x > 0){
  return 'adres email już zarejestrowany';
} else {
  return 0;
};

};

function user_exists(query){
    var x = 0;
    User.count({username:query}, function (error, count) {
      console.log('user', count, query);
      x = count;
    });

  console.log('x=', x);
  if(x > 0){
  return 'nazwa użytkownika wykorzystana';
} else {
  return 0;
};
};

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
  let alerts = mail_exists(email);
  let alerts1 = user_exists(username);
  console.log(alerts, alerts1, email, username);
  if(errors){
    res.render('register',{
      errors:errors,
      alerts:alerts,
      alerts1:alerts1,
    });
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password,
      photo:'images/profile.png'
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
    successRedirect:'/articles/home',
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
