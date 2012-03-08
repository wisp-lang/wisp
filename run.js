#!/usr/bin/env node

var ls = require('./lib/ls');
var fs = require('fs');
try {
  var infile = process.argv[2];
  var outfile = process.argv[3];
  var code = fs.readFileSync(infile, 'ascii');
  var macros = fs.readFileSync("src/macros.ls", 'ascii');
  ls._compile(macros);
  fs.writeFileSync(outfile, ls._compile(code), "ascii");
}
catch (err) {
      console.log(err);
}
