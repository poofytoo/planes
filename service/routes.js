var model = require('./model');
var util = require('./util');
var authConfig = require('./authConfig.js');


exports.initialRouter = function(req, res, next) {
  if (req.url === '/login' || (req.url.lastIndexOf('/auth/facebook', 0) === 0) ||
      req.url === '/loggedin' || req.url === '/' || req.url.indexOf('/getgame') === 0 || 
      req.url.indexOf('/arena') === 0 || req.url == '/help' ||req.url.indexOf('/goodbye') === 0 || req.url.indexOf('/checkpassword') === 0) {
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
    util.registerPageContent('index', 'contentHeader')
    model.getBotStats(userId, function(data, err) {
      res.render('base.html', {user: req.user.username, bot: data});
    })
  } else {
    util.registerPageContent('login', 'contentHeader')
    res.render("base.html");
  }
}

exports.upload = function(req, res) {
  var userId = req.user.id;
  model.createBot(userId, req.body.botName, req.body.botDesc, req.files.bot, function(err){
    if (err) {
      var err = err;
      model.getBotStats(userId, function(data, err2) {
        util.registerPageContent('index', 'contentHeader')
        res.render('base.html', {message: "An error occurred: " + err, user: req.user.username, bot: data});
      });
    } else {
      res.redirect('/');
    }
  });
  
}


exports.getTopBots = function(req, res) {
  model.getTopBots(req.user.id, function(error, data) {
    if (error) {
      res.send(error);
    } else {
      res.send(data);
    }
  });
}

exports.getLatestGamesForUser = function(req, res) {
  model.getLatestGamesForUser(req.user.id, function(error, data) {
      if (error) {
        res.send(error);
      } else {
        res.send(data);
      }
  });
}

exports.getGame = function(req, res) {
  var id = 0;
  if (req.query && req.query.id) {
    id = req.query.id;
  }

  getHandler = function(err, data) {
      if (err) {
        res.send(err);
      } else {
        res.send(data);
      }
  }

  if (req.user) {
    model.fetchGame(req.user.id, id, getHandler);
  } else {
    model.fetchGamePublic(id, getHandler);
  }
}

exports.makeRequest = function(req, res) {
  model.makeRequest(req.user.username, req.user.id, req.body.id, function(err) {
    if (err) {
      res.send(err);
    } else {
      res.end();
    }
  });
}

exports.viewer = function(req, res) {
  if (req.user) {
    util.registerPageContent('index', 'contentHeader')
    res.render('base.html', {user: req.user.username});
  } else {
    res.redirect('/');
  }
};

exports.login = function(req, res) {
  if (req.user) {
    res.redirect('/');
  } else {
    util.registerPageContent('login', 'contentHeader')
    res.render('base.html');
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

exports.arena = function(req, res) {
  // incoming as http://localhost:8080/arena?gameId
  var gameId = Object.keys(req.query)[0];
  util.registerPageContent('arena', 'arena/header')
  if (gameId) {
    model.fetchGamePublic(gameId, function(err, data) {
      res.render('base.html', {user1: data.username1, user2: data.username2, id: gameId});
    });
  } else {
    res.render('base.html', {user1: 'no one', user2: 'no one', id: ''});
  }
}

exports.help = function(req, res) {
  // incoming as http://localhost:8080/help
  util.registerPageContent('help', 'contentHeaderBack')
  res.render('base.html');
}

exports.setEmails = function(req, res) {
  model.toggleEmail(req.user.id, req.body.state, function(err){
    if (err) {
      console.log(err)
      res.end();
    } else {
      res.end();
    }
  });
}

exports.unsubscribe = function(req, res) {
  userId = req.query.a;
  userSecret = req.query.b;
  model.verifyUser(userId, userSecret, function(err) {
    if (err) {
      util.registerPageContent('error', 'contentHeaderBack')
      res.render('error.html');
    } else {
      model.toggleEmail(userId, 'off', function(err){
        if (err) {
          util.registerPageContent('error', 'contentHeaderBack')
          res.render('error.html');
        } else {
          util.registerPageContent('goodbye', 'contentHeaderBack');
          res.render('goodbye.html');
        }
      });
    }
  });
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

exports.checkPassword = function(req, res) {
  if (req.query.password === 'PL4NES') {
    res.send('/auth/facebook');
  } else {
    res.send('/');
  }
}

exports.testEmail = function(req, res) {
  model.sendChallengeEmail(12345, 'Victor Hung', 'victorhung92@gmail.com', 'Bob Challengero', 16, 'abcde');
  res.end();
}
