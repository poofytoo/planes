var firebase = require('./firebase');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var authConfig = require('./authConfig');
var nodemailer = require('nodemailer');
var emailTemplate = require('./emailTemplate');
var constants = require('./constants');

var VALID_FILES = ['.py'];
var MAX_FILE_SIZE = 50000;

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: authConfig.emailerEmail,
        pass: authConfig.emailerPassword
    }
});

var condenseName = function(n) {
  if (!n) {
    return n;
  }
  c = n.split(' ');
  return c[0] + ' ' + c[(c.length-1)].charAt(0);
}

exec('mkdir -p uploads');

function fsWriteFile(data, userId, botFileName, botName, botDesc, callback) {
  console.log('writing file');
  var botCode = data.toString();
  var pathName = __dirname + "/uploads/" + userId + "/" + botFileName;
  fs.writeFile(pathName, data, function (err) {
    if (err)
      callback(err)
    firebase.createBot(userId, botFileName, botName, botDesc, botCode, callback)
  });
}

   
exports.createBot = function(userId, botName, botDesc, botFile, callback) {

  // Check filetype
  var fileExt = path.extname(botFile.path);
  if (VALID_FILES.indexOf(fileExt) == -1) {
    console.log('invalid file extension: ' + fileExt);
    callback('invalid file type'); 
    return;
  }
  
  fs.stat(botFile.path, function (err, stats) {
    
    // Check file size
    if (stats.size > MAX_FILE_SIZE) {
      console.log('file too large. ' + MAX_FILE_SIZE + ' ' + stats.size);
      callback('max file size is ' + MAX_FILE_SIZE + ' bytes. Your file is ' + stats.size + ' bytes'); 
      return;
    } else {
    
      
      var numFiles = 0;
      // Reformat the Upload File Name
      var uploadBotName = (numFiles+1) + '-' + botName + fileExt;
      
      // Read file and prepare for write
      fs.readFile(botFile.path, function (err, data) {
        if(!fs.existsSync("uploads/" + userId)){
          console.log('creating directory');
          fs.mkdir("uploads/" + userId, 0777, function(err){
             if(err){
               callback(err)
             } else {
               console.log('lets make a new file');
               fsWriteFile(data, userId, uploadBotName, botName, botDesc, callback);
             }
          });   
        } else {
          console.log('re-uploading file');
          // Collect number of files
          numFiles = fs.readdirSync("uploads/" + userId).length;
          uploadBotName = (numFiles+1) + '-' + botName + fileExt;
          fsWriteFile(data, userId, uploadBotName, botName, botDesc, callback);
        }
      });
    }
  });
}

exports.getBotStats = function(userId, callback) {
  // Compute Bot Stats. Code goes here
  firebase.getCurrentBot(userId, function(data) {
    data.username = condenseName(data.username);
    console.log(data.username);
    callback(data, false);
  });
}

exports.getLatestGamesForUser = function(userId, callback) {
  firebase.getAllRequests(function(requests) {
    firebase.findUser(userId, function(error, user) {
      if (error) {
        callback("User not found.", false);
        return;
      }
      var relevantGames = [];
      for (var reqId in requests) {
        var request = requests[reqId];
        var botQualifier = 'NONE';

        if (request.user1 === userId) {
          botQualifier = 'BOT1';
        } else if (request.user2 === userId) {
          botQualifier = 'BOT2';
        }

        if (botQualifier !== 'NONE') {
          var opponent = request.username1;
          if (opponent === user.username) {
            opponent = request.username2;
          }

          var resultObject = {
            gameId : reqId,
            opponentName : opponent
          };
          if (request.status === 'closed') {
            if (user.watched && user.watched[reqId]) {
              resultObject['status'] = 'watched';
            } else {
              resultObject['status'] = 'unwatched';
            }
          } else {
            resultObject['status'] = 'waiting';
          }

          if (request.result === "TIMEOUT" || request.result === "DRAW") {
            resultObject['result'] = 'tied';
          } else if (request.result === botQualifier) {
            resultObject['result'] = 'won';
          } else if (request.result) {
            resultObject['result'] = 'lost';
          }

          relevantGames.push(resultObject);
        }
      }

      relevantGames.sort(function(a, b) {
        return b.gameId - a.gameId;
      });

      var returnObject = {}
      for (var i = 0; i < Math.min(relevantGames.length, 20); i++) {
        returnObject[i] = relevantGames[i];
        returnObject[i].opponentName = condenseName(returnObject[i].opponentName);
      }
      callback(false, returnObject);
    });
  });
}

