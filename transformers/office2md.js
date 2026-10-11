const path = require('path');

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

  conv.convert(input).then(function(result) {
    if (result.status === 'success') {
      const txt = result.markdown_content;
      const type = types[path.extname(input)];

      let header = {};
      header.type = type+' Document Content';
      header.resource = escape(path.basename(input));

      done({metadata:header, content:txt});
    }
    else {
      console.log('E:'+result.status + ':' + result.errors);
      done();
    }
  });
}

module.exports.transform = transform;
