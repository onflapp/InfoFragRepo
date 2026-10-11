function transform(input, done) {
  const { execSync } = require('child_process');
  const path = require('path');
  const fs = require('fs');
  const name = path.basename(input, '.webloc');

  let txt = execSync('plutil -extract URL raw "'+input+'"', { encoding: 'utf-8'});
  if (txt) {
    txt = txt.trim();
    let markdown = '['+name+']('+txt+')';
    let header = {};
    header.type = 'Web Location Link';
    header.resource = escape(path.basename(input));

    done({metadata:header, content:markdown});
  }
  else {
    done();
  }
}
module.exports.transform = transform;
