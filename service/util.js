var fs = require('fs');
var hbs = require('hbs');

exports.condenseUsername = function(n) {
  c = n.split(' ');
  return c[0] + ' ' + c[(c.length-1)].charAt(0);
}

exports.registerContent = function (content) {
  var contentDir = __dirname + '/views/partials/' + content + '.html';
  var content = fs.readFileSync(contentDir, 'utf8');
  hbs.registerPartial('content', content);
}

exports.getPageInfo = function (page, description) {
  var MAIN_DESCRIPTION = "Planes is a silly little game that puts your code to the test against your friend's code! Challenge them in an epic duel of planes!";
  if (description == undefined) {
    description = MAIN_DESCRIPTION;
  }

  switch(page) {
    case 'index':
      return {
        pageCSS: 'main',
        scripts: ['blabber', 'scripts'],
        description: description
      }
    case 'login':
      return {
        pageCSS: 'login',
        scripts: [],
        description: description
      }
    case 'arena':
      return {
        pageCSS: 'arena',
        scripts: ['arena'],
        description: description,
        isArena: true,
        back: true
      }
    case 'help':
      return {
        pageCSS: 'help',
        scripts: [],
        description: description,
        back: true
      }
    case 'error':
    case 'goodbye':
      return {
        pageCSS: 'misc',
        scripts: ['arena'],
        description: description
      }
  }
}
