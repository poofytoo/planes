/* Functions that interact with Firebase */

var authConfig = require('./authConfig');
var autoIncrement = require('mongoose-auto-increment');

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
  usersModel.findOne({id: id}, callback);
};

function getElo(userId, callback) {
  usersModel.findOne({id: userId}, function(error, data) {
    if (data) {
      callback(false, data.elo);
    } else {
      callback("User not found.", false);
    }
  });
}

function addWin(userId) {
  findUser(userId, function(error, user) {
    user.wins += 1;
    user.save();
  });
}

function addLoss(userId) {
  findUser(userId, function(error, user) {
    user.losses += 1;
    user.save();
  });
}

function addDraw(userId) {
  findUser(userId, function(error, user) {
    user.draws += 1;
    user.save();
  });
}

function updateElo(userId, newElo) {
  findUser(userId, function(error, user) {
    user.elo = newElo;
    user.save();
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
