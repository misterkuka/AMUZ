const express  = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
// parse application/x-www-form-urlencoded;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

mongoose.connect(config.database);
let db = mongoose.connection;
app.use(express.static(path.join(__dirname,'public')));
db.once('open', function(){
  console.log('conncected to db');
})
// DB ERRORS
db.on('error', function(err){
  console.log(err);

});

let Article =require('./models/article');


// PASSPORT CONFIG
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.get('*', function(req,res, next){
  res.locals.user = req.user|| null;
  next();
});
// HOME ROUTE
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    res.render('index', {
      title:'Articles',
      articles: articles
    });
  });
});


// ROUTE FILES
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/users', users);
app.use('/articles', articles);


// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// START server
app.listen(3000, function(){
console.log('works');

});
