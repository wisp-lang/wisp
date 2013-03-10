var str = (require("../runtime")).str;;

var rest = (require("../sequence")).rest;;

var readFromString = (require("../reader")).readFromString;;

var compileProgram = (require("../compiler")).compileProgram;;

var transpile = function transpile(source, uri) {
  return "" + (compileProgram(rest(readFromString("" + "(do " + source + ")", uri)))) + "\n";
};

var evaluate = function evaluate(code, url) {
  return eval(transpile(code, url));
};

var run = function run(code, url) {
  return (Function(transpile(code, url)))();
};

var load = function load(url, callback) {
  var request = window.XMLHttpRequest ?
    new XMLHttpRequest() :
    new ActiveXObject("Microsoft.XMLHTTP");
  request.open("GET", url, true);
  request.overrideMimeType ?
    request.overrideMimeType("application/wisp") :
    void(0);
  request.onreadystatechange = function() {
    return request.readyState === 4 ?
      (request.status === 0) || (request.status === 200) ?
        callback(run(request.responseText, url)) :
        callback("Could not load") :
      void(0);
  };
  return request.send(null);
};

var runScripts = function runScripts() {
  var scripts = Array.prototype.filter.call(document.getElementsByTagName("script"), function(script) {
    return script.type === "application/wisp";
  });
  var next = function next() {
    return scripts.length ?
      (function() {
        var script = scripts.shift();
        return script.src ?
          load(script.src, next) :
          next(run(script.innerHTML));
      })() :
      void(0);
  };
  return next();
};

(document.readyState === "complete") || (document.readyState === "interactive") ?
  runScripts() :
window.addEventListener ?
  window.addEventListener("DOMContentLoaded", runScripts, false) :
  window.attachEvent("onload", runScripts);

exports.run = run;
exports.evaluate = evaluate;
exports.transpile = transpile;
