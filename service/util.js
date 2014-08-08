var fs = require('fs');
var hbs = require('hbs');

exports.registerContent = function (partialName, content) {
  var contentDir = __dirname + '/views/partials/' + content + '.html';
  var content = fs.readFileSync(contentDir, 'utf8');
  hbs.registerPartial(partialName, content);
}

exports.registerPageContent = function(folder, header) {
  exports.registerContent('contentHead', folder + '/head')
  exports.registerContent('contentHeader', header)
  exports.registerContent('content', folder + '/content')
}