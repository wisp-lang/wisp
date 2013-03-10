var repl = require("repl");

var vm = require("vm");

var transpile = require("./engine/node");

var pushBackReader = (require("./reader")).pushBackReader;
var read = (require("./reader")).read;;

var isEqual = (require("./runtime")).isEqual;
var subs = (require("./runtime")).subs;;

var list = (require("./sequence")).list;
var count = (require("./sequence")).count;;

var compileProgram = (require("./compiler")).compileProgram;
var compile = (require("./compiler")).compile;;

var prStr = (require("./ast")).prStr;;

var evaluateCode = function evaluateCode(code, uri, context) {
  context._debug_ ?
    console.log("INPUT:", prStr(code)) :
    void(0);
  return (function() {
    var reader = pushBackReader(code, uri);
    return (function loop(lastOutput) {
      var recur = loop;
      while (recur === loop) {
        recur = (function() {
        var output = evaluateNextForm(reader, context);
        var error = (output || 0)["error"];
        return !((output || 0)["finished"]) ?
          error ?
            (function() {
              context._e = error;
              return output;
            })() :
            (lastOutput = output, loop) :
          (function() {
            context._3 = context._2;
            context.__3 = context.__2;
            context._2 = context._1;
            context.__2 = context.__1;
            context._1 = (lastOutput || 0)["value"];
            context.__1 = (lastOutput || 0)["form"];
            return lastOutput;
          })();
      })();
      };
      return recur;
    })({
      "finished": true
    });
  })();
};

var evaluateNextForm = function evaluateNextForm(reader, context) {
  return (function() {
  try {
    return (function() {
      var uri = reader.uri;
      var form = read(reader, false, "finished-reading");
      return isEqual(form, "finished-reading") ?
        {
          "finished": true
        } :
        (function() {
          var _ = context._debug_ ?
            console.log("READ:", prStr(form)) :
            void(0);
          var body = form;
          var code = compileProgram(list(body));
          var _ = context._debug_ ?
            console.log("EMITTED:", prStr(code)) :
            void(0);
          var value = vm.runInContext(code, context, uri);
          return {
            "value": value,
            "js": code,
            "form": form
          };
        })();
    })();
  } catch (error) {
    return {
      "error": error
    };
  }})();
};

var evaluate = (function() {
  var input = void(0);
  var output = void(0);
  return function evaluate(code, context, file, callback) {
    return !(input === code) ?
      (function() {
        input = subs(code, 1, (count(code)) - 1);
        output = evaluateCode(input, file, context);
        return callback((output || 0)["error"], (output || 0)["value"]);
      })() :
      callback((output || 0)["error"]);
  };
})();

var start = function start() {
  var session = repl.start({
    "writer": prStr,
    "prompt": "=> ",
    "ignoreUndefined": true,
    "useGlobal": false,
    "eval": evaluate
  });
  var context = session.context;
  context.exports = {};
  return session;
};

module.exports = start
