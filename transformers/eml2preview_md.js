const fs = require('fs');
const tmp = require('tmp');
const itools = require('../ImageTools');
const mdtrans = require('./eml2md');
const txtrans = require('./text2preview');

function transform(input, done) {
  const preview = tmp.tmpNameSync()+'.pdf';
  const thumbnail= tmp.tmpNameSync()+'.png';

  mdtrans.parse_body(input, function(headers, markdown) {
    let rv = {};
    
    txtrans.convert_md(markdown, function(pbuff, tbuff) {
      rv.preview = preview;
      fs.writeFileSync(preview, pbuff);

      rv.thumbnail= thumbnail;
      fs.writeFileSync(thumbnail, tbuff);

      done(rv);
    });
  });
}

module.exports.transform = transform;
