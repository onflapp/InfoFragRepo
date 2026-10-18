const sh = require('shelljs');
const fs = require('fs-extra');
const paths = require('path');
const Transformer = require('./Transformer');

const utils = require('./utils.js');
const config = utils.read_json('./config.json');
const registry = utils.read_json('./files2md.json');

const args = utils.parse_args({
  summary: { type: 'boolean', short: 's' },
  content: { type: 'boolean', short: 'c' },
  metadata: { type: 'boolean', short: 'm' },
  path: { type: 'positional' }
});

let path = args.path[0];
let list = [];

if (sh.test('-d', path)) {
  let ignore = ['info.md', 'summary.md', 'content.md', 'index.db'];

  list = sh.find(path).filter((file) => {
    let name = paths.basename(file);
    if (name.charAt(0) == '.') return false;
    if (ignore.indexOf(name) >= 0) return false;
    if (sh.test('-f', file)) return true;
    return false;
  });
}
else {
  list.push(path);
}

const trans = new Transformer(registry);

list.forEach((input) => {
  console.log(input);
  trans.transformInput(input).then((rv) => {
    if (rv && args.values.metadata) {
      console.log(rv.metadata);
    }
    else if (rv && args.values.summary) {
      console.log(rv.summary);
    }
    else if (rv && args.values.content) {
      console.log(rv.content);
    }
    else if (rv) {
      console.log(rv);
    }
    else {
      console.log('unable to transform '+input);
    }

  });
});
