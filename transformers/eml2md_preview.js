const fs = require('fs');
const tmp = require('tmp');
const itools = require('../ImageTools');
const mdtrans = require('./eml2md');
const txtrans = require('./text2preview');

function transform(input, done) {
  const preview = tmp.tmpNameSync()+'.pdf';
  const thumbnail= tmp.tmpNameSync()+'.png';

  mdtrans.transform(input, function(info) {
    let md = info.content;
    let rv = {};
    
    txtrans.convert_md(md, function(pbuff, tbuff) {
      rv.preview = preview;
      fs.writeFileSync(preview, pbuff);

      rv.thumbnail= thumbnail;
      fs.writeFileSync(thumbnail, tbuff);

      done(rv);
    });
  });
}

module.exports.transform = transform;
