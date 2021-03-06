/* Functions that interact with Firebase */

var Firebase = require('firebase');
var authConfig = require('./authConfig');
var root = new Firebase(authConfig.firebaseURL);
root.auth(authConfig.firebaseSecret);
var http = require('http');
var zlib = require('zlib');

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
    if (notFound) {
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
    callback(data.val(), null);
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
  root.child('requests').child(id).once('value', function(requestData) {
    if (requestData.val()) {
      root.child('games').child(id).once('value', function(data) {
        if (data.val()) {
          // Decompress gzipped game json
          zlib.gunzip(new Buffer(data.val().gameJson, 'base64'), function(error, result) {
            if (error) {
              callback(error, false);
              return;
            }

            var gameObject = JSON.parse(result.toString('utf-8'));
            gameObject['username1'] = requestData.val().username1;
            gameObject['username2'] = requestData.val().username2;

            callback(false, gameObject);

            findUser(userId, function(error, user) {
              if (!error) {
                root.child('users').child(userId).child('watched').child(id).set('seen');
              }
            });
          });
        } else {
          callback("processing", false);
        }
      });
    } else {
      callback("Game id not found.", false);
    }
  });
};

function fetchGamePublic(id, callback) {
  fetchGame("placeholder-nonexistent", id, callback);
}

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
  console.log("SOMEONE IS GETTING ALL THE GAMES");
  root.child('games').once('value', function(data) {
    callback(data.val());
  });
}

function compressGame(gameId) {
  root.child('games').child(gameId).once('value', function(data) {
    console.log("processing: " + gameId);
    if (!data.val()) {
      console.log("Game id: " + gameId + " does not exist.");
      return;
    }
    var game = data.val();
    try {
      var testing = JSON.parse(game.gameJson);
      zlib.gzip(game.gameJson, function(error, result) {
        if (error) {
          console.log("WHAT THE HECK MAN SHIT");
          return;
        }
        console.log('Done gzipping : ' + gameId);
        root.child('games').child(gameId).child('gameJson').set(result.toString('base64'));
      });
    } catch(error) {
      console.log(gameId + " is already compressed seems like.");
    }
  });
}

function makeRequest(challengerUsername, challengerId, otherId, callback) {
  if (challengerId === otherId) {
    callback("Can't challenge yourself.", false);
    return;
  }
  
  root.child('requestCounter').transaction(function(counter) {
    return counter + 1;
  }, function(error, committed, snapshot) {
    if (!error) {
      var gameId = snapshot.val();
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
          root.child('requests').child(gameId).set({
            id: gameId, 
            user1: challengerId, 
            username1: challengerUsername,
            user2: otherId, 
            username2: user2.username,
            watched: {0:'seen'},
            status: "open"
          });
          root.child('users').child(challengerId).child('lastRequestTime').set(new Date().getTime());
          callback(false, gameId);
        });
      });
    } else {
      callback(error, false);
    }
  });
}

function setEmailPreferences(userId, state, callback) {
  root.child('users/' + userId + '/emails').set(state);
  callback(false);
}

function verifyUser(userId, userSecret, callback) {
  root.child('users').child(userId).child('secret').once('value', function(data) {
    callback(userSecret !== data.val());
  })
}

function checkBetaToken(betaToken, userId, callback) {
  root.child('users').child(userId).once('value', function(userdata) {
    if (!betaToken) {
      console.log('Null beta token.');
      callback('Null beta token.');
      return;
    }
    var sanitizedBetaToken = sanitizeUsername(betaToken);
    console.log('sanitized beta token: ' + sanitizedBetaToken);
    root.child('betaTokens').child(sanitizedBetaToken).once('value', function(data) {
      var tokenStatus = data.val();
      if (tokenStatus === 'unused') {
        root.child('users').child(userId).child('approved').set(true);
        root.child('betaTokens').child(sanitizedBetaToken).set(userId);
        callback(false);
      } else {
        callback('Incorrect beta token!');
        console.log("Incorrect beta token!");
      }
    });
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
exports.fetchGamePublic = fetchGamePublic;
exports.makeRequest = makeRequest;
exports.getAllUsers = getAllUsers;
exports.getAllRequests = getAllRequests;
exports.getAllGames = getAllGames;
exports.setEmailPreferences = setEmailPreferences;
exports.verifyUser = verifyUser;
exports.checkBetaToken = checkBetaToken;