exports.getTopBots = function(userId, callback) {
  firebase.getAllUsers(function(users) {
    var userList = [];
    for (var userId in users) {
      if (users[userId].bot) {
        userList.push(users[userId]);
      }
    }

    userList.sort(function(a, b) {
      if (a.elo && b.elo) {
        return b.elo - a.elo;
      }
      return 0;
    });

    var userResultObject = {}
    for (var i = 0; i < userList.length; i++) {
      var user = userList[i];
      userResultObject[i] = {
        user: condenseName(user.username),
        userId: user.id,
        elo: user.elo,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws
      }

      if (user.bot) {
        userResultObject[i]['botName'] = user.bot.botName;
      }
    }
    callback(userResultObject);
  });
}

exports.getGlobalGames = function(userId, callback) {
  firebase.getAllRequests(function(requests) {
    firebase.findUser(userId, function(error, user) {
      if (error) {
        callback("User not found.", false);
        return;
      }
      var recentGames = [];
      for (var reqId in requests) {
        var request = requests[reqId];

        if (request.user1 === userId || request.user2 === userId || request.status !== 'closed'
            || request.user1 in constants.TEST_BOT_IDS || request.user2 in constants.TEST_BOT_IDS) {
          continue;
        }


        var resultObject = {
          gameId : reqId,
          username1 : condenseName(request.username1),
          username2 : condenseName(request.username2)
        };

        if (user.watched && user.watched[reqId]) {
          resultObject['status'] = 'watched';
        } else {
          resultObject['status'] = 'unwatched';
        }

        if (request.result === "TIMEOUT" || request.result === "DRAW") {
          resultObject['result'] = 'tied';
        } else if (request.result === 'BOT1') {
          resultObject['result'] = resultObject.username1;
        } else if (request.result) {
          resultObject['result'] = resultObject.username2;
        }

        recentGames.push(resultObject);
      }

      recentGames.sort(function(a, b) {
        return b.gameId - a.gameId;
      });

      var returnObject = {}
      for (var i = 0; i < Math.min(recentGames.length, 20); i++) {
        returnObject[i] = recentGames[i];
      }
      callback(false, returnObject);
    });
  });
}

exports.toggleEmail = function(userId, state, callback) {
  if (state == 'on') {
    firebase.setEmailPreferences(userId, 'on', function() {
      callback();
    })
  } else {
    firebase.setEmailPreferences(userId, 'off', function() {
      callback();
    })
  }
}

sendChallengeEmail = function(userId, userName, userEmail, otherName, matchId, userSecret) {
  var mailOptions = {
      from: 'The Planes Team <theplanesgame@gmail.com>', // sender address
      to: userEmail, // list of receivers
      subject: 'Your plane was challenged by ' + otherName + '!', // Subject line
      replyTo: 'planes@mit.edu',
      text: emailTemplate.challengeEmail(userId, userName, otherName, matchId, userSecret), // plaintext body
      html: emailTemplate.challengeEmail(userId, userName, otherName, matchId, userSecret) // html body
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      }else{
          console.log('Message sent: ' + info.response);
      }
  });
}

getUserAndSendEmail = function(userId, matchId, otherName) {
  firebase.findUser(userId, function(error, user) {
    if (user.emails === "on") {
      if (user.email && user.secret) {
        sendChallengeEmail(userId, user.username, user.email, otherName, matchId, user.secret);
      }
    }
  });
}

exports.makeRequest = function(challengerUsername, challengerId, otherId, callback) {
  firebase.makeRequest(challengerUsername, challengerId, otherId, function(error, gameId) {
    if (error) {
      callback(error);
    } else {
      getUserAndSendEmail(otherId, gameId, challengerUsername);
      callback(false);
    }
  });
}


exports.findUser = firebase.findUser;
exports.updateUserStatus = firebase.updateUserStatus;
exports.userList = firebase.userList;
exports.fetchGame = firebase.fetchGame;
exports.fetchGamePublic = firebase.fetchGamePublic;
exports.verifyUser = firebase.verifyUser;
exports.checkBetaToken = firebase.checkBetaToken;

exports.sendChallengeEmail = sendChallengeEmail;
