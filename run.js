#!/usr/bin/env node

var ls = require('./lib/ls');
var fs = require('fs');
try {
  var infile = process.argv[2];
  var outfile = process.argv[3];
  var code = fs.readFileSync(infile, 'ascii');
  var macros = fs.readFileSync("src/macros.ls", 'ascii');
  fs.writeFileSync(outfile, ls._compile(macros + "\n" + code), "ascii");
}
catch (err) {
      console.log(err);
}
