var model = require('./model');
var authConfig = require('./authConfig.js');

exports.initialRouter = function(req, res, next) {
  if (req.url === '/login' || (req.url.lastIndexOf('/auth/facebook', 0) === 0) ||
      req.url === '/loggedin' || req.url === '/') {
    next();
  } else if (req.user) {
    console.log(req.user.username + " " + req.url);
    model.userList[req.user.username] = true;
    next();
  } else {
    res.redirect('/');
  }
};

exports.localStrategy = model.localStrategy;
exports.findUser = model.findUser;

exports.root = function(req, res) {
  if (req.user) {
    var userId = req.user.id;
    model.getBotStats(userId, function(data, err) {
      res.render('index.html', {user: req.user.username, bot: data});
    })
  } else {
    res.render("login.html");
  }
}

exports.upload = function(req, res) {
  var userId = req.user.id;
  model.createBot(userId, req.body.botName, req.body.botDesc, req.files.bot, function(err){
    if (err) {
      var err = err;
      model.getBotStats(userId, function(data, err2) {
        res.render('index.html', {message: "An error occurred: " + err, user: req.user.username, bot: data});
      });
    } else {
      res.redirect('/');
    }
  });
  
}


exports.getTopBots = function(req, res) {
  // TODO: FILL IT OUT
  data = {
    1: {
      user: 'Victor H',
      userId: 213456,
      botName: 'Fantastic',
      wins: 10,
      losses: 0,
      rank: 'A'
    },
    2: {
      user: 'Michael X',
      userId: 43523412,
      botName: 'Floppy',
      wins: 5,
      losses: 4,
      rank: 'B'
    },
    3: {
      user: 'Kevin C',
      userId: 234567,
      botName: 'Orangebot',
      wins: 3,
      losses: 1,
      rank: 'B'
    }
  };
  res.send(data);
}

exports.challenge = function(req, res) {
  // TODO: FILL IT OUT
  res.send(req.body.id);
}

exports.viewer = function(req, res) {
  if (req.user) {
    res.render('index.html', {user: req.user.username});
  } else {
    res.redirect('/');
  }
};

exports.login = function(req, res) {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('login.html');
  }
};

exports.logout = function(req, res) {
  req.session.regenerate(function() {
    req.logout();
    res.redirect('/');
  });
}

exports.getFirebase = function(req, res) {
  var url = authConfig.firebaseURL;
  res.writeHead(200, {
    'Content-Length': url.length,
    'Content-Type': 'text/plain' })
  res.write(url);
  res.end();
}


exports.isLoggedIn = function(req, res) {
  var loggedIn = "no";
  if(req.user) {
    var loggedIn = "yes";
  }
  res.writeHead(200, {
    'Content-Length': loggedIn.length,
    'Content-Type': 'text/plain' })
  res.write(loggedIn);
  res.end();
}
