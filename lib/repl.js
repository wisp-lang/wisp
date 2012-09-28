var repl = require("repl");

var vm = require("vm");

var transpile = require("./engine/node");

var evaluate = function evaluate(code, context, file, callback) {
  return (function() {
  try {
    return callback(null, vm.runInThisContext(transpile(code.substring(1, (code.length) - 2), file), file));
  } catch (error) {
    return callback(error);
  }})();
};

var start = function start() {
  return repl.start({
    prompt: "=> ",
    ignoreUndefined: true,
    useGlobal: true,
    eval: evaluate
  });
};

module.exports = start
