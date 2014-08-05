var authConfig = require('./authConfig');
var blabber = [' challenged your bot to an epic duel of Planes!',
               ' challenged your plane to an epic duel! The nerve of this guy!',
               ' thinks your pathetic bot won\'t last a second against his.',
               ' decided to challenge your bot while you were away!',
               ' challenged your plane to a duel!',
               ' challenged your plane. Here we go!',
               '\'s plane slapped your plane with a white glove and challenged it to a duel!',
               ' thinks his plane is better than yours.']

function challengeEmail(userId, userName, otherName, matchId, userSecret) {

  phrase = blabber[Math.floor(Math.random() * blabber.length)];
  
  html = '';
  html += '<div style="text-align:center"><img src="'+authConfig.url+'/assets/email-banner.png" width="378" height="78" alt="Planes! By NEXT CODE" /></div><br />';
  html += 'Hey ' + userName + '!<br /><br />';
  html += otherName + phrase + ' You can view the game <a href="'+authConfig.url+'/arena?' + matchId + '">here</a>, or log on to <a href="'+authConfig.url+'">Planes</a> to challenge him back.<br /><br />';
  html += 'Cheers,<br />';
  html += 'The Planes Team<br /><br />'
  html += '<div style="text-align:center; color: #666; font-size: 11px">To unsubscribe from Planes emails, <a href="'+authConfig.url+'/goodbye?a=' + userId + '&b=' + userSecret + '">Click here</a>. You can also toggle this option in your dashboard settings.</div>';
  
  return html;
}

exports.challengeEmail = challengeEmail;