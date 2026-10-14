const Repository = require('./Repository');

const parseArgs = require('node:util').parseArgs;
const fs = require('fs-extra');
const utils = require('./utils.js');
const config = utils.read_json('./config.json');

const options = {
  content: { type: 'string', short: 'c' },
};

try {
  args = parseArgs({options, allowPositionals:true});
}
catch(ex) {
  console.log(ex.message);
  process.exit(1);
}

let path = config.repositoryBase || './_repository';
let repo = new Repository(path);
let fpath = args.positionals[0];

let text = repo.readFragmentContentAtPath(fpath).then((txt) => {
  console.log(txt);
});
