const path = require('path');

function transform(input, done) {
  const md = require('markitdown-node');
  const conv = new md.MarkItDown();

  conv.convert(input).then(function(result) {
    if (result.status === 'success') {
      const txt = result.markdown_content;

      let header = {};
      header.type = 'PDF Document Content';
      header.resource = escape(path.basename(input));

      done({metadata:header, content:txt});
    }
    else {
      console.log('E:'+result.status + ':' + result.errors);
      done();
    }
  });
}

/*
function transform(input, done) {
  const fs = require('fs');
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
*/

module.exports.transform = transform;
