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
      recur = keyValues.length ?
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

var isFn = typeof(/./) === "function" ?
  function isFn(x) {
    return toString.call(x) === "[object Function]";
  } :
  function isFn(x) {
    return typeof(x) === "function";
  };

var isString = function isString(x) {
  return (typeof(x) === "string") || (toString.call(x) === "[object String]");
};

var isNumber = function isNumber(x) {
  return (typeof(x) === "number") || (toString.call(x) === "[object Number]");
};

var isVector = isFn(Array.isArray) ?
  Array.isArray :
  function isVector(x) {
    return toString.call(x) === "[object Array]";
  };

var isDate = function isDate(x) {
  return toString.call(x) === "[object Date]";
};

var isBoolean = function isBoolean(x) {
  return (x === true) || (x === false) || (toString.call(x) === "[object Boolean]");
};

var isRePattern = function isRePattern(x) {
  return toString.call(x) === "[object RegExp]";
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
  return !(isNil(matches)) ?
    matches.length === 1 ?
      matches[0] :
      matches :
    void(0);
};

var reMatches = function reMatches(pattern, source) {
  var matches = pattern.exec(source);
  return (!(isNil(matches))) && (matches[0] === source) ?
    matches.length === 1 ?
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

var char = function char(code) {
  return String.fromCharCode(code);
};

var int = function int(x) {
  return isNumber(x) ?
    x >= 0 ?
      Math.floor(x) :
      Math.floor(x) :
    x.charCodeAt(0);
};

var subs = function subs(string, start, end) {
  return string.substring(start, end);
};

var isPatternEqual = function isPatternEqual(x, y) {
  return (isRePattern(x)) && (isRePattern(y)) && (x.source === y.source) && (x.global === y.global) && (x.multiline === y.multiline) && (x.ignoreCase === y.ignoreCase);
};

var isDateEqual = function isDateEqual(x, y) {
  return (isDate(x)) && (isDate(y)) && (Number(x) === Number(y));
};

var isDictionaryEqual = function isDictionaryEqual(x, y) {
  return (isObject(x)) && (isObject(y)) && ((function() {
    var xKeys = keys(x);
    var yKeys = keys(y);
    var xCount = xKeys.length;
    var yCount = yKeys.length;
    return (xCount === yCount) && ((function loop(index, count, keys) {
      var recur = loop;
      while (recur === loop) {
        recur = index < count ?
        isEquivalent(x[keys[index]], y[keys[index]]) ?
          (index = inc(index), count = count, keys = keys, loop) :
          false :
        true;
      };
      return recur;
    })(0, xCount, xKeys));
  })());
};

var isVectorEqual = function isVectorEqual(x, y) {
  return (isVector(x)) && (isVector(y)) && (x.length === y.length) && ((function loop(xs, ys, index, count) {
    var recur = loop;
    while (recur === loop) {
      recur = index < count ?
      isEquivalent(xs[index], ys[index]) ?
        (xs = xs, ys = ys, index = inc(index), count = count, loop) :
        false :
      true;
    };
    return recur;
  })(x, y, 0, x.length));
};

var isEquivalent = function isEquivalent(x, y) {
  switch (arguments.length) {
    case 1:
      return true;
    case 2:
      return (x === y) || (isNil(x) ?
        isNil(y) :
      isNil(y) ?
        isNil(x) :
      isString(x) ?
        false :
      isNumber(x) ?
        false :
      isFn(x) ?
        false :
      isBoolean(x) ?
        false :
      isDate(x) ?
        isDateEqual(x, y) :
      isVector(x) ?
        isVectorEqual(x, y, [], []) :
      isRePattern(x) ?
        isPatternEqual(x, y) :
      "else" ?
        isDictionaryEqual(x, y) :
        void(0));
    
    default:
      var more = Array.prototype.slice.call(arguments, 2);
      return (function loop(previous, current, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = (isEquivalent(previous, current)) && (index < count ?
          (previous = current, current = more[index], index = inc(index), count = count, loop) :
          true);
        };
        return recur;
      })(x, y, 0, more.length);
  };
  return void(0);
};

var isEqual = isEquivalent;

var isStrictEqual = function isStrictEqual(x, y) {
  switch (arguments.length) {
    case 1:
      return true;
    case 2:
      return x === y;
    
    default:
      var more = Array.prototype.slice.call(arguments, 2);
      return (function loop(previous, current, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = (previous === current) && (index < count ?
          (previous = current, current = more[index], index = inc(index), count = count, loop) :
          true);
        };
        return recur;
      })(x, y, 0, more.length);
  };
  return void(0);
};

var greaterThan = function greaterThan(x, y) {
  switch (arguments.length) {
    case 1:
      return true;
    case 2:
      return x > y;
    
    default:
      var more = Array.prototype.slice.call(arguments, 2);
      return (function loop(previous, current, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = (previous > current) && (index < count ?
          (previous = current, current = more[index], index = inc(index), count = count, loop) :
          true);
        };
        return recur;
      })(x, y, 0, more.length);
  };
  return void(0);
};

var notLessThan = function notLessThan(x, y) {
  switch (arguments.length) {
    case 1:
      return true;
    case 2:
      return x >= y;
    
    default:
      var more = Array.prototype.slice.call(arguments, 2);
      return (function loop(previous, current, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = (previous >= current) && (index < count ?
          (previous = current, current = more[index], index = inc(index), count = count, loop) :
          true);
        };
        return recur;
      })(x, y, 0, more.length);
  };
  return void(0);
};

