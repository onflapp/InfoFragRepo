function transform(input, done) {
  const paths = require('path');
  const fs = require('fs');

  fs.readFile(input, 'utf8', function(err, txt) {
    let header = {};
    header.type = 'Plain Text File';
    header.resource = escape(paths.basename(input));

    done({metadata:header, content:txt});
  });
}

module.exports.transform = transform;
