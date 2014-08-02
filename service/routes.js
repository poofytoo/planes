var model = require('./model');
var authConfig = require('./authConfig.js');

exports.initialRouter = function(req, res, next) {
  if (req.url === '/login' || (req.url.lastIndexOf('/auth/facebook', 0) === 0) ||
      req.url === '/loggedin' || req.url === '/' || req.url.indexOf('/arena') === 0) {
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
  model.getTopBots(req.user.id, function(error, data) {
    if (error) {
      res.send(error);
    } else {
      res.send(data);
    }
  });
}

exports.getLatestGamesForUser = function(req, res) {
  // TODO: FILL IT OUT
  // 
  data = {
    1: {
      gameId: 1,
      challenger: 'Michael X',
      botName: 'Floppy',
      status: 'unwatched'
    },
    2: {
      gameId: 16,
      challenger: 'Michael X',
      botName: 'Floppy',
      status: 'watched'
    },
    3: {
      gameId: 17,
      challenger: 'Michael X',
      botName: 'Floppy',
      status: 'waiting'
    }
  }
  res.send(data);
}

exports.getGame = function(req, res) {
  model.fetchGame(req.user.id, req.query.id, function(err, data){
    res.send(data);
  })
}

exports.makeRequest = function(req, res) {
  model.makeRequest(req.user.id, req.body.id, function(err) {
    if (err) {
      res.send(err);
    } else {
      res.end();
    }
  });
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

exports.arena = function(req, res) {
  // incoming as http://localhost:8080/arena?gameId
  res.render('arena.html');
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