var lessThan = function lessThan(x, y) {
  switch (arguments.length) {
    case 1:
      return true;
    case 2:
      return x < y;
    
    default:
      var more = Array.prototype.slice.call(arguments, 2);
      return (function loop(previous, current, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = (previous < current) && (index < count ?
          (previous = current, current = more[index], index = inc(index), count = count, loop) :
          true);
        };
        return recur;
      })(x, y, 0, more.length);
  };
  return void(0);
};

var notGreaterThan = function notGreaterThan(x, y) {
  switch (arguments.length) {
    case 1:
      return true;
    case 2:
      return x <= y;
    
    default:
      var more = Array.prototype.slice.call(arguments, 2);
      return (function loop(previous, current, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = (previous <= current) && (index < count ?
          (previous = current, current = more[index], index = inc(index), count = count, loop) :
          true);
        };
        return recur;
      })(x, y, 0, more.length);
  };
  return void(0);
};

var sum = function sum(a, b, c, d, e, f) {
  switch (arguments.length) {
    case 0:
      return 0;
    case 1:
      return a;
    case 2:
      return a + b;
    case 3:
      return a + b + c;
    case 4:
      return a + b + c + d;
    case 5:
      return a + b + c + d + e;
    case 6:
      return a + b + c + d + e + f;
    
    default:
      var more = Array.prototype.slice.call(arguments, 6);
      return (function loop(value, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = index < count ?
          (value = value + (more[index]), index = inc(index), count = count, loop) :
          value;
        };
        return recur;
      })(a + b + c + d + e + f, 0, more.length);
  };
  return void(0);
};

var subtract = function subtract(a, b, c, d, e, f) {
  switch (arguments.length) {
    case 0:
      return (function() { throw TypeError("Wrong number of args passed to: -"); })();
    case 1:
      return 0 - a;
    case 2:
      return a - b;
    case 3:
      return a - b - c;
    case 4:
      return a - b - c - d;
    case 5:
      return a - b - c - d - e;
    case 6:
      return a - b - c - d - e - f;
    
    default:
      var more = Array.prototype.slice.call(arguments, 6);
      return (function loop(value, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = index < count ?
          (value = value - (more[index]), index = inc(index), count = count, loop) :
          value;
        };
        return recur;
      })(a - b - c - d - e - f, 0, more.length);
  };
  return void(0);
};

var divide = function divide(a, b, c, d, e, f) {
  switch (arguments.length) {
    case 0:
      return (function() { throw TypeError("Wrong number of args passed to: /"); })();
    case 1:
      return 1 / a;
    case 2:
      return a / b;
    case 3:
      return a / b / c;
    case 4:
      return a / b / c / d;
    case 5:
      return a / b / c / d / e;
    case 6:
      return a / b / c / d / e / f;
    
    default:
      var more = Array.prototype.slice.call(arguments, 6);
      return (function loop(value, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = index < count ?
          (value = value / (more[index]), index = inc(index), count = count, loop) :
          value;
        };
        return recur;
      })(a / b / c / d / e / f, 0, more.length);
  };
  return void(0);
};

var multiply = function multiply(a, b, c, d, e, f) {
  switch (arguments.length) {
    case 0:
      return 1;
    case 1:
      return a;
    case 2:
      return a * b;
    case 3:
      return a * b * c;
    case 4:
      return a * b * c * d;
    case 5:
      return a * b * c * d * e;
    case 6:
      return a * b * c * d * e * f;
    
    default:
      var more = Array.prototype.slice.call(arguments, 6);
      return (function loop(value, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = index < count ?
          (value = value * (more[index]), index = inc(index), count = count, loop) :
          value;
        };
        return recur;
      })(a * b * c * d * e * f, 0, more.length);
  };
  return void(0);
};

var and = function and(a, b, c, d, e, f) {
  switch (arguments.length) {
    case 0:
      return true;
    case 1:
      return a;
    case 2:
      return a && b;
    case 3:
      return a && b && c;
    case 4:
      return a && b && c && d;
    case 5:
      return a && b && c && d && e;
    case 6:
      return a && b && c && d && e && f;
    
    default:
      var more = Array.prototype.slice.call(arguments, 6);
      return (function loop(value, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = index < count ?
          (value = value && (more[index]), index = inc(index), count = count, loop) :
          value;
        };
        return recur;
      })(a && b && c && d && e && f, 0, more.length);
  };
  return void(0);
};

var or = function or(a, b, c, d, e, f) {
  switch (arguments.length) {
    case 0:
      return void(0);
    case 1:
      return a;
    case 2:
      return a || b;
    case 3:
      return a || b || c;
    case 4:
      return a || b || c || d;
    case 5:
      return a || b || c || d || e;
    case 6:
      return a || b || c || d || e || f;
    
    default:
      var more = Array.prototype.slice.call(arguments, 6);
      return (function loop(value, index, count) {
        var recur = loop;
        while (recur === loop) {
          recur = index < count ?
          (value = value || (more[index]), index = inc(index), count = count, loop) :
          value;
        };
        return recur;
      })(a || b || c || d || e || f, 0, more.length);
  };
  return void(0);
};

exports.divide = divide;
exports.multiply = multiply;
exports.subtract = subtract;
exports.sum = sum;
exports.notGreaterThan = notGreaterThan;
exports.notLessThan = notLessThan;
exports.lessThan = lessThan;
exports.greaterThan = greaterThan;
exports.isStrictEqual = isStrictEqual;
exports.isEqual = isEqual;
exports.or = or;
exports.and = and;
exports.int = int;
exports.subs = subs;
exports.keyValues = keyValues;
exports.char = char;
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
exports.isDate = isDate;
exports.isFn = isFn;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isVector = isVector;
exports.isEven = isEven;
exports.isOdd = isOdd;
exports.merge = merge;
exports.dictionary = dictionary;
exports.isDictionary = isDictionary;
