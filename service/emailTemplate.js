var http = require('http');

function challengeEmail(userId, userName, otherName, matchId, userSecret) {
  html = '';
  html += 'Hey ' + userName + '!<br /><br />';
  html += otherName + ' challenged your bot to an epic duel of Planes! You can view the game <a href="http://theplanesgame.com/arena?' + matchId + '">here</a>, or log on to <a href="http://theplanesgame.com">Planes</a> to challenge him back.<br /><br />';
  html += 'Cheers,<br />';
  html += 'The Planes Team<br /><br />'
  html += '<a href="http://theplanesgame.com/goodbye?a=' + userId + '&b=' + userSecret + '">Click here</a> if you would like to unsubscribe from Planes emails. You can also toggle this option in your dashboard settings.';
  
  return html;
}

exports.challengeEmail = challengeEmail;