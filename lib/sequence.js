var merge = (require("./runtime")).merge;
var inc = (require("./runtime")).inc;
var dec = (require("./runtime")).dec;
var str = (require("./runtime")).str;
var keyValues = (require("./runtime")).keyValues;
var isDictionary = (require("./runtime")).isDictionary;
var isString = (require("./runtime")).isString;
var isNumber = (require("./runtime")).isNumber;
var isFn = (require("./runtime")).isFn;
var isVector = (require("./runtime")).isVector;
var isNil = (require("./runtime")).isNil;;

var List = function List(head, tail) {
  this.head = head;
  this.tail = tail || (list());
  this.length = inc(count(this.tail));
  return this;
};

List.prototype.length = 0;

List.type = "wisp.list";

List.prototype.type = List.type;

List.prototype.tail = Object.create(List.prototype);

List.prototype.toString = function() {
  return (function loop(result, list) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(list) ?
      "" + "(" + (result.substr(1)) + ")" :
      (result = "" + result + " " + (isVector(first(list)) ?
        "" + "[" + (first(list).join(" ")) + "]" :
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

var lazySeqValue = function lazySeqValue(lazySeq) {
  return !(lazySeq.realized) ?
    (lazySeq.realized = true) && (lazySeq.x = lazySeq.x()) :
    lazySeq.x;
};

var LazySeq = function LazySeq(realized, x) {
  this.realized = realized || false;
  this.x = x;
  return this;
};

LazySeq.type = "wisp.lazy.seq";

LazySeq.prototype.type = LazySeq.type;

var lazySeq = function lazySeq(realized, body) {
  return new LazySeq(realized, body);
};

var isLazySeq = function isLazySeq(value) {
  return value && (LazySeq.type === value.type);
};

;

var isList = function isList(value) {
  return value && (List.type === value.type);
};

var list = function list() {
  return arguments.length === 0 ?
    Object.create(List.prototype) :
    Array.prototype.slice.call(arguments).reduceRight(function(tail, head) {
      return cons(head, tail);
    }, list());
};

var cons = function cons(head, tail) {
  return new List(head, tail);
};

var reverseList = function reverseList(sequence) {
  return (function loop(items, source) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(source) ?
      list.apply(list, items) :
      (items = [first(source)].concat(items), source = rest(source), loop);
    };
    return recur;
  })([], sequence);
};

var isSequential = function isSequential(x) {
  return (isList(x)) || (isVector(x)) || (isLazySeq(x)) || (isDictionary(x)) || (isString(x));
};

var reverse = function reverse(sequence) {
  return isList(sequence) ?
    reverseList(sequence) :
  isVector(sequence) ?
    sequence.reverse() :
  isNil(sequence) ?
    list() :
  "else" ?
    reverse(seq(sequence)) :
    void(0);
};

var map = function map(f, sequence) {
  return isVector(sequence) ?
    sequence.map(f) :
  isList(sequence) ?
    mapList(f, sequence) :
  isNil(sequence) ?
    list() :
  "else" ?
    map(f, seq(sequence)) :
    void(0);
};

var mapList = function mapList(f, sequence) {
  return (function loop(result, items) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(items) ?
      reverse(result) :
      (result = cons(f(first(items)), result), items = rest(items), loop);
    };
    return recur;
  })(list(), sequence);
};

var filter = function filter(isF, sequence) {
  return isVector(sequence) ?
    sequence.filter(isF) :
  isList(sequence) ?
    filterList(isF, sequence) :
  isNil(sequence) ?
    list() :
  "else" ?
    filter(isF, seq(sequence)) :
    void(0);
};

var filterList = function filterList(isF, sequence) {
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
  })(list(), sequence);
};

