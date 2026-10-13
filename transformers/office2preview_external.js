function transform(input, done) {
  const path = require('path');
  const fs = require('fs').promises;
  const tmp = require('tmp');
  const libre = require('libreoffice-convert');
  const itools =require('../ImageTools');
  const convertAsync = require('util').promisify(libre.convert);

  //tmp.setGracefulCleanup();

  const preview = tmp.tmpNameSync()+'.pdf';
  const thumbnail= tmp.tmpNameSync()+'.png';
  const opts = null;


  fs.readFile(input).then(function(dbuff) {
    convertAsync(dbuff, '.pdf', opts).then(function (pbuff) {
      if (pbuff) {
        fs.writeFile(preview, pbuff).then(function() {
          let rv = {};
          rv.preview = preview;

          itools.make_thumbnail_pdf(pbuff, function(buff) {
            fs.writeFile(thumbnail, buff).then(function() {
              rv.thumbnail= thumbnail;
              done(rv);
            });
          });
        });
      }
    }).catch(function(err) {
      console.log('unable to convert ' + input + ':' + err);;
      done();
    });
  });
}

module.exports.transform = transform;
