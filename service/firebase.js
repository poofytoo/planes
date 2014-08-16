/* Functions that interact with Firebase */

var schemas = require('../gameserver/firebase');
var requestsModel = schemas.requestsModel;
var usersModel = schemas.usersModel;
var gamesModel = schemas.gamesModel;
var requestCounterModel = schemas.requestCounterModel;

// var Firebase = require('firebase');
// var authConfig = require('./authConfig');
// var root = new Firebase(authConfig.firebaseURL);
// root.auth(authConfig.firebaseSecret);
// var http = require('http');
 
var ADMIN = {'Michael Xu': true, 
             'Victor Hung': true, 
             'Stephanie Yu': true,
             };

// Keep track of current active users
userList = {};
exports.userList = userList;

function sanitizeUsername(username) {
  return username.replace(/[\[\]\.$#,]/g,'');
}

function hasAdminPrivileges (user) {
  console.log(user);
  console.log(user in ADMIN);
  return user in ADMIN;
}

function genSecret() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i=0; i < 30; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function createUserFb(profile, callback) {
  var username = profile.displayName;
  var id = profile.id;
  var email = "";
  if (email.value) {
    email = email.value;
  } else if (!email && profile.emails) {
    email = profile.emails[0].value;
  }
  findUser(id, function(notFound, foundUser) {
    var cleanUsername = sanitizeUsername(username);
    if (foundUser == null) {
      var user = {
        'id' : id,
        'username' : cleanUsername,
        'userStatus': 'new',
        'elo' : 1000,
        'wins' : 0,
        'losses' : 0,
        'draws' : 0,
        'lastRequestTime' : 0,
        'emails' : 'on',
        'email' : email,
        'watched' : {0:0},
        'secret' : genSecret()
      };
      var userModel = new usersModel(user);
      console.log(userModel);
      userModel.save();
      callback(false, userModel);
    } else {
      callback(false, foundUser);
    }
  });
}

function createUser(username, pwHash, callback) {
  var user = new usersModel({
    'username': username,
    'secret': pwHash,
    'score': 0,
    'userStatus': 'new',
  });
  user.save();
  callback(false);

  /*
  root.child('counters').child('userID').transaction(function(userID) {
    return userID + 1;
  }, function(err, committed, data) {
    if (err) {
      callback(err);
      return;
    }
    if (!committed) {
      callback('System error: create user');
      return;
    }
    var userID = data.val();
    root.child('users').child(userID).set({
      'id': userID,
      'username': username,
      'pwHash': pwHash,
      'score' : 0,
      'userStatus': 'new'
    });
    callback(false);
  });
  */
};

function getUser(username, callback) {
  usersModel.findOne({'username': username}, callback);
/*
  root.child('users').once('value', function(data) {
    var users = data.val();
    for (var userKey in users) {
      var user = users[userKey];
      if (user.username === username) {
        callback(false, user);
        return;
      }
    }
    callback(false, false);
  });
*/
};

function createBot(userId, botFileName, botName, botDesc, botCode, callback) {
  usersModel.findOne({'id': userId}, function(error, user) {
    user.bot = {
      botFileName: botFileName,
      botName: botName,
      botDesc: botDesc,
      botCode: botCode
    }
    user.save();
  });
  /*
  root.child('users').child(userId).child('bot').set({
    botFileName: botFileName,
    botName: botName,
    botDesc: botDesc,
    botCode: botCode
  });
  callback(false);
  */
};

function getCurrentBot(userId, callback) {
  usersModel.findOne({'id': userId}, function(error, user) {
    callback(user.bot, null);
  });
  /*
  root.child('users').child(userId).once('value', function(data) {
    callback(data.val(), null);
  })
  */
}

function findUser(id, callback) {
  usersModel.findOne({'id': id}, callback);
/*
  root.child('users').child(id).once('value', function(data) {
    if (data.val()) {
      callback(false, data.val());
    } else {
      console.log("User " + id + " was not found.");
      callback(true, null);
    }
  });
*/
};

function fetchGame(userId, id, callback) {
  requestsModel.findOne({id: id}, function(error, request) {
    if (!error) {
      gamesModel.findOne({id: id}, function(gameError, game) {
        if (!gameError) {
            var gameObject = JSON.parse(game.gameJson);
            gameObject['username1'] = request.username1;
            gameObject['username2'] = request.username2;
            callback(false, gameObject);

            findUser(userId, function(error, user) {
              user.watched[id] = 'seen';
              user.save();
            });
        } else {
          callback("processing", false);
        }
      });
    } else {
      callback("Game id not found.", false);
    }
  });
/*
  root.child('requests').child(id).once('value', function(requestData) {
    if (requestData.val()) {
      root.child('games').child(id).once('value', function(data) {
        if (data.val()) {
          var gameObject = JSON.parse(data.val().gameJson);
          gameObject['username1'] = requestData.val().username1;
          gameObject['username2'] = requestData.val().username2;

          callback(false, gameObject);

          findUser(userId, function(error, user) {
            if (!error) {
              root.child('users').child(userId).child('watched').child(id).set('seen');
            }
          });
        } else {
          callback("processing", false);
        }
      });
    } else {
      callback("Game id not found.", false);
    }
  });
*/
};

function fetchGamePublic(id, callback) {
  fetchGame("placeholder-nonexistent", id, callback);
}

function getAllUsers(callback) {
  usersModel.find(function(error, users) {
    callback(users);
  });
/*
  root.child('users').once('value', function(data) {
    callback(data.val());
  });
*/
}

function getAllRequests(callback) {
  requestsModel.find(function(error, requests) {
    callback(requests);
  });
/*
  root.child('requests').once('value', function(data) {
    callback(data.val());
  });
*/
}

function getAllGames(callback) {
  gamesModel.find(function(error, games) {
    callback(games);
  });
  // root.child('games').once('value', function(data) {
  //   callback(data.val());
  // });
}

function makeRequest(challengerUsername, challengerId, otherId, callback) {
  if (challengerId === otherId) {
    callback("Can't challenge yourself.", false);
    return;
  }
  
  // root.child('requestCounter').transaction(function(counter) {
  //   return counter + 1;
  // }, function(error, committed, snapshot) {
  //   if (!error) {
  //     var gameId = snapshot.val();

  findUser(challengerId, function(error, user) {
    if (error) {
      callback(error, false);
      return;
    }
    var now = new Date().getTime();
    // ANTI-SPAM
    if (now - user.lastRequestTime < 300) {
      callback("Wait a minute before making another challenge.", false);
      return;
    }
    findUser(otherId, function(error2, user2) {
      if (error2) {
        callback(error, false);
        return;
      }
      request = new requestsModel({
        user1: challengerId, 
        username1: challengerUsername,
        user2: otherId, 
        username2: user2.username,
        watched: {0:'seen'},
        status: "open"
      });
      request.save();
      user.lastRequestTime = new Date().getTime();
      user.save();
      callback(false, request.id);
    });
  });
}

function setEmailPreferences(userId, state, callback) {
  usersModel.findOne({id: userId}, function(error, user) {
    user.emails = state;
    user.save();
  });
  /*
  root.child('users/' + userId + '/emails').set(state);
  callback(false);
  */
}

function verifyUser(userId, userSecret, callback) {
  usersModel.findOne({id: userId}, function(error, user) {
    callback(userSecret !== user.secret);
  });
  /*
  root.child('users').child(userId).child('secret').once('value', function(data) {
    callback(userSecret !== data.val());
  })
  */
}

exports.createUserFb = createUserFb;
exports.createUser = createUser;
exports.getUser = getUser;
exports.findUser = findUser;
exports.sanitizeUsername = sanitizeUsername;

// Planes Specific
exports.createBot = createBot;
exports.getCurrentBot = getCurrentBot;
exports.fetchGame = fetchGame;
exports.fetchGamePublic = fetchGamePublic;
exports.makeRequest = makeRequest;
exports.getAllUsers = getAllUsers;
exports.getAllRequests = getAllRequests;
exports.getAllGames = getAllGames;
exports.setEmailPreferences = setEmailPreferences;
exports.verifyUser = verifyUser;
