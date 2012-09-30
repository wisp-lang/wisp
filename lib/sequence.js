var dec = (require("./runtime")).dec;
var isVector = (require("./runtime")).isVector;;

var reverse = (require("./list")).reverse;
var cons = (require("./list")).cons;
var list = (require("./list")).list;
var isEmpty = (require("./list")).isEmpty;;

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

var map = function map(f, sequence) {
  return isVector(sequence) ?
    mapVector(f, sequence) :
    mapList(f, sequence);
};

var mapVector = function mapVector(f, sequence) {
  return sequence.map(f);
};

var mapList = function mapList(f, sequence) {
  return (function loop(result, items) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(items) ?
      reverse(result) :
      (result = cons(f(first(items), result), rest(items)), items = void(0), loop);
    };
    return recur;
  })(list(), sequence);
};

var filter = function filter(isF, sequence) {
  return isVector(sequence) ?
    filterVector(isF, sequence) :
    filterList(isF, sequence);
};

var filterVector = function filterVector(isF, vector) {
  return vector.filter(isF);
};

var filterList = function filterList(isF, list) {
  return (function loop(result, items) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(items) ?
      reverse(result) :
      (result = isF(first(items)) ?
        cons(first(items), result) :
        result, items = rest(items), loop);
    };
    return recur;
  })(list(), list);
};

var take = function take(n, sequence) {
  return isVector(sequence) ?
    takeVector(n, sequence) :
    takeList(n, sequence);
};

var takeVector = function takeVector(n, vector) {
  return vector.slice(0, n);
};

var takeList = function takeList(n, list) {
  return (function loop(taken, items, n) {
    var recur = loop;
    while (recur === loop) {
      recur = (n == 0) || (isEmpty(items)) ?
      reverse(taken) :
      (taken = cons(first(items), taken), items = rest(items), n = dec(n), loop);
    };
    return recur;
  })(list(), list, n);
};

var reduce = function reduce(f, initial, sequence) {
  return isNil(sequence) ?
    reduce(f, void(0), sequence) :
  isVector(sequence) ?
    reduceVector(f, initial, sequence) :
    reduceList(f, initial, sequence);
};

var reduceVector = function reduceVector(f, initial, sequence) {
  return isNil(initial) ?
    sequence.reduce(f) :
    sequence.reduce(f, initial);
};

var reduceList = function reduceList(f, initial, sequence) {
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

exports.rest = rest;
exports.third = third;
exports.second = second;
exports.first = first;
exports.count = count;
exports.isEmpty = isEmpty;
exports.reverse = reverse;
exports.take = take;
exports.reduce = reduce;
exports.filter = filter;
exports.map = map;
