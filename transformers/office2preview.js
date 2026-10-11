function transform(input, dest, done) {
  const path = require('path');
  const fs = require('fs').promises;
  const libre = require('libreoffice-convert');
  const convertAsync = require('util').promisify(libre.convert);
  const output = dest+'/preview.pdf';
  const opts = null;

  fs.readFile(input).then(function(docxBuf) {
    convertAsync(docxBuf, '.pdf', opts).then(function (pdfBuf) {
      if (pdfBuf) {
        fs.writeFile(output, pdfBuf).then(function() {
          make_thumbnail(pdfBuf, dest, function(ipath) {
            done([output, ipath]);
          });
        });
      }
    }).catch(function(err) {
      console.log('unable to convert ' + input + ':' + err);;
      done();
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
