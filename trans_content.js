const sh = require('shelljs');
const fs = require('fs-extra');
const paths = require('path');
const Transformer = require('./Transformer');
const registry = fs.readJsonSync('./files2md.json');

let path = process.argv[2];
let ignore = ['info.md', 'content.md', 'index.db'];

let list = sh.find(path).filter((file) => {
  let name = paths.basename(file);
  if (ignore.indexOf(name) >= 0) return false;
  if (sh.test('-f', file)) return true;
  return false;
});

const trans = new Transformer(registry);

list.forEach((input) => {
  trans.transformInput(input).then((rv) => {
    let dir = paths.dirname(input);
    let cpath = paths.join(dir, 'content.md');
    let spath = paths.join(dir, 'summary.md');

    if (rv) {
      console.log(cpath);
    }
    else console.log('ERROR:' + input);
  });
});
