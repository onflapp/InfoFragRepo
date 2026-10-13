const Repository = require('./Repository');
const SearchIndex = require('./SearchIndex');

const sh = require('shelljs');
const fs = require('fs-extra');

const config = fs.readJsonSync('./config.json');

let path = config.repositoryBase || './_repository';
let index = new SearchIndex(path);
let repo = new Repository(path);

let list = sh.find(path).filter((file) => { return file.match(/info\.md$/); });

list.forEach((it) => {
  repo.updateFragmentContent(it).then((dir) => {
    index.indexPath(dir);    
  });
});
