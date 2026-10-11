const sh = require('shelljs');
const fs = require('fs-extra');
const Transformer = require('./Transformer.js');
const registry = fs.readJsonSync('./files2md.json');

const input = process.argv[2];
const trans = new Transformer(registry);

if (sh.test('-f', input)) {
  trans.transformInput(input).then((rv) => {
    console.log(rv);
  });
}
