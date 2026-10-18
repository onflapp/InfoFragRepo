function make_thumbnail_pdf(pbuff, done) {
  const pdf = require('pdf-to-img').pdf;
  
  pdf(pbuff, { scale: 1 }).then(function(doc) {
    doc.getPage(1).then(function(buff) {
      done(buff);
    });
  }).catch(function(ex) {
    console.log(ex);
    done();
  });
}

/*
function make_thumbnail_pdf(pbuff, done) {
  (async () => {
    const { createCanvas } = require('canvas');
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pbuff)});
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.0 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    page.render(renderContext).promise.then(() => {
      let buff = canvas.toBuffer('image/png');
      console.log(buff);
      done(buff);
    });
  })()
  .catch(function(ex) {
    console.log(ex);
    done();
  });
}
*/

function make_thumbnail_img(input, done) {
  const sharp = require('sharp');
  
  sharp(input)
  .autoOrient()
  .resize({ width:512, height:512 })
  .toBuffer()
  .then(function(buff) {
    done(buff);
  });
}

/*
function make_preview_html(hbuff, done) {
  import('vellora').then((vellora) => {
    vellora.renderPdf(hbuff).then((buff) => {
      done(buff);
    });
  });
}
*/

module.exports = {
  make_thumbnail_img:make_thumbnail_img,
  make_thumbnail_pdf:make_thumbnail_pdf
};
