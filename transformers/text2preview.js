const mdpdf = require('@mdpdf/mdpdf');
const fs = require('fs');
const itools = require('../ImageTools');
const tmp = require('tmp');

function convert_md(buff, done) {
  const opts = {
    margin:'2mm'
  };

  mdpdf.markdownToPdf(buff, opts).then(function(pbuff) {
    itools.make_thumbnail_pdf(pbuff, function(tbuff) {
      done(pbuff, tbuff);
    });
  })
  .catch(function(err) {
    console.log(err);
    done();
  });
}

function transform(input, done) {
  const thumbnail= tmp.tmpNameSync()+'.png';
  const preview = tmp.tmpNameSync()+'.pdf';

  fs.readFile(input, function(tbuff) {

    let rv = {};

    convert_md(tbuff, function(pbuff, tbuff) {
      rv.preview = preview;
      fs.writeFileSync(preview, pbuff);

      rv.thumbnail= thumbnail;
      fs.writeFileSync(thumbnail, tbuff);

      done(rv);
    });

  });
}

module.exports = {
  transform:transform,
  convert_md:convert_md
};
