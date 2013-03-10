var vec = (require("./sequence")).vec;
var map = (require("./sequence")).map;
var last = (require("./sequence")).last;
var count = (require("./sequence")).count;
var second = (require("./sequence")).second;
var first = (require("./sequence")).first;
var isSequential = (require("./sequence")).isSequential;
var isList = (require("./sequence")).isList;;

var join = (require("./string")).join;
var split = (require("./string")).split;;

var isEqual = (require("./runtime")).isEqual;
var subs = (require("./runtime")).subs;
var inc = (require("./runtime")).inc;
var str = (require("./runtime")).str;
var isDictionary = (require("./runtime")).isDictionary;
var isRePattern = (require("./runtime")).isRePattern;
var isDate = (require("./runtime")).isDate;
var isObject = (require("./runtime")).isObject;
var isBoolean = (require("./runtime")).isBoolean;
var isString = (require("./runtime")).isString;
var isNumber = (require("./runtime")).isNumber;
var isVector = (require("./runtime")).isVector;
var isNil = (require("./runtime")).isNil;;

var withMeta = function withMeta(value, metadata) {
  Object.defineProperty(value, "metadata", {
    "value": metadata,
    "configurable": true
  });
  return value;
};

var meta = function meta(value) {
  return isObject(value) ?
    value.metadata :
    void(0);
};

var __nsSeparator__ = "⁄";

var Symbol = function Symbol(namespace, name) {
  this.namespace = namespace;
  this.name = name;
  return this;
};

Symbol.type = "wisp.symbol";

Symbol.prototype.type = Symbol.type;

Symbol.prototype.toString = function() {
  var ns = namespace(this);
  return ns ?
    "" + ns + "/" + (name(this)) :
    "" + (name(this));
};

var symbol = function symbol(ns, id) {
  return isSymbol(ns) ?
    ns :
  isKeyword(ns) ?
    new Symbol(namespace(ns), name(ns)) :
  isNil(id) ?
    new Symbol(void(0), ns) :
  "else" ?
    new Symbol(ns, id) :
    void(0);
};

var isSymbol = function isSymbol(x) {
  return x && (Symbol.type === x.type);
};

var isKeyword = function isKeyword(x) {
  return (isString(x)) && (count(x) > 1) && (first(x) === "꞉");
};

var keyword = function keyword(ns, id) {
  return isKeyword(ns) ?
    ns :
  isSymbol(ns) ?
    "" + "꞉" + (name(ns)) :
  isNil(id) ?
    "" + "꞉" + ns :
  isNil(ns) ?
    "" + "꞉" + id :
  "else" ?
    "" + "꞉" + ns + __nsSeparator__ + id :
    void(0);
};

var keywordName = function keywordName(value) {
  return last(split(subs(value, 1), __nsSeparator__));
};

var name = function name(value) {
  return isSymbol(value) ?
    value.name :
  isKeyword(value) ?
    keywordName(value) :
  isString(value) ?
    value :
  "else" ?
    (function() { throw new TypeError("" + "Doesn't support name: " + value); })() :
    void(0);
};

var keywordNamespace = function keywordNamespace(x) {
  var parts = split(subs(x, 1), __nsSeparator__);
  return count(parts) > 1 ?
    parts[0] :
    void(0);
};

var namespace = function namespace(x) {
  return isSymbol(x) ?
    x.namespace :
  isKeyword(x) ?
    keywordNamespace(x) :
  "else" ?
    (function() { throw new TypeError("" + "Doesn't supports namespace: " + x); })() :
    void(0);
};

var gensym = function gensym(prefix) {
  return symbol("" + (isNil(prefix) ?
    "G__" :
    prefix) + (gensym.base = gensym.base + 1));
};

gensym.base = 0;

var isUnquote = function isUnquote(form) {
  return (isList(form)) && (isEqual(first(form), symbol(void(0), "unquote")));
};

var isUnquoteSplicing = function isUnquoteSplicing(form) {
  return (isList(form)) && (isEqual(first(form), symbol(void(0), "unquote-splicing")));
};

var isQuote = function isQuote(form) {
  return (isList(form)) && (isEqual(first(form), symbol(void(0), "quote")));
};

var isSyntaxQuote = function isSyntaxQuote(form) {
  return (isList(form)) && (isEqual(first(form), symbol(void(0), "syntax-quote")));
};

var normalize = function normalize(n, len) {
  return (function loop(ns) {
    var recur = loop;
    while (recur === loop) {
      recur = count(ns) < len ?
      (ns = "" + "0" + ns, loop) :
      ns;
    };
    return recur;
  })("" + n);
};

var quoteString = function quoteString(s) {
  s = join("\\\"", split(s, "\""));
  s = join("\\\\", split(s, "\\"));
  s = join("\\b", split(s, ""));
  s = join("\\f", split(s, ""));
  s = join("\\n", split(s, "\n"));
  s = join("\\r", split(s, "\r"));
  s = join("\\t", split(s, "\t"));
  return "" + "\"" + s + "\"";
};

var prStr = function prStr(x) {
  return isNil(x) ?
    "nil" :
  isKeyword(x) ?
    namespace(x) ?
      "" + ":" + (namespace(x)) + "/" + (name(x)) :
      "" + ":" + (name(x)) :
  isString(x) ?
    quoteString(x) :
  isDate(x) ?
    "" + "#inst \"" + (x.getUTCFullYear()) + "-" + (normalize(inc(x.getUTCMonth()), 2)) + "-" + (normalize(x.getUTCDate(), 2)) + "T" + (normalize(x.getUTCHours(), 2)) + ":" + (normalize(x.getUTCMinutes(), 2)) + ":" + (normalize(x.getUTCSeconds(), 2)) + "." + (normalize(x.getUTCMilliseconds(), 3)) + "-" + "00:00\"" :
  isVector(x) ?
    "" + "[" + (join(" ", map(prStr, vec(x)))) + "]" :
  isDictionary(x) ?
    "" + "{" + (join(", ", map(function(pair) {
      return "" + (prStr(first(pair))) + " " + (prStr(second(pair)));
    }, x))) + "}" :
  isSequential(x) ?
    "" + "(" + (join(" ", map(prStr, vec(x)))) + ")" :
  isRePattern(x) ?
    "" + "#\"" + (join("\\/", split(x.source, "/"))) + "\"" :
  "else" ?
    "" + x :
    void(0);
};

exports.isSyntaxQuote = isSyntaxQuote;
exports.isQuote = isQuote;
exports.isUnquoteSplicing = isUnquoteSplicing;
exports.isUnquote = isUnquote;
exports.namespace = namespace;
exports.name = name;
exports.gensym = gensym;
exports.keyword = keyword;
exports.isKeyword = isKeyword;
exports.symbol = symbol;
exports.isSymbol = isSymbol;
exports.prStr = prStr;
exports.withMeta = withMeta;
exports.meta = meta;
