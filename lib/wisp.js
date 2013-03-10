var fs = require("fs");

var path = require("path");

var Module = (require("module")).Module;;

var repl = require("./repl");

var str = (require("./runtime")).str;;

var transpile = require("./engine/node");

var compileProgram = (require("./compiler")).compileProgram;;

var readFromString = (require("./reader")).readFromString;;

var exit = function exit(error) {
  return error ?
    (function() {
      console.error(error);
      return process.exit(1);
    })() :
    process.exit(0);
};

var compile = function compile(input, output, uri) {
  var source = "";
  input.on("data", function onChunck(chunck) {
    return source = "" + source + chunck;
  });
  input.on("end", function onRead() {
    return (function() {
    try {
      return output.write(transpile(source));
    } catch (error) {
      return exit(error);
    }})();
  });
  input.on("error", exit);
  return output.on("error", exit);
};

var main = function main() {
  return process.argv.length < 3 ?
    (function() {
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      compile(process.stdin, process.stdout, process.cwd());
      return setTimeout(function() {
        return process.stdin.bytesRead === 0 ?
          (function() {
            process.stdin.removeAllListeners("data");
            return repl();
          })() :
          void(0);
      }, 20);
    })() :
    Module._load(path.resolve(process.argv[2]), null, true);
};

module.exports = main
