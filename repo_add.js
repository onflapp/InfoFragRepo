const SearchIndex = require('./SearchIndex');
const Repository = require('./Repository');

const sh = require('shelljs');
const fs = require('fs-extra');
const paths = require('path');
const parseArgs = require('node:util').parseArgs;

const config = fs.readJsonSync('./config.json');

const options = {
  group: { type: 'string', short: 'g' }
};

try {
  args = parseArgs({options, allowPositionals:true});
  if (args.positionals.length == 0) throw new Error('no path');
}
catch(ex) {
  console.log(ex.message);
  process.exit(1);
}

let path = config.repositoryBase || './_repository';
let index = new SearchIndex(path);
let repo = new Repository(path);

let source = args.positionals[0];
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