var reduce = function reduce(f) {
  var params = Array.prototype.slice.call(arguments, 1);
  return (function() {
    var hasInitial = count(params) >= 2;
    var initial = hasInitial ?
      first(params) :
      void(0);
    var sequence = hasInitial ?
      second(params) :
      first(params);
    return isNil(sequence) ?
      initial :
    isVector(sequence) ?
      hasInitial ?
        sequence.reduce(f, initial) :
        sequence.reduce(f) :
    isList(sequence) ?
      hasInitial ?
        reduceList(f, initial, sequence) :
        reduceList(f, first(sequence), rest(sequence)) :
    "else" ?
      reduce(f, initial, seq(sequence)) :
      void(0);
  })();
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
  })(initial, sequence);
};

var count = function count(sequence) {
  return isNil(sequence) ?
    0 :
    (seq(sequence)).length;
};

var isEmpty = function isEmpty(sequence) {
  return count(sequence) === 0;
};

var first = function first(sequence) {
  return isNil(sequence) ?
    void(0) :
  isList(sequence) ?
    sequence.head :
  (isVector(sequence)) || (isString(sequence)) ?
    sequence[0] :
  isLazySeq(sequence) ?
    first(lazySeqValue(sequence)) :
  "else" ?
    first(seq(sequence)) :
    void(0);
};

var second = function second(sequence) {
  return isNil(sequence) ?
    void(0) :
  isList(sequence) ?
    first(rest(sequence)) :
  (isVector(sequence)) || (isString(sequence)) ?
    sequence[1] :
  isLazySeq(sequence) ?
    second(lazySeqValue(sequence)) :
  "else" ?
    first(rest(seq(sequence))) :
    void(0);
};

var third = function third(sequence) {
  return isNil(sequence) ?
    void(0) :
  isList(sequence) ?
    first(rest(rest(sequence))) :
  (isVector(sequence)) || (isString(sequence)) ?
    sequence[2] :
  isLazySeq(sequence) ?
    third(lazySeqValue(sequence)) :
  "else" ?
    second(rest(seq(sequence))) :
    void(0);
};

var rest = function rest(sequence) {
  return isNil(sequence) ?
    list() :
  isList(sequence) ?
    sequence.tail :
  (isVector(sequence)) || (isString(sequence)) ?
    sequence.slice(1) :
  isLazySeq(sequence) ?
    rest(lazySeqValue(sequence)) :
  "else" ?
    rest(seq(sequence)) :
    void(0);
};

var lastOfList = function lastOfList(list) {
  return (function loop(item, items) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(items) ?
      item :
      (item = first(items), items = rest(items), loop);
    };
    return recur;
  })(first(list), rest(list));
};

var last = function last(sequence) {
  return (isVector(sequence)) || (isString(sequence)) ?
    sequence[dec(count(sequence))] :
  isList(sequence) ?
    lastOfList(sequence) :
  isNil(sequence) ?
    void(0) :
  isLazySeq(sequence) ?
    last(lazySeqValue(sequence)) :
  "else" ?
    last(seq(sequence)) :
    void(0);
};

var butlast = function butlast(sequence) {
  var items = isNil(sequence) ?
    void(0) :
  isString(sequence) ?
    subs(sequence, 0, dec(count(sequence))) :
  isVector(sequence) ?
    sequence.slice(0, dec(count(sequence))) :
  isList(sequence) ?
    list.apply(list, butlast(vec(sequence))) :
  isLazySeq(sequence) ?
    butlast(lazySeqValue(sequence)) :
  "else" ?
    butlast(seq(sequence)) :
    void(0);
  return !((isNil(items)) || (isEmpty(items))) ?
    items :
    void(0);
};

var take = function take(n, sequence) {
  return isNil(sequence) ?
    list() :
  isVector(sequence) ?
    takeFromVector(n, sequence) :
  isList(sequence) ?
    takeFromList(n, sequence) :
  isLazySeq(sequence) ?
    take(n, lazySeqValue(sequence)) :
  "else" ?
    take(n, seq(sequence)) :
    void(0);
};

var takeFromVector = function takeFromVector(n, vector) {
  return vector.slice(0, n);
};

