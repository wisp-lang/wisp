var isString = (require("./runtime")).isString;
var isNil = (require("./runtime")).isNil;
var reMatches = (require("./runtime")).reMatches;
var subs = (require("./runtime")).subs;
var str = (require("./runtime")).str;;

var isEmpty = (require("./sequence")).isEmpty;
var vec = (require("./sequence")).vec;;

var split = function split(string, pattern, limit) {
  return string.split(pattern, limit);
};

var join = function join(separator, coll) {
  switch (arguments.length) {
    case 1:
      var coll = separator;
      return str.apply(str, vec(coll));
    case 2:
      return vec(coll).join(separator);
    
    default:
      (function() { throw Error("Invalid arity"); })()
  };
  return void(0);
};

var upperCase = function upperCase(string) {
  return string.toUpperCase();
};

var upperCase = function upperCase(string) {
  return string.toUpperCase();
};

var lowerCase = function lowerCase(string) {
  return string.toLowerCase();
};

var capitalize = function capitalize(string) {
  return count(string) < 2 ?
    upperCase(string) :
    "" + (upperCase(subs(s, 0, 1))) + (lowerCase(subs(s, 1)));
};

var replace = function replace(string, match, replacement) {
  return string.replace(match, replacement);
};

var __LEFTSPACES__ = /^\s\s*/;

var __RIGHTSPACES__ = /\s\s*$/;

var __SPACES__ = /^\s\s*$/;

var triml = isNil("".trimLeft) ?
  function(string) {
    return string.replace(__LEFTSPACES__, "");
  } :
  function triml(string) {
    return string.trimLeft();
  };

var trimr = isNil("".trimRight) ?
  function(string) {
    return string.replace(__RIGHTSPACES__, "");
  } :
  function trimr(string) {
    return string.trimRight();
  };

var trim = isNil("".trim) ?
  function(string) {
    return string.replace(__LEFTSPACES__).replace(__RIGHTSPACES__);
  } :
  function trim(string) {
    return string.trim();
  };

var isBlank = function isBlank(string) {
  return (isNil(string)) || (isEmpty(string)) || (reMatches(__SPACES__, string));
};

exports.isBlank = isBlank;
exports.trimr = trimr;
exports.triml = triml;
exports.trim = trim;
exports.replace = replace;
exports.capitalize = capitalize;
exports.upperCase = upperCase;
exports.lowerCase = lowerCase;
exports.join = join;
exports.split = split;
