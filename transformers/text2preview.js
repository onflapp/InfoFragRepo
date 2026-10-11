function transform(input, dest, done) {
  const path = require('path');
  const fs = require('fs');
  const output = dest+'/preview.pdf';
  const mdpdf = require('@mdpdf/mdpdf');
  const opts = {
    margin:'5mm'
  };

  fs.readFile(input, 'utf8', function(err, buff) {
    mdpdf.markdownToPdf(buff, opts).then(function(pdfBuff) {
      fs.writeFile(output, pdfBuff, function(err) {
        make_thumbnail(pdfBuff, dest, function(ipath) {
          done([output, ipath]);
        });
      });
    })
    .catch(function(err) {
      console.log(err);
      console.log(input);
    });
  });
}

function make_thumbnail(input, dest, done) {
  const fs = require('fs').promises;
  const pdf = require('pdf-to-img').pdf;
  
  pdf(input, { scale: 1 }).then(function(doc) {
    const output = dest+'/thumbnail.png';

    doc.getPage(1).then(function(buff) {
      fs.writeFile(output, buff).then(function() {
        done(output);
      });
    });
  });
}

module.exports.transform = transform;
