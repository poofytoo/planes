/* Functions that interact with Firebase */

var Firebase = require('firebase');
var authConfig = require('./authConfig');
var root = new Firebase(authConfig.firebaseURL);
root.auth(authConfig.firebaseSecret);
var http = require('http');

/*
 * Schema
 *
 * planes
 *  requests:
 *    1:
 *      id: 1
 *      user1:
 *      user2:
 *    ...
 *  users:
 *    1:
 *      id: 1
 *      username: Victor Hung
 *      elo: 1000
 *      botFile: "this is a python file as a string"
 *      blurb: "Imma a smart boy"
 *    ...
 *
 *  games:
 *    1:
 *      id: 1
 *      user1: Victor Hung
 *      user2: Felix Sun
 *      result: "user1 won"
 *      gameJson: {some json file}
 *
 *    ...
 */
 
 
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

function createUserFb(username, id, callback) {
  findUser(id, function(notFound, foundUser) {
    var cleanUsername = sanitizeUsername(username);
    if (notFound) {
      var user = {
        'id' : id,
        'username' : cleanUsername,
        'userStatus': 'new',
        'elo' : 1000
      };

      root.child('users').child(id).set(user);
      callback(false, user);
    } else {
      callback(false, foundUser);
    }
  });
}

function createUser(username, pwHash, callback) {
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
};

function getUser(username, callback) {
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
};

function createBot(userId, botFileName, botName, botDesc, botCode, callback) {
  root.child('users').child(userId).child('bot').set({
    botFileName: botFileName,
    botName: botName,
    botDesc: botDesc,
    botCode: botCode
  });
  callback(false);
};

function getCurrentBot(userId, callback) {
  root.child('users').child(userId).once('value', function(data) {
    console.log(data.val().bot)
    callback(data.val().bot, null);
  })
}

function findUser(id, callback) {
  root.child('users').child(id).once('value', function(data) {
    if (data.val()) {
      callback(false, data.val());
    } else {
      console.log("User " + id + " was not found.");
      callback(true, null);
    }
  });
};

function fetchGame(userId, id, callback) {  
  root.child('games/' + id + '/gameJson').once('value', function(data){
    callback(false, data.val());
  });
  root.child('users').child(userId).child('watched').child(id).set('seen');
};

function getAllUsers(callback) {
  root.child('users').once('value', function(data) {
    callback(data.val());
  });
}

function getAllRequests(callback) {
  root.child('requests').once('value', function(data) {
    callback(data.val());
  });
}

function getAllGames(callback) {
  root.child('games').once('value', function(data) {
    callback(data.val());
  });
}

function makeRequest(challengerId, otherId, callback) {
  root.child('requestCounter').transaction(function(counter) {
    return counter + 1;
  }, function(error, committed, snapshot) {
    if (!error) {
      var gameId = snapshot.val();
      findUser(challengerId, function(error, user) {
        if (error) {
          callback(error);
          return;
        }
        findUser(otherId, function(error2, user2) {
          if (error2) {
            callback(error);
            return;
          }
          root.child('requests').child(gameId).set({id: gameId, user1: challengerId, user2: otherId, status: "open"});
        });
      });
      callback(false);
    } else {
      callback(error);
    }
  });
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
exports.makeRequest = makeRequest;
exports.getAllUsers = getAllUsers;
exports.getAllRequests = getAllRequests;
exports.getAllGames = getAllGames;
