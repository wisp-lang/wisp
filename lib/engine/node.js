var fs = require("fs");

var rest = (require("../sequence")).rest;;

var str = (require("../runtime")).str;;

var readFromString = (require("../reader")).readFromString;;

var compileProgram = (require("../compiler")).compileProgram;;

global.__verbose__ = 0 <= process.argv.indexOf("--verbose");

var transpile = function transpile(source, uri) {
  return "" + (compileProgram(rest(readFromString("" + "(do " + source + ")", uri)))) + "\n";
};

require.extensions[".wisp"] = function(module, uri) {
  return module._compile(transpile(fs.readFileSync(uri, "utf8")), uri);
};

module.exports = transpile
