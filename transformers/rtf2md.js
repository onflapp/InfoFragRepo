function transform(input, done) {
  const { toDocument, toMarkdown, toMarkdownBytes } = require('@firecrawl/anydoc');
  const path = require('path');

  toMarkdown(input).then(function(txt) {
    let header = {};
    header.type = 'Rich Text Document Content';
    header.resource = escape(path.basename(input));

    done({metadata:header, content:txt});
  });
}

module.exports.transform = transform;
