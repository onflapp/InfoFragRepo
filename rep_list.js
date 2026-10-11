const SearchIndex = require('./SearchIndex');
const parseArgs = require('node:util').parseArgs;
const chrono = require('chrono-node');

const options = {
  group: { type: 'string', short: 'g' },
  start: { type: 'string', short: 's' },
  end: { type: 'string', short: 'e' }
};

try {
  args = parseArgs({options});
}
catch(ex) {
  console.log(ex.message);
  process.exit(1);
}

let path = './_records';
let index = new SearchIndex(path);
let filter = args.values;

if (filter.start) filter.start= chrono.parseDate(filter.start).getTime();
if (filter.end)   filter.end= chrono.parseDate(filter.end).getTime();

index.listAll(filter).then((rv) => {
  console.log(rv);
});
