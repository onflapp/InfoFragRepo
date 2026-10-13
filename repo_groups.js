const SearchIndex = require('./SearchIndex');
const sh = require('shelljs');
const fs = require('fs-extra');
const config = fs.readJsonSync('./config.json');

let path = config.repositoryBase || './_repository';
let index = new SearchIndex(path);

index.listGroups().then((list) => {
  list.forEach((it) => {
    console.log(it);
  });
});
