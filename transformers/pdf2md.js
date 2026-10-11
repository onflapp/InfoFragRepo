const path = require('path');
const fs = require('fs');

function transform(input, done) {
  const pdf2md = require('@opendocsg/pdf2md');

  const buff = fs.readFileSync(input);

  pdf2md(buff).then(function(txt) {
    let header = {};
    header.type = 'PDF Document Content';
    header.resource = escape(path.basename(input));

    done({metadata:header, content:txt});
  })
  .catch(function(err) {
    console.error(err);
    done();
  });
}

module.exports.transform = transform;
