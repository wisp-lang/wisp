var fs = require("fs");

var rest = (require("../list")).rest;;

var readFromString = (require("../reader")).readFromString;;

var compileProgram = (require("../compiler")).compileProgram;;

var transpile = function transpile(source, uri) {
  return (compileProgram(rest(readFromString("(do " + source + ")", uri)))) + "\n";
};

require.extensions[".ls"] = function(module, uri) {
  return module._compile(transpile(fs.readFileSync(uri, "utf8")), uri);
};

module.exports = transpile
