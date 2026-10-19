const path = require('path');
const tools = require('./../TextTools');

function transform(input, done) {
  const md = require('markitdown-node');
  const conv = new md.MarkItDown();
  const action = 'Summarize content of the document in 3 sentences.';

  conv.convert(input).then(function(result) {
    if (result.status === 'success') {
      const txt = result.markdown_content;

      let header = {};
      header.type = 'PDF Document Content';
      header.resource = escape(path.basename(input));

      if (txt.length < 1000) {
        done({metadata:header, content:txt});
      }
      else if (txt.length > 2000) {
        tools.summarize_text(action, txt.substr(0, 2000), function(summary) {
          done({metadata:header, content:txt, summary:summary});
        });
      }
      else {
        tools.summarize_text(action, txt, function(summary) {
          done({metadata:header, content:txt, summary:summary});
        });
      }
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
