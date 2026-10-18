const Repository = require('./Repository');
const SearchIndex = require('./SearchIndex');

const sh = require('shelljs');
const fs = require('fs-extra');
const paths = require('path');
const utils = require('./utils.js');

const config = utils.read_json('./config.json');

const args = utils.parse_args({
  path: { type: 'positional' }
});

let base = config.repositoryBase || './_repository';
let index = new SearchIndex(base);
let repo = new Repository(base);

let path = args.path[0];
let list = [];

if (sh.test('-d', path)) {
  let ignore = ['info.md', 'summary.md', 'content.md', 'index.db', 'thumbnail.png', 'preview.png', 'preview.pdf'];

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

list.forEach((it) => {
  console.log(it);
  repo.updateFragmentContent(it).then((dir) => {
    index.indexPath(dir);    
  });
});