var takeFromList = function takeFromList(n, sequence) {
  return (function loop(taken, items, n) {
    var recur = loop;
    while (recur === loop) {
      recur = (n === 0) || (isEmpty(items)) ?
      reverse(taken) :
      (taken = cons(first(items), taken), items = rest(items), n = dec(n), loop);
    };
    return recur;
  })(list(), sequence, n);
};

var dropFromList = function dropFromList(n, sequence) {
  return (function loop(left, items) {
    var recur = loop;
    while (recur === loop) {
      recur = (left < 1) || (isEmpty(items)) ?
      items :
      (left = dec(left), items = rest(items), loop);
    };
    return recur;
  })(n, sequence);
};

var drop = function drop(n, sequence) {
  return n <= 0 ?
    sequence :
  isString(sequence) ?
    sequence.substr(n) :
  isVector(sequence) ?
    sequence.slice(n) :
  isList(sequence) ?
    dropFromList(n, sequence) :
  isNil(sequence) ?
    list() :
  isLazySeq(sequence) ?
    drop(n, lazySeqValue(sequence)) :
  "else" ?
    drop(n, seq(sequence)) :
    void(0);
};

var conjList = function conjList(sequence, items) {
  return reduce(function(result, item) {
    return cons(item, result);
  }, sequence, items);
};

var conj = function conj(sequence) {
  var items = Array.prototype.slice.call(arguments, 1);
  return isVector(sequence) ?
    sequence.concat(items) :
  isString(sequence) ?
    "" + sequence + (str.apply(str, items)) :
  isNil(sequence) ?
    list.apply(list, reverse(items)) :
  (isList(sequence)) || (isLazySeq()) ?
    conjList(sequence, items) :
  isDictionary(sequence) ?
    merge(sequence, merge.apply(merge, items)) :
  "else" ?
    (function() { throw TypeError("" + "Type can't be conjoined " + sequence); })() :
    void(0);
};

var concat = function concat() {
  var sequences = Array.prototype.slice.call(arguments, 0);
  return reverse(reduce(function(result, sequence) {
    return reduce(function(result, item) {
      return cons(item, result);
    }, result, seq(sequence));
  }, list(), sequences));
};

var seq = function seq(sequence) {
  return isNil(sequence) ?
    void(0) :
  (isVector(sequence)) || (isList(sequence)) || (isLazySeq(sequence)) ?
    sequence :
  isString(sequence) ?
    Array.prototype.slice.call(sequence) :
  isDictionary(sequence) ?
    keyValues(sequence) :
  "default" ?
    (function() { throw TypeError("" + "Can not seq " + sequence); })() :
    void(0);
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
  })([], source);
};

var vec = function vec(sequence) {
  return isNil(sequence) ?
    [] :
  isVector(sequence) ?
    sequence :
  isList(sequence) ?
    listToVector(sequence) :
  "else" ?
    vec(seq(sequence)) :
    void(0);
};

var sort = function sort(f, items) {
  var hasComparator = isFn(f);
  var items = (!(hasComparator)) && (isNil(items)) ?
    f :
    items;
  var compare = hasComparator ?
    function(a, b) {
      return f(a, b) ?
        0 :
        1;
    } :
    void(0);
  return isNil(items) ?
    list() :
  isVector(items) ?
    items.sort(compare) :
  isList(items) ?
    list.apply(list, vec(items).sort(compare)) :
  isDictionary(items) ?
    seq(items).sort(compare) :
  "else" ?
    sort(f, seq(items)) :
    void(0);
};

exports.reduce = reduce;
exports.filter = filter;
exports.map = map;
exports.sort = sort;
exports.reverse = reverse;
exports.concat = concat;
exports.drop = drop;
exports.take = take;
exports.butlast = butlast;
exports.last = last;
exports.rest = rest;
exports.third = third;
exports.second = second;
exports.first = first;
exports.count = count;
exports.isEmpty = isEmpty;
exports.lazySeq = lazySeq;
exports.isSequential = isSequential;
exports.vec = vec;
exports.seq = seq;
exports.isList = isList;
exports.list = list;
exports.conj = conj;
exports.cons = cons;
