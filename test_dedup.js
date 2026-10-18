const sh = require('shelljs');
const tools = require('./TextTools');

const text = sh.cat(process.argv[2]).stdout;
const reject = [
  /^\*\*Cc:/,
  /^\*\*Join:/,
  /^\*\*When:/,
  /^\*\*Where:/,
  /^\*\*ATTENTION:/,
  /^\*\*EXTERNAL:/,
  /^\*\*Microsoft\ Teams meeting\*\*/,
  /^Meeting\ ID:/,
  /^Passcode:/,
  /^Tenant\ key:/,
  /^\*\*Dial\ in\ by\ phone\*\*/,
  /^Phone\ conference\ ID:/,
  /^\*\*Join\ on\ a\ video\ conferencing\ device\*\*/,
  /^Video\ ID:/,
  /^NOTE:\ This\ meeting\ could\ be\ recorded,/,
  /^\[Need\ help\?\]/,
  /^\[Find\ a\ local\ number\]/,
  /^\[More\ info\]/,
  /^Thanks,/,
  /^Thanks a lot,/,
  /^Thank\ you,/
];
const rv = tools.deduplicate_text(text, [/^\*\*From:\*\*/], reject);
console.log(rv);
