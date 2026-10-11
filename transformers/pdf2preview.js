function transform(input, done) {
  const path = require('path');
  const fs = require('fs');
  const tmp = require('tmp');
  const itools =require('../ImageTools');

  const preview = tmp.tmpNameSync()+'.pdf';
  const thumbnail= tmp.tmpNameSync()+'.png';

  fs.copyFile(input, preview, function(err) {
    let rv = {};
    rv.preview = preview;

    itools.make_thumbnail_pdf(fs.readFileSync(preview), function(buff) {
      if (buff) {
        fs.writeFile(thumbnail, buff, function() {
          rv.thumbnail= thumbnail;
          done(rv);
        });
      }
      else {
        done();
      }
    });
  });
}

module.exports.transform = transform;
