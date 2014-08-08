/* Functions that interact with Firebase */

// var Firebase = require('firebase');
var authConfig = require('./authConfig');
var autoIncrement = require('mongoose-auto-increment');
// var root = new Firebase(authConfig.firebaseURL);
// root.auth(authConfig.firebaseSecret);

// http://mongoosejs.com/docs/index.html
var mongoose = require('mongoose');
mongoose.connect(authConfig.mongoURL);
var requestsSchema = mongoose.Schema({
  id: Number,
  user1: String,
  user2: String,
  username1: String,
  username2: String,
  status: String,
  result: String,
});
requestsSchema.plugin(autoIncrement.plugin, {model: 'requests', field: 'id'});
var requestsModel = mongoose.model('requests', requestsSchema);

var usersSchema = mongoose.Schema({
  id: Number,
  username: String,
  email: String,
  emails: String,
  userStatus: String,
  secret: String,
  wins: Number,
  losses: Number,
  draws: Number,
  elo: Number,
  bot: {
    botCode: String,
    botDesc: String,
    botFileName: String,
    botName: String,
  }
  blurb: String,
  watched: mongoose.Schema.Types.Mixed,
});
var usersModel = mongoose.model('users', usersSchema);

var gamesSchema = mongoose.Schema({
  gameId: Number,
  user1: String,
  user2: String,
  username1: String,
  username2: String,
  result: String,
  gameJson: mongoose.Schema.Types.Mixed,
});
var gamesModel = mongoose.model('games', gamesSchema);

// Not used???
function getUser(username, callback) {
  runMongo(function(err, db){

  });
};

function getRequests(callback) {
  requestsModel.find(callback);
}

function getCurrentBot(userId, callback) {
  usersModel.findOne({id:userId}, function(error, user) {
    if (user && user.bot) {
      callback(false, user.bot);
    } else {
      callback("user not found.", false);
    }
  });
}

function addGameObject(gameObject, gameId) {
  if (gameId) {
    var newGameObject = new gamesModel(gameObject);
    newGameObject.save(function (err) {
      console.log(err);
    });
  } else {
    console.log("No gameId found when adding gameObject");
  }
}

function closeRequest(requestId, result) {
  requestsModel.findOne({id: requestId}, function(error, request) {
    request.status = 'closed';
    request.result = result;
    reqest.save();
  });
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
