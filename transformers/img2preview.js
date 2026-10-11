function transform(input, done) {
  const path = require('path');
  const fs = require('fs');
  const tmp = require('tmp');
  const itools =require('../ImageTools');

  const preview = tmp.tmpNameSync()+'.png';
  const thumbnail= tmp.tmpNameSync()+'.png';

  fs.copyFile(input, preview, function(err) {
    let rv = {};
    rv.preview = preview;

    itools.make_thumbnail_img(preview, function(buff) {
      fs.writeFile(thumbnail, buff, function() {
        rv.thumbnail= thumbnail;
        done(rv);
      });
    });
  });

}

module.exports.transform = transform;
