function cleanup_text(txt) {
  const franc = require('franc');
  const lines = txt.split('\n');
  let rv = [];
  
  lines.forEach(function(it) {
    let line = it.trim();
    let lang = franc.franc(line);
    if (lang != 'und' && line.length > 2) {
      rv.push(line);
    }
  });

  if (rv.length > 0) return rv.join('\n');
  else return null;
}

function transform(input, done) {
  const path = require('path');
  const tesseract = require('node-tesseract-ocr');

  const config = {
    lang: 'eng',
    oem: 1,
    psm: 3
  };

  tesseract.recognize(input, config).then(function(txt) {
    let content= cleanup_text(txt);
    let header = {};

    if (content) {
      header.type = 'Image with OCR extracted English content';
      header.resource = escape(path.basename(input));
    }
    else {
      header.type = 'Image';
      header.resource = escape(path.basename(input));
    }

    done({metadata:header,content:content});
  })
  .catch(function(error) {
    console.log(error.message)
    done();
  });
}

module.exports.transform = transform;
