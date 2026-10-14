const SearchIndex = require('./SearchIndex');
const sh = require('shelljs');
const fs = require('fs-extra');
const utils = require('./utils.js');

const config = utils.read_json('./config.json');

let path = config.repositoryBase || './_repository';
let index = new SearchIndex(path);

let list = sh.find(path).filter((file) => { return file.match(/info\.md$/); });

list.forEach((it) => {
  index.indexPath(it);
});
