const fs = require('fs');
const itools = require('../ImageTools');
const htmltrans = require('./html2preview');

function transform(input, done) {
  const path = require('path');
  const tmp = require('tmp');
  const { simpleParser } = require('mailparser');
  const thumbnail= tmp.tmpNameSync()+'.png';

  const buff = fs.readFileSync(input);
  
  simpleParser(buff).then(function(email) {
    let html = '';
    /*
    markdownOutput += '**From:** ' + (email.from?.text || 'Unknown') + '\n';
    markdownOutput += '**To:** ' + (email.to?.text || 'Unknown') + '\n';
    markdownOutput += '**Date:** ' + (email.date ? email.date.toISOString() : 'Unknown') + '\n';
    markdownOutput += '\n\n\n---\n\n\n';
    */

    if (email.html) {
      html = email.html;
    } 
    else if (email.text) {
      html = '<pre>'+email.text+'</pre>';
    } 
    else {
      console.log('the email contains no readable HTML or text body.');
      done();
    }
  
    htmltrans.convert_html(html).then((path) => {
      if (path) {
        let rv = {};
        rv.preview = path;
        itools.make_thumbnail_pdf(fs.readFileSync(path), function(buff) {
          fs.writeFile(thumbnail, buff, function() {
            rv.thumbnail= thumbnail;
            done(rv);
          });
        });
      }
      else {
        done();
      }
    });
  });
}

module.exports.transform = transform;
