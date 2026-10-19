const path = require('path');
const tools = require('./../TextTools');


function transform(input, done) {
  const md = require('markitdown-node');
  const conv = new md.MarkItDown();
  const types = {
    '.xls': 'Excel Spreadsheet',
    '.xlsx': 'Excel Spreadsheet',
    '.doc': 'Word',
    '.docx': 'Word',
    '.pptx': 'PowerPoint Presentation',
    '.ppt': 'PowerPoint Presentation'
  };

  const action = 'Summarize content of the document in 3 sentences.';

  conv.convert(input).then(function(result) {
    if (result.status === 'success') {
      const txt = result.markdown_content;
      const type = types[path.extname(input)];

      let header = {};
      header.type = type+' Document Content';
      header.resource = escape(path.basename(input));

      if (txt.length < 1000) {
        done({metadata:header, content:txt});
      }
      else if (txt.length > 5000) {
        tools.summarize_text(action, txt.substr(0, 5000), function(summary) {
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

module.exports.transform = transform;
