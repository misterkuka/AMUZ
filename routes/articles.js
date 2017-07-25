const express = require('express');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const router = express.Router();

// Express Session Middleware
router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));


// Express Messages Middleware
router.use(require('connect-flash')());
router.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// models
let Article = require('../models/article');
let User = require('../models/user');

//Add ROUTE
router.get('/add', ensureAuthenticated, function(req,res){
  res.render('add', {
    title:'Add Article'
  });
});


router.get('/home', function(req,res){
  Article.find({}, function(err, articles){
    User.find({},function(err, users){
      res.render('home', {
        title:'Ogłoszenia',
        articles: articles,
        data:users
      });
    });
  });
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

// get article
router.get('/:id', function(req,res){
  Article.findById(req.params.id, function(err,article){
    User.findById(article.author, function(err,user){
    if(user==null){
      res.render('article', {
        article:article,
        author: 'autor nieznany'
      });
    } else {
      res.render('article', {
        article:article,
        author: user.name
      });
    }

    });
  });
});

router.get('/edit/:id', ensureAuthenticated, function(req,res){
  Article.findById(req.params.id, function(err,article){
    res.render('edit', {article:article});
  });
});

//Add Sybmit
router.post('/add',ensureAuthenticated, function(req,res){
  req.checkBody('title', 'Podaj Tytuł').notEmpty();
  req.checkBody('body', 'Nie ma treści').notEmpty();

  let errors = req.validationErrors();
  if(errors){
    res.render('add', {
      errors:errors
    })
  } else {
    let article = new Article({
      title: req.body.title,
      body: req.body.body,
      author:req.user._id,
    });

    article.save(function(err){
      if(err) {
        res.render('add');
      } else {
        req.flash('success', 'Artykuł został dodany')
        res.redirect('/articles/home');
      }
    });

  }

});

// DELETE ARTICLE
router.delete('/:id', ensureAuthenticated, function(req,res){
let query = {_id:req.params.id}

Article.remove(query, function(err){
  if(err){
    console.log(err);
  } else {
    req.flash('success', 'Artykuł usunięto');
  }
});
});


// update submit
router.post('/edit/:id', ensureAuthenticated, function(req,res){
  let article = {
    title: req.body.title,
    author:req.body.author,
    body: req.body.body
  };

  let query = {_id:req.params.id};

  Article.update(query, article,function(err){
    if(err){
      res.render('edit');
    }else {
      req.flash('success', "Artykuł poprawiony");
      res.redirect('/');
    }
  });
});

function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Zaloguj się');
    res.redirect('/users/login')
  }
}

// USER METHODS

router.post('/profile/edit/:id', ensureAuthenticated, function(req,res){
  let article = {
    name: req.body.name,
    about:req.body.about,
  };

  let query = {_id:req.params.id};

  User.update(query, article,function(err){
    if(err){
      res.render('edit');
    }else {
      req.flash('success', "Dane Zaktualizowane");
      res.redirect('/articles/profile/' + req.user._id);
    }
  });
});
router.get('/profile/:id', function(req,res){
    User.findById(req.params.id, function(err,user){
      res.render('profile', {
        users:user,
        data: req.user
      });
    });
  });


router.get('/profile/edit/:id', ensureAuthenticated, function(req,res){
    res.render('profile_edit', {
      data:req.user
    });
});


module.exports = router;
