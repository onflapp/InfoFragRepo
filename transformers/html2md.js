function transform(input, done) {
  const fs = require('fs');
  const { NodeHtmlMarkdown } = require('node-html-markdown');

  fs.readFile(input, 'utf8', function(err, html) {
    const txt = NodeHtmlMarkdown.translate(html);

    done(txt);
  });
}

module.exports.transform = transform;
