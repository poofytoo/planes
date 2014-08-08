var firebase = require('./firebase');
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

var VALID_FILES = ['.py'];
var MAX_FILE_SIZE = 50000;

var PYTHON = ".py"
var CPP = ".cc"
var JAVA = ".java"
var UNKNOWN = ".txt"

var checking = false;

var REQUEST_TICK_TIME_MILLIS = 30000;

var queuedGameCounter = 0;
var closedGameCounter = 0;

var lastTimestamp = 0;

// Make directories for source code and compiled binaries
exec('mkdir -p binaries');
exec('mkdir -p sources');

console.log("Server coming back up: " + new Date());
// Listen to requests
checkRequests();
var loop = setInterval(checkRequests, REQUEST_TICK_TIME_MILLIS);

// Blow yourself up in 20 minutes
var x = {}
setTimeout(function() {
  console.log("GOING DOWN: " + new Date());
  return x.y.z;}, 20 * 60 * 1000);


function getBots(user1, user2, callback) {
  firebase.getCurrentBot(user1, function(error1, bot1) {
    if (error1) {
      callback("Failed obtaining bot code for user: " + error1, false, false);
      return;
    }
    firebase.getCurrentBot(user2,  function(error2, bot2) {
      if (error2) {
        callback("Failed obtaining bot code for users: " + error2, false, false);
        return;
      }
      callback(false, bot1, bot2); 
    });
  });
}


function stringEndsWith(string, suffix) {
  return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

function getCodeLang(botName) {
  if (stringEndsWith(botName, PYTHON)) {
    return PYTHON;
  } else if (stringEndsWith(botName, CPP)) {
    return CPP;
  } else if (stringEndsWith(botName, JAVA)) {
    return JAVA;
  }
  return UNKNOWN;
}

function getCodeName(userId, lang) {
  return 'f' + userId + lang;
}

function buildFile(fileName, lang) {
  var fullFileName = fileName + lang;
  if (lang === PYTHON) {
    exec('cp sources/' + fullFileName + ' binaries/' + fullFileName);
    exec('chmod 775 binaries/' + fullFileName);
    return fullFileName;
  } else if (lang === JAVA) {
    exec('javac sources/' + fullFileName + ' -d binaries/');
    return fileName;
  } else if (lang === CPP) {
    exec('g++ -o binaries/' + fileName + ' sources/' + fullFileName);
    return fileName;
  }
}

function executeGame(gameId, binary1, binary2, callback) {
  exec('python modules/engine.py ' + gameId + ' binaries/' + binary1 + ' binaries/' + binary2,
      {timeout : 1000 * 60 * 20, // set a timeout of 5 minutes
       maxBuffer : 5000 * 1024}, 
      function(error, stdout, stderr) {
        callback(error, stdout, stderr);
      }
  );
}

getExpected = function(a,b) {
  return 1.0/(1 + Math.pow(10, ((b - a) / 400.0)));
}

updateRating = function(kfactor, expected,actual,current) {
  return parseInt(current + kfactor * (actual - expected), 10);
}

function updateRankings(userId1, userId2, user1Result, user2Result) {
  firebase.getElo(userId1, function(err, elo1) {
    if (err) {
      return;
    }

    firebase.getElo(userId2, function(err, elo2) {
      if (err) {
        return;
      }

      
      // Gets expected score for first parameter
      var exp1 = getExpected(elo1, elo2);
      var exp2 = getExpected(elo2, elo1);

      var newElo1 = elo1;
      var newElo2 = elo2;

      // update score, 1 if won 0 if lost, .5 if draw
      newElo1 = updateRating(32, exp1, user1Result, elo1);
      newElo2 = updateRating(32, exp2, user2Result, elo2);

      firebase.updateElo(userId1, newElo1);
      firebase.updateElo(userId2, newElo2);
    });
  });
}

function handleOutput(output, userId1, userId2, gameId, callback) {
  var gameOutput = JSON.parse(output);
  var gameObject = {}

  gameObject['gameId'] = gameId;
  gameObject['result'] = gameOutput.result;
  gameObject['user1'] = userId1;
  gameObject['user2'] = userId2;
  gameObject['gameJson'] = output;

  if (gameOutput.result.indexOf("BOT1") !== -1) {
    updateRankings(userId1, userId2, 1, 0);

    firebase.addWin(userId1);
    firebase.addLoss(userId2);
  } else if (gameOutput.result.indexOf("BOT2") !== -1) {
    updateRankings(userId1, userId2, 0, 1);

    firebase.addLoss(userId1);
    firebase.addWin(userId2);
  } else {
    updateRankings(userId1, userId2, .5, .5);

    firebase.addDraw(userId1);
    firebase.addDraw(userId2);
  }

  firebase.addGameObject(gameObject, gameId);
  firebase.closeRequest(gameId, gameOutput.result);
  callback(false);
}

function processRequest(request) {
  if (request.id === -1) {
    return;
  }
  var gameId = request.id;
  var userId1 = request.user1;
  var userId2 = request.user2;

  getBots(userId1, userId2, function(error, bot1, bot2) {
    if (error) {
      console.log(error);
      return;
    }


    var bot1lang = getCodeLang(bot1.botFileName);
    var bot1fn = getCodeName(userId1, bot1lang);
    var bot2lang = getCodeLang(bot2.botFileName);
    var bot2fn = getCodeName(userId2, bot1lang);
    // Dump bot files
    fs.writeFileSync("sources/" + bot1fn, bot1.botCode, {mode : 432});
    fs.writeFileSync("sources/" + bot2fn, bot2.botCode, {mode : 432});

    var binary1 = buildFile('f' + userId1, bot1lang);
    var binary2 = buildFile('f' + userId2, bot2lang);
    console.log("executing game: " + gameId);

    executeGame(gameId, binary1, binary2, function(error, stdout, stderr) {
      if (!error) {
        handleOutput(stdout, userId1, userId2, gameId, function(err2) {
          console.log("closed game: " + gameId);
          if (err2) {
            console.log(err2);
          }
          closedGameCounter++;
        });
      } else {
        console.log(error);
      }
    });
  });
}

function checkRequests() {
  var timestamp = new Date().getTime();
  if (timestamp - lastTimestamp > 60000) {
    console.log("Getting requests." + new Date());
    lastTimestamp = timestamp;
  }

  if (queuedGameCounter > closedGameCounter) {
    console.log("Waiting on " + (queuedGameCounter - closedGameCounter) + " games to finish.");
    return;
  }
  firebase.getRequests(function(error, requests) {
    if (!error) {
      for (var reqId in requests) {
        var request = requests[reqId];
        if (request.status && request.status === 'open') {
          queuedGameCounter++;
          processRequest(request);
        }
      }
    } else {
      console.log(error);
    }
  });
}
