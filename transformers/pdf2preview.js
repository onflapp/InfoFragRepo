function transform(input, dest, done) {
  const path = require('path');
  const fs = require('fs');
  const output = dest+'/preview.pdf';

  fs.copyFile(input, output, function(err) {
    make_thumbnail(input, dest, function(ipath) {
      done([output, ipath]);
    });
  });
}

function make_thumbnail(input, dest, done) {
  const fs = require('fs').promises;
  const pdf = require('pdf-to-img').pdf;
  
  pdf(input, { scale: 1.5 }).then(function(doc) {
    const output = dest+'/thumbnail.png';

    doc.getPage(1).then(function(buff) {
      fs.writeFile(output, buff).then(function() {
        done(output);
      });
    });
  });
}


module.exports.transform = transform;
