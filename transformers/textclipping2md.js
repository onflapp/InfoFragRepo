function transform(input, done) {
  const { execFileSync } = require('child_process');
  const { toDocument, toMarkdown, toMarkdownBytes } = require('@firecrawl/anydoc');
  const path = require('path');
  const fs = require('fs');

  let buff = null;

  try {
    buff = execFileSync('/usr/bin/plutil', ['-extract', 'UTI-Data.public\\.rtf', 'raw', input], {encoding: 'utf8'});
  }
  catch(ex) {}

  if (buff) {
    toMarkdownBytes(buff).then(function(txt) {
      let header = {};
      header.type = 'Rich Text Fragment Content';
      header.resource = escape(path.basename(input));

      done({metadata:header, content:txt});
    });
    return;
  }

  try {
    buff = execFileSync('/usr/bin/plutil', ['-extract', 'UTI-Data.public\\.utf8-plain-text', 'raw', input], {encoding: 'utf8'});
  }
  catch(ex) {}

  if (buff) {
    let header = {};
    header.type = 'Text Fragment Content';
    header.resource = escape(path.basename(input));

    done({metadata:header, content:''+buff});
  }
}
module.exports.transform = transform;
