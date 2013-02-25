var count = (require("./sequence")).count;
var first = (require("./sequence")).first;
var isList = (require("./sequence")).isList;;

var str = (require("./runtime")).str;
var isObject = (require("./runtime")).isObject;
var isBoolean = (require("./runtime")).isBoolean;
var isString = (require("./runtime")).isString;
var isNumber = (require("./runtime")).isNumber;
var isVector = (require("./runtime")).isVector;
var isNil = (require("./runtime")).isNil;;

var withMeta = function withMeta(value, metadata) {
  value.metadata = metadata;
  return value;
};

var meta = function meta(value) {
  return isObject(value) ?
    value.metadata :
    void(0);
};

var symbol = function symbol(ns, id) {
  return isSymbol(ns) ?
    ns :
  isKeyword(ns) ?
    "﻿".concat(name(ns)) :
  "else" ?
    isNil(id) ?
      "﻿".concat(ns) :
      "﻿".concat(ns, "/", id) :
    void(0);
};

var isSymbol = function isSymbol(x) {
  return (isString(x)) && (count(x) > 1) && (x.charAt(0) === "﻿");
};

var isKeyword = function isKeyword(x) {
  return (isString(x)) && (count(x) > 1) && (x.charAt(0) === "꞉");
};

var keyword = function keyword(ns, id) {
  return isKeyword(ns) ?
    ns :
  isSymbol(ns) ?
    "꞉".concat(name(ns)) :
  "else" ?
    isNil(id) ?
      "꞉".concat(ns) :
      "꞉".concat(ns, "/", id) :
    void(0);
};

var name = function name(value) {
  return (isKeyword(value)) || (isSymbol(value)) ?
    (value.length > 2) && (value.indexOf("/") >= 0) ?
      value.substr((value.indexOf("/")) + 1) :
      value.substr(1) :
  isString(value) ?
    value :
    void(0);
};

var gensym = function gensym(prefix) {
  return symbol(str(isNil(prefix) ?
    "G__" :
    prefix, gensym.base = gensym.base + 1));
};

gensym.base = 0;

var isUnquote = function isUnquote(form) {
  return (isList(form)) && (first(form) === "﻿unquote");
};

var isUnquoteSplicing = function isUnquoteSplicing(form) {
  return (isList(form)) && (first(form) === "﻿unquote-splicing");
};

var isQuote = function isQuote(form) {
  return (isList(form)) && (first(form) === "﻿quote");
};

var isSyntaxQuote = function isSyntaxQuote(form) {
  return (isList(form)) && (first(form) === "﻿syntax-quote");
};

exports.isSyntaxQuote = isSyntaxQuote;
exports.isQuote = isQuote;
exports.isUnquoteSplicing = isUnquoteSplicing;
exports.isUnquote = isUnquote;
exports.name = name;
exports.gensym = gensym;
exports.keyword = keyword;
exports.isKeyword = isKeyword;
exports.symbol = symbol;
exports.isSymbol = isSymbol;
exports.withMeta = withMeta;
exports.meta = meta;
