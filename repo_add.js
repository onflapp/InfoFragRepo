const SearchIndex = require('./SearchIndex');
const Repository = require('./Repository');

const sh = require('shelljs');
const fs = require('fs-extra');
const paths = require('path');
const utils = require('./utils.js');
const config = utils.read_json('./config.json');

const args = utils.parse_args({
  group: { type: 'string', short: 'g' },
  path: { type: 'positional' }
});

let path = config.repositoryBase || './_repository';
let index = new SearchIndex(path);
let repo = new Repository(path);

let source = args.path[0];
let group = args.group;

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
    resource: 'file://'+escape(res),
    timestamp: ts
  };

  if (group) info.group = group;

  repo.addExternalFragment(info, it).then((dir) => {
    console.log(name);
    index.indexPath(dir);
  });
});
