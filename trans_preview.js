const sh = require('shelljs');
const fs = require('fs-extra');
const paths = require('path');
const Transformer = require('./Transformer');
const registry = fs.readJsonSync('./files2preview.json');

let path = process.argv[2];
let ignore = ['info.md', 'content.md', 'index.db', 'preview.pdf', 'preview.png', 'thumbnail.png'];

const trans = new Transformer(registry);

if (sh.test('-d', path)) { 
  let list = sh.find(path).filter((file) => {
    let name = paths.basename(file);
    if (ignore.indexOf(name) >= 0) return false;
    if (sh.test('-f', file)) return true;
    return false;
  });


  list.forEach((input) => {
    trans.transformInput(input).then((rv) => {
      let dir = paths.dirname(input);

      if (rv) {
        if (rv.preview) {
          let ext = paths.extname(rv.preview);
          let out = paths.join(dir, 'preview'+ext);
          fs.move(rv.preview, out, {overwrite: true});

          console.log(out);
        }
        if (rv.thumbnail) {
          let ext = paths.extname(rv.thumbnail);
          let out = paths.join(dir, 'thumbnail'+ext);
          fs.move(rv.thumbnail, out, {overwrite: true});

          console.log(out);
        }
      }
      else console.log('ERROR:' + input);
    });
  });
}
else {
  trans.transformInput(path).then((rv) => {
    console.log(rv);
  });
}
