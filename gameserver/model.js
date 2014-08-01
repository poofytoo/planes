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

var REQUEST_TICK_TIME_MILLIS = 5000

// Make directories for source code and compiled binaries
exec('mkdir -p binaries');
exec('mkdir -p sources');

// Listen to requests
setInterval(checkRequests, REQUEST_TICK_TIME_MILLIS);

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
      {timeout : 1000 * 60 * 5, // set a timeout of 5 minutes
       maxBuffer : 2000 * 1024}, 
      function(error, stdout, stderr) {
        callback(error, stdout, stderr);
      }
  );
}

function handleOutput(output, userId1, userId2, gameId) {
  var gameOutput = JSON.parse(output);
  var gameObject = {}

  gameObject['gameId'] = gameId;
  gameObject['result'] = gameOutput.result;
  gameObject['user1'] = userId1;
  gameObject['user2'] = userId2;
  gameObject['gameJson'] = output;

  firebase.addGameObject(gameObject, gameId);
}

function processRequest(request) {
  if (request.id === -1) {
    return;
  }
  var gameId = request.id;
  var userId1 = request.user1;
  var userId2 = request.user2;

  getBots(userId1, userId2, function(error, bot1, bot2) {
    var bot1lang = getCodeLang(bot1.botFileName);
    var bot1fn = getCodeName(userId1, bot1lang);
    var bot2lang = getCodeLang(bot2.botFileName);
    var bot2fn = getCodeName(userId2, bot1lang);
    // Dump bot files
    fs.writeFileSync("sources/" + bot1fn, bot1.botCode, {mode : 432});
    fs.writeFileSync("sources/" + bot2fn, bot2.botCode, {mode : 432});

    var binary1 = buildFile('f' + userId1, bot1lang);
    var binary2 = buildFile('f' + userId2, bot2lang);

    executeGame(gameId, binary1, binary2, function(error, stdout, stderr) {
      if (!error) {
        handleOutput(stdout, userId1, userId2, gameId);
        firebase.removeRequest(request.id);
      } else {
        console.log(error);
      }
    });
  });
}

function checkRequests() {
  if (checking) {
    return;
  }
  checking = true;
  firebase.getRequests(function(error, requests) {
    if (error) {
      return;
    }
    for (var reqId in requests) {
      var request = requests[reqId];
      processRequest(request);
    }
  });
  checking = false;
}
