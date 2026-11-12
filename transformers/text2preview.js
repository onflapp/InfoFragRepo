const mdpdf = require('@mdpdf/mdpdf');
const fs = require('fs-extra');
const itools = require('../ImageTools');
const tmp = require('tmp');
const matter = require('gray-matter');
const paths = require('path');

function convert_md(buff, done) {
  const opts = {
    margin:'2mm',
    fontSize: 12,
    typstConfig: `
    #show link: it => {
      set text(fill: rgb("#0969da"))
      underline(it.body)
    }
  `,
    fontFamily: 'sans-serif'
  };

/*
  mdpdf.markdownToTypstCode(buff, opts).then(function(xxx) {
    console.log(xxx);
  });
*/

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

  fs.readFile(input, 'utf8', function(err, buff) {
    let minfo = matter(buff);
    let rv = {};

    convert_md((minfo.content || buff), function(pbuff, tbuff) {
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
