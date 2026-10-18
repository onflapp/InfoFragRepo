const Repository = require('./Repository');

const fs = require('fs-extra');
const utils = require('./utils.js');
const config = utils.read_json('./config.json');

const args = utils.parse_args({
  content: { type: 'string', short: 'c' },
  paths:{ type: 'positional' }
});

let path = config.repositoryBase || './_repository';
let repo = new Repository(path);
let fpath = args.paths[0];

let text = repo.readFragmentContentAtPath(fpath).then((txt) => {
  console.log(txt);
});
