var express = require('express');
var http = require('http');
var passport = require('passport');
var hbs = require('hbs');
var routes = require('./routes');
var firebase = require('./firebase');
var authConfig = require('./authConfig');
var FacebookStrategy = require("passport-facebook").Strategy;
var favicon = require('serve-favicon');

var app = express();

// all environments

app.use(favicon(__dirname + '/public/assets/favicons/favicon.ico'));

app.set('port', authConfig.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

hbs.registerPartials(__dirname + '/views/partials');

app.use(express.cookieParser());
app.use(express.logger('dev'));

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(express.session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(routes.initialRouter);
app.use(app.router);

console.log(__dirname);

passport.use(new FacebookStrategy({
    clientID: authConfig.clientID,
    clientSecret: authConfig.clientSecret,
    callbackURL: authConfig.callbackURL,
    profileFields: ['id', 'displayName', 'emails', 'friends'],
    enableProof : true
  },
  function(accessToken, refreshToken, profile, done) {
    firebase.createUserFb(profile, function(error, user) {
      if (error) {
        return done(error);
      }
      done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.root);
app.post('/', routes.upload);
app.get('/login', routes.login);

app.get('/viewer', routes.viewer);
app.get('/logout', routes.logout);

app.get('/getbots', routes.getTopBots);
app.get('/arena', routes.arena);
app.get('/getgame', routes.getGame);
app.get('/getgames', routes.getLatestGamesForUser);
app.post('/makerequest', routes.makeRequest);

// emails
app.get('/testemails', routes.testEmail);
app.post('/setemails', routes.setEmails);
app.get('/goodbye', routes.unsubscribe);

app.get('/help', routes.help);

app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email', 'user_friends']}));
app.get('/checkpassword', routes.checkPassword);
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/',
      failureRedirect: '/' }))

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
