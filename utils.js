const paths = require('node:path');
const fs = require('fs-extra');

function resolve_path(p) {
  if (p.indexOf('./') == 0) {
    let n = paths.join(__dirname, p);
    return paths.resolve(n);
  }
  else {
    return paths.resolve(p);
  }
}

function read_json(p) {
  let n = resolve_path(p);
  return fs.readJsonSync(n);
}

function parse_args(options) {
  const parseArgs = require('node:util').parseArgs;
  try {
    let opts = {};
    let pos = null;

    for (let k in options) {
      let v = options[k];
      if (v.type == 'positional') pos = k;
      else opts[k] = v;
    }

    opts.help = { type: 'boolean', short: 'h' };

    let args = parseArgs({options:opts, allowPositionals:(pos?true:false)});
    let rv = {values:args.values};

    if (args.values.help) {
      let help = '';
      for (let k in options) {
        let v = options[k];

        if (v.type == 'positional') help += ' <'+k+'>';
        else help += ` -${v.short}, --${k} <value>`;
      }

      console.log('Options: ' + help);
      process.exit(2);
    }

    if (pos) {
      if (args.positionals && args.positionals.length) {
        rv[pos] = args.positionals;
      }
      else {
        console.log('invalid argument <'+pos+'>');
        process.exit(1);
      }
    }
    return rv;
  }
  catch(ex) {
    console.log(ex.message);
    process.exit(1);
  }
}

function track_stats(file) {
  let q = global[file];
  if (q) return;

  q = {
    _items: {},
    start: function(item, msg) {
      this._items[item] = item;
    },
    end: function(item) {
      delete this._items[item];

      let txt = [];
      for (let k in this._items) {
        let v = this._items[k];
        txt.push(v);
      }

      fs.writeFileSync(file, txt.join('\n'));
    }
  };
  global[file] = q;
  return q;
}

module.exports = {
  track_stats: track_stats,
  parse_args: parse_args,
  read_json: read_json,
  resolve_path: resolve_path
};
