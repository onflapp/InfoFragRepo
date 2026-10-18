const SearchIndex = require('./SearchIndex');
const parseArgs = require('node:util').parseArgs;
const fs = require('fs-extra');
const chrono = require('chrono-node');
const utils = require('./utils.js');
const config = utils.read_json('./config.json');

const args = utils.parse_args({
  group: { type: 'string', short: 'g' },
  start: { type: 'string', short: 's' },
  end: { type: 'string', short: 'e' },
  query: { type: 'positional' }
});

let path = config.repositoryBase || './_repository';
let index = new SearchIndex(path);
let query = args.query[0];
let filter = args.values;

if (filter.start) filter.start= chrono.parseDate(filter.start).getTime();
if (filter.end)   filter.end= chrono.parseDate(filter.end).getTime();


index.searchText(query, filter).then((list) => {
  list.forEach((it) => {
    console.log(it);
  });
});
