function transform(input, done) {
  const itools =require('../ImageTools');
  const libre = require('@deepseek-ai/libreoffice-kit');
  const tmp = require('tmp');
  const path = require('path');
  const fs = require('fs');

  const preview = tmp.tmpNameSync()+'.pdf';
  const thumbnail= tmp.tmpNameSync()+'.png';
  const ifile = path.resolve(input);

  libre.createConverter({
    timeoutMs: 120_000,
  })
  .then(function(converter) {
    converter.render({
      inputPath: ifile,
      outputPath: preview,
    })
    .then(function(result) {
      converter.dispose().then(function() {
        let rv = {};
        rv.preview = preview;

        itools.make_thumbnail_pdf(fs.readFileSync(preview), function(buff) {
          fs.writeFile(thumbnail, buff, function() {

            rv.thumbnail= thumbnail;
            done(rv);
          });
        });
      });
    })
    .catch(function(ex) {
      console.log(ex);
    });
  });
}

module.exports.transform = transform;
