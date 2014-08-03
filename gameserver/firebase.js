/* Functions that interact with Firebase */

var Firebase = require('firebase');
var authConfig = require('./authConfig');
var root = new Firebase(authConfig.firebaseURL);
root.auth(authConfig.firebaseSecret);

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

function getUser(username, callback) {
  root.child('users').once('value', function(data) {
    var users = data.val();
    for (var userKey in users) {
      var user = users[userKey];
      if (user.username == username) {
        callback(false, user);
        return;
      }
    }
    callback(false, false);
  });
};

function getRequests(callback) {
  root.child('requests').once('value', function(data) {
    var requests = data.val();
    if (requests) {
      callback(false, requests);
    } else {
      callback("No requests found.", requests);
    }
  });
}

function getCurrentBot(userId, callback) {
  root.child('users').child(userId).once('value', function(data) {
    if (data.val() && data.val().bot) {
      callback(false, data.val().bot);
    } else {
      callback("user not found.", false);
    }
  })
}

function addGameObject(gameObject, gameId) {
  if (gameId) {
    root.child('games').child(gameId).set(gameObject);
  } else {
    console.log("No gameId found when adding gameObject");
  }
}

function closeRequest(requestId) {
  root.child('requests').child(requestId).child('status').set('closed');
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

function getElo(userId, callback) {
  root.child('users').child(userId).once('value', function(data) {
    if (data.val()) {
      callback(false, data.val().elo);
    } else {
      callback("User not found.", false);
    }
  });
}

function addWin(userId) {
  root.child('users').child(userId).child('wins').transaction(function(wins) {
    return wins + 1;
  });
}

function addLoss(userId) {
  root.child('users').child(userId).child('losses').transaction(function(losses) {
    return losses + 1;
  });
}

function addDraw(userId) {
  root.child('users').child(userId).child('draws').transaction(function(draws) {
    return draws + 1;
  });
}

function updateElo(userId, newElo) {
  root.child('users').child(userId).once('value', function(data) {
    if (data.val()) {
      root.child('users').child(userId).child('elo').set(newElo);
    }
  });
}

exports.getUser = getUser;
exports.findUser = findUser;

// Planes Specific
exports.getCurrentBot = getCurrentBot;
exports.getRequests = getRequests;
exports.addGameObject = addGameObject;
exports.closeRequest = closeRequest;
exports.getElo = getElo;
exports.updateElo = updateElo;
exports.addWin = addWin;
exports.addLoss = addLoss;
exports.addDraw = addDraw;
