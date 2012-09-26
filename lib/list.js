var str = (require("./runtime")).str;
var isString = (require("./runtime")).isString;
var isNumber = (require("./runtime")).isNumber;
var isVector = (require("./runtime")).isVector;
var isNil = (require("./runtime")).isNil;;

var List = function List(head, tail) {
  this.head = head;
  this.tail = tail;
  this.length = (tail.length) + 1;
  return this;
};

List.prototype.length = 0;

List.prototype.tail = Object.create(List.prototype);

List.prototype.toString = function() {
  return (function loop(result, list) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(list) ?
      str("(", result.substr(1), ")") :
      (result = str(result, " ", isVector(first(list)) ?
        str("[", first(list).join(" "), "]") :
      isNil(first(list)) ?
        "nil" :
      isString(first(list)) ?
        JSON.stringify(first(list)) :
      isNumber(first(list)) ?
        JSON.stringify(first(list)) :
        first(list)), list = rest(list), loop);
    };
    return recur;
  })("", this);
};

var isList = function isList(value) {
  return List.prototype.isPrototypeOf(value);
};

var count = function count(sequence) {
  return sequence.length;
};

var isEmpty = function isEmpty(sequence) {
  return count(sequence) == 0;
};

var first = function first(sequence) {
  return isList(sequence) ?
    sequence.head :
    sequence[0];
};

var second = function second(sequence) {
  return isList(sequence) ?
    first(rest(sequence)) :
    sequence[1];
};

var third = function third(sequence) {
  return isList(sequence) ?
    first(rest(rest(sequence))) :
    sequence[2];
};

var rest = function rest(sequence) {
  return isList(sequence) ?
    sequence.tail :
    sequence.slice(1);
};

var cons = function cons(head, tail) {
  return isList(tail) ?
    new List(head, tail) :
    Array(head).concat(tail);
};

var list = function list() {
  return arguments.length == 0 ?
    Object.create(List.prototype) :
    Array.prototype.slice.call(arguments).reduceRight(function(tail, head) {
      return cons(head, tail);
    }, list());
};

var reverse = function reverse(sequence) {
  return isList(sequence) ?
    (function loop(items, source) {
      var recur = loop;
      while (recur === loop) {
        recur = isEmpty(source) ?
        list.apply(list, items) :
        (items = [first(source)].concat(items), source = rest(source), loop);
      };
      return recur;
    })([], sequence) :
    sequence.reverse();
};

var mapList = function mapList(source, f) {
  return isEmpty(source) ?
    source :
    cons(f(first(source)), mapList(rest(source), f));
};

var reduceList = function reduceList(form, f, initial) {
  return (function loop(result, items) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(items) ?
      result :
      (result = f(result, first(items)), items = rest(items), loop);
    };
    return recur;
  })(isNil(initial) ?
    first(form) :
    initial, isNil(initial) ?
    rest(form) :
    form);
};

var concatList = function concatList(left, right) {
  return (function loop(result, prefix) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(prefix) ?
      result :
      (result = cons(first(prefix), result), prefix = rest(prefix), loop);
    };
    return recur;
  })(right, reverse(left));
};

var listToVector = function listToVector(source) {
  return (function loop(result, list) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(list) ?
      result :
      (result = (function() {
        result.push(first(list));
        return result;
      })(), list = rest(list), loop);
    };
    return recur;
  })(Array(), source);
};

var sortList = function sortList(items, f) {
  return list.apply(list, listToVector(items).sort(isNil(f) ?
    f :
    function(a, b) {
      return f(a, b) ?
        0 :
        1;
    }));
};

exports.sortList = sortList;
exports.concatList = concatList;
exports.listToVector = listToVector;
exports.mapList = mapList;
exports.reduceList = reduceList;
exports.reverse = reverse;
exports.list = list;
exports.cons = cons;
exports.rest = rest;
exports.third = third;
exports.second = second;
exports.first = first;
exports.isList = isList;
exports.count = count;
exports.isEmpty = isEmpty;
