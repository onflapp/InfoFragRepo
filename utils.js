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

module.exports = {
  read_json:read_json,
  resolve_path:resolve_path
};
