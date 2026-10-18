const sh = require('shelljs');

// test_apple.js "prompt" ./test.txt
let out = sh.cat(process.argv[3]).cmd('swift', './apple-ai.swift', process.argv[2]).stdout;
console.log(out);
