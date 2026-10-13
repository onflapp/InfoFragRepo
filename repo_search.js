const SearchIndex = require('./SearchIndex');
const parseArgs = require('node:util').parseArgs;
const fs = require('fs-extra');
const chrono = require('chrono-node');
const config = fs.readJsonSync('./config.json');

const options = {
  group: { type: 'string', short: 'g' },
  start: { type: 'string', short: 's' },
  end: { type: 'string', short: 'e' }
};

try {
  args = parseArgs({options, allowPositionals:true});
}
catch(ex) {
  console.log(ex.message);
  process.exit(1);
}

let path = config.repositoryBase || './_repository';
let index = new SearchIndex(path);
let query = args.positionals[0];
let filter = args.values;

if (filter.start) filter.start= chrono.parseDate(filter.start).getTime();
if (filter.end)   filter.end= chrono.parseDate(filter.end).getTime();


index.searchText(query, filter).then((list) => {
  list.forEach((it) => {
    console.log(it);
  });
});
