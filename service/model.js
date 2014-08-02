var firebase = require('./firebase');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var VALID_FILES = ['.py'];
var MAX_FILE_SIZE = 50000;

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
    callback(data, false);
  });
}

exports.getLatestGamesForUser = function(userId, callback) {
}

exports.getTopBots = function(callback) {
  firebase.getAllUsers(function(users) {
  });
}

exports.findUser = firebase.findUser;
exports.updateUserStatus = firebase.updateUserStatus;
exports.userList = firebase.userList;
exports.fetchGame = firebase.fetchGame;
exports.makeRequest = firebase.makeRequest;
