const serverless = require('serverless-http');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var addUserRouter = require('./routes/addUsers');
var loginRouter = require('./routes/login');
var getUsersRouter = require('./routes/getUsers');
var validateUser = require('./services/validateUser');
var authExcludeArray = ['/login'];
var app = express();
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization, content-type, userid, token ");
	next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(async function (req, res, next) {
  console.log('authentication filter');
  if (req.method === 'OPTIONS')
      next();
  else if (authExcludeArray.indexOf(req.path.toString()) > -1)
      next()
  else {
      console.log('request method::' + req.method);
      var authString = '';
      if (req.headers.authorization)
          authString = req.headers.authorization;
      else if (req.headers.Authorization)
          authString = req.headers.Authorization;
      let decoded = await validateUser.validateToken(authString);
      if (decoded.status!==200) {
          res.status(401).json({
              status: 401,
              message: "Provide Valid JWT Token"
          });
      }
      else
          next()
  }
});

app.use('/addUser', addUserRouter);
app.use('/login', loginRouter);
app.use('/getUsers', getUsersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// module.exports = app;
module.exports.handler = serverless(app);
