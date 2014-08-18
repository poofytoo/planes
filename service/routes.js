var model = require('./model');
var util = require('./util');
var authConfig = require('./authConfig.js');

exports.initialRouter = function(req, res, next) {
  if (req.url === '/login' || (req.url.lastIndexOf('/auth/facebook', 0) === 0) ||
      req.url === '/loggedin' || req.url === '/' || (req.url.indexOf('/getgame') === 0 && req.url.indexOf('/getgames') !== 0) ||
      req.url.indexOf('/arena') === 0 || req.url == '/help' ||req.url.indexOf('/goodbye') === 0 || req.url.indexOf('/checkpassword') === 0) {
    next();
  // TODO: (Michael) clean this nasty up
  } else if (req.user && (req.url.lastIndexOf('/checkbetatoken', 0) === 0 || req.url === '/logout' || req.url == '/upload')) {
    // Let unverified users try / logout
    next();
  } else if (req.user && req.user.approved) {
    // Always allow approved users
    console.log(req.user.username + " " + req.url);
    model.userList[req.user.username] = true;
    next();
  } else if (req.user && !req.user.approved) {
    // Block unapproved users
    res.end();
  } else {
    res.redirect('/');
  }
};

exports.localStrategy = model.localStrategy;
exports.findUser = model.findUser;

exports.root = function(req, res) {
  if (req.user) {
    var userId = req.user.id;
    util.registerContent('index')
    model.getBotStats(userId, function(data, err) {
      res.render('base.html', {user: util.condenseUsername(req.user.username), bot: data, pageInfo: util.getPageInfo('index')});
    })
  } else {
    util.registerContent('login')
    res.render("base.html", {pageInfo: util.getPageInfo('login')});
  }
}

exports.upload = function(req, res) {
  if (req.user && req.user.approved) {
    var userId = req.user.id;
    model.createBot(userId, req.body.botName, req.body.botDesc, req.files.bot, function(err){
      if (err) {
        var err = err;
        model.getBotStats(userId, function(data, err2) {
          util.registerContent('index')
          res.render('base.html', {message: "An error occurred: " + err, user: req.user.username, bot: data, pageInfo: util.getPageInfo('index')});
        });
      } else {
        res.redirect('/');
      }
    });
  } else {
    res.redirect('/');
  }
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

exports.getGlobalGames = function(req, res) {
  var userId = '';
  if (req.user) {
    userId = req.user.id;
  }

  model.getGlobalGames(req.user.id, function(error, data) {
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
    util.registerContent('index')
    res.render('base.html', {user: req.user.username, pageInfo: util.getPageInfo('index')});
  } else {
    res.redirect('/');
  }
};

exports.login = function(req, res) {
  if (req.user) {
    res.redirect('/');
  } else {
    util.registerContent('login')
    res.render('base.html', {pageInfo: util.getPageInfo('login')});
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
  util.registerContent('arena')
  if (gameId) {
    model.fetchGamePublic(gameId, function(err, data) {
      var description = "An epic duel of PLANES between " + data.username1 + " and " + data.username2
      res.render('base.html', {id: gameId, pageInfo: util.getPageInfo('arena', description)});
    });
  } else {
    description = "An epic duel of PLANES between no one and no one"
    res.render('base.html', {id: '', pageInfo: util.getPageInfo('arena', description)});
  }
}

exports.help = function(req, res) {
  // incoming as http://localhost:8080/help
  util.registerContent('help')
  res.render('base.html', {pageInfo: util.getPageInfo('help')});
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
      util.registerContent('error')
      res.render('base.html', {pageInfo: util.getPageInfo('error')});
    } else {
      model.toggleEmail(userId, 'off', function(err){
        if (err) {
          util.registerContent('error')
          res.render('base.html', {pageInfo: util.getPageInfo('error')});
        } else {
          util.registerContent('goodbye');
          res.render('base.html', {pageInfo: util.getPageInfo('goodbye')});
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
  if (req.query.password === 'pl4nes' || req.query.password === 'PL4NES') {
    res.send('/auth/facebook');
  } else {
    res.send('/');
  }
}

exports.testEmail = function(req, res) {
  model.sendChallengeEmail(12345, 'Victor Hung', 'victorhung92@gmail.com', 'Bob Challengero', 16, 'abcde');
  res.end();
}

exports.checkBetaToken = function(req, res) {
  if (req.user) {
    model.checkBetaToken(req.query.betatoken, req.user.id, function(error) {
      if (!error) {
        req.logout();
        res.redirect('/auth/facebook');
      } else {
        res.redirect('/');
      }
    });
  } else {
    res.redirect('/');
  }
}
