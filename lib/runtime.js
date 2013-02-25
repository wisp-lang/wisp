var isOdd = function isOdd(n) {
  return n % 2 === 1;
};

var isEven = function isEven(n) {
  return n % 2 === 0;
};

var isDictionary = function isDictionary(form) {
  return (isObject(form)) && (isObject(Object.getPrototypeOf(form))) && (isNil(Object.getPrototypeOf(Object.getPrototypeOf(form))));
};

var dictionary = function dictionary() {
  return (function loop(keyValues, result) {
    var recur = loop;
    while (recur === loop) {
      recur = (keyValues.length) ?
      (function() {
        result[keyValues[0]] = keyValues[1];
        return (keyValues = keyValues.slice(2), result = result, loop);
      })() :
      result;
    };
    return recur;
  })(Array.prototype.slice.call(arguments), {});
};

var keys = function keys(dictionary) {
  return Object.keys(dictionary);
};

var vals = function vals(dictionary) {
  return keys(dictionary).map(function(key) {
    return dictionary[key];
  });
};

var keyValues = function keyValues(dictionary) {
  return keys(dictionary).map(function(key) {
    return [key, dictionary[key]];
  });
};

var merge = function merge() {
  return Object.create(Object.prototype, Array.prototype.slice.call(arguments).reduce(function(descriptor, dictionary) {
    isObject(dictionary) ?
      Object.keys(dictionary).forEach(function(key) {
        return descriptor[key] = Object.getOwnPropertyDescriptor(dictionary, key);
      }) :
      void(0);
    return descriptor;
  }, Object.create(Object.prototype)));
};

var isContainsVector = function isContainsVector(vector, element) {
  return vector.indexOf(element) >= 0;
};

var mapDictionary = function mapDictionary(source, f) {
  return Object.keys(source).reduce(function(target, key) {
    target[key] = f(source[key]);
    return target;
  }, {});
};

var toString = Object.prototype.toString;

var isString = function isString(x) {
  return toString.call(x) === "[object String]";
};

var isNumber = function isNumber(x) {
  return toString.call(x) === "[object Number]";
};

var isVector = function isVector(x) {
  return toString.call(x) === "[object Array]";
};

var isBoolean = function isBoolean(x) {
  return toString.call(x) === "[object Boolean]";
};

var isRePattern = function isRePattern(x) {
  return toString.call(x) === "[object RegExp]";
};

var isFn = function isFn(x) {
  return typeof(x) === "function";
};

var isObject = function isObject(x) {
  return x && (typeof(x) === "object");
};

var isNil = function isNil(x) {
  return (x === void(0)) || (x === null);
};

var isTrue = function isTrue(x) {
  return x === true;
};

var isFalse = function isFalse(x) {
  return x === true;
};

var reFind = function reFind(re, s) {
  var matches = re.exec(s);
  return (!(isNil(matches))) ?
    (matches.length == 1) ?
      matches[0] :
      matches :
    void(0);
};

var reMatches = function reMatches(pattern, source) {
  var matches = pattern.exec(source);
  return ((!(isNil(matches))) && (matches[0] === source)) ?
    (matches.length == 1) ?
      matches[0] :
      matches :
    void(0);
};

var rePattern = function rePattern(s) {
  var match = reFind(/^(?:\(\?([idmsux]*)\))?(.*)/, s);
  return new RegExp(match[2], match[1]);
};

var inc = function inc(x) {
  return x + 1;
};

var dec = function dec(x) {
  return x - 1;
};

var str = function str() {
  return String.prototype.concat.apply("", arguments);
};

exports.keyValues = keyValues;
exports.str = str;
exports.dec = dec;
exports.inc = inc;
exports.isRePattern = isRePattern;
exports.reMatches = reMatches;
exports.reFind = reFind;
exports.rePattern = rePattern;
exports.vals = vals;
exports.keys = keys;
exports.isContainsVector = isContainsVector;
exports.mapDictionary = mapDictionary;
exports.isFalse = isFalse;
exports.isTrue = isTrue;
exports.isBoolean = isBoolean;
exports.isNil = isNil;
exports.isObject = isObject;
exports.isFn = isFn;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isVector = isVector;
exports.isEven = isEven;
exports.isOdd = isOdd;
exports.merge = merge;
exports.dictionary = dictionary;
exports.isDictionary = isDictionary;
