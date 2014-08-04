var authConfig = require('./authConfig');

function challengeEmail(userId, userName, otherName, matchId, userSecret) {
  html = '';
  html += '<div style="text-align:center"><img src="'+authConfig.url+'/assets/email-banner.png" width="378" height="78" alt="Planes! By NEXT CODE" /></div><br />';
  html += 'Hey ' + userName + '!<br /><br />';
  html += otherName + ' challenged your bot to an epic duel of Planes! You can view the game <a href="'+authConfig.url+'/arena?' + matchId + '">here</a>, or log on to <a href="'+authConfig.url+'">Planes</a> to challenge him back.<br /><br />';
  html += 'Cheers,<br />';
  html += 'The Planes Team<br /><br />'
  html += '<div style="text-align:center; color: #666; font-size: 11px">To unsubscribe from Planes emails, <a href="'+authConfig.url+'/goodbye?a=' + userId + '&b=' + userSecret + '">Click here</a>. You can also toggle this option in your dashboard settings.</div>';
  
  return html;
}

exports.challengeEmail = challengeEmail;