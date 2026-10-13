const SearchIndex = require('./SearchIndex');
const Repository = require('./Repository');

const sh = require('shelljs');
const fs = require('fs-extra');
const paths = require('path');

const config = fs.readJsonSync('./config.json');

let path = config.repositoryBase || './_repository';
let index = new SearchIndex(path);
let repo = new Repository(path);

let source = process.argv[2];

let list = sh.find(source).filter((file) => { return sh.test('-f', file); });

list.forEach((it) => {
  let name = paths.basename(it);
  let dir = paths.dirname(it);
  if (name.charAt(0) == '.') return;

  let stat = fs.statSync(it);
  let ts = new Date(stat.mtimeMs).toISOString();
  let res = paths.resolve(it);

  let info = { 
    type: 'Document File',
    title: name,
    group: 'test',
    resource: 'file://'+escape(res),
    timestamp: ts
  };

  repo.addExternalFragment(info, it).then((dir) => {
    console.log(name);
    index.indexPath(dir);
  });
});
