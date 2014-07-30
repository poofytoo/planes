var firebase = require('./firebase');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var path = require('path');

var VALID_FILES = ['.py'];
var MAX_FILE_SIZE = 50000;

function initialize() {
  timestamp = (new Date()).getTime();
}
initialize();

function fsWriteFile(data, userId, botName, botDesc, callback) {
  console.log('writing file');
  var pathName = __dirname + "/uploads/" + userId + "/" + botName;
  fs.writeFile(pathName, data, function (err) {
    if (err)
      callback(err)
    firebase.createBot(userId, botName, botDesc, callback)
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
    
      // Collect number of files
      var numFiles = fs.readdirSync("uploads/" + userId).length;
      
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
               fsWriteFile(data, userId, uploadBotName, botDesc, callback);
             }
          });   
        } else {
          console.log('re-uploading file');
          fsWriteFile(data, userId, uploadBotName, botDesc, callback);
        }
      });
    }
  });
}

/*
exports.localStrategy = new LocalStrategy(function(username, password, callback) {
  firebase.getUser(username, function(err, user) {
    if (user) {
      bcrypt.compare(password, user.pwHash, function(err, authenticated) {
        if (authenticated) {
          callback(null, user);
        } else {
          callback(null, false);
        }
      });
    } else {
      callback(null, false);
    }
  });
});
*/

/*
exports.createUser = function(username, password, passwordconfirm, callback) {
  if(/[^a-zA-Z0-9_]/.test(username)) {
    callback('Invalid characters in username');
    return;
  }
  if (password !== passwordconfirm) {
    callback('Passwords don\'t match');
    return;
  }
  firebase.getUser(username, function(err, user) {
    if (user) {
      callback('Username already exists');
    } else {
      firebase.createUser(username, bcrypt.hashSync(password, 10), function(err) {
        callback(err);
      });
    }
  });
}

*/

exports.findUser = firebase.findUser;
exports.updateUserStatus = firebase.updateUserStatus;
exports.userList = firebase.userList;
