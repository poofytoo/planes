var model = require('./model');
var authConfig = require('./authConfig.js');
var fs = require('fs');

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
    res.render('index.html', {user: req.user.username});
  } else {
    res.render("login.html");
  }
}

exports.upload = function(req, res) {
  var user = req.user;
  var userId = user.id;
  console.log(user);
  fs.readFile(req.files.bot.path, function (err, data) {
    var fileName = "test.jpg";
    var fsWriteFile = function(data, userId) {
      console.log('begin write file!');
      var newPath = __dirname + "/uploads/" + userId + "/" + req.body.botName;
      console.log(newPath);
      fs.writeFile(newPath, data, function (err) {
        if (err)
          console.log(err);
          
          // this desperately needs to be refactored
          model.createBot(userId, req.body.botName, req.body.blurb, function() {
            res.render('index.html', {status: 'success', message: 'bot uploaded! now running tests to make sure your file is syntactically correct and bug free :)'}); 
          });
      });
    }
    
    if(!fs.existsSync("uploads/" + userId)){
      fs.mkdir("uploads/" + userId, 0777, function(err){
         if(err){ 
           console.log(err);
           response.send("Didnt work (probably our fault)");    // echo the result back
         } else {
           console.log('lets make a new file');
           fsWriteFile(data, userId);
         }
      });   
    } else {
      console.log('re-uploading file')
      fsWriteFile(data, userId);
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
