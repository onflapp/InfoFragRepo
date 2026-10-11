const SearchIndex = require('./SearchIndex');
const sh = require('shelljs');

let path = './_records';
let index = new SearchIndex(path);

let list = sh.find(path).filter((file) => { return file.match(/info\.md$/); });

list.forEach((it) => {
  index.indexPath(it);
});
