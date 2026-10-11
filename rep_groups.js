const SearchIndex = require('./SearchIndex');
const sh = require('shelljs');

let path = './_records';
let index = new SearchIndex(path);

index.listGroups().then((list) => {
  list.forEach((it) => {
    console.log(it);
  });
});
