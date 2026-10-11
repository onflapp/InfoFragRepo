const SearchIndex = require('./SearchIndex');
const sh = require('shelljs');

let path = './_repository';
let index = new SearchIndex(path);

let list = sh.find(path).filter((file) => { return file.match(/info\.md$/); });

list.forEach((it) => {
  index.indexPath(it);
});
