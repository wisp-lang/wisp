(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    
    require.define = function (filename, fn) {
        if (require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};
});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process){var process = module.exports = {};

process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();
});

require.define("/lib/list.js",function(require,module,exports,__dirname,__filename,process){var str = (require("./runtime")).str;
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
    list.apply(list, [head].concat(tail));
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

var concatList = function concatList() {
  var sequences = Array.prototype.slice.call(arguments, 0);
  return reverse(sequences.reduce(function(result, sequence) {
    return reduceList(sequence, function(result, item) {
      return cons(item, result);
    }, result);
  }, list()));
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
});

require.define("/lib/runtime.js",function(require,module,exports,__dirname,__filename,process){var isOdd = function isOdd(n) {
  return n % 2 === 1;
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
  return (function() {
    var matches = re.exec(s);
    return !(isNil(matches)) ?
      matches.length == 1 ?
        first(matches) :
        matches :
      void(0);
  })();
};

var reMatches = function reMatches(pattern, source) {
  return (function() {
    var matches = pattern.exec(source);
    return (!(isNil(matches))) && (matches[0] === source) ?
      matches.length == 1 ?
        matches[0] :
        matches :
      void(0);
  })();
};

var rePattern = function rePattern(s) {
  return (function() {
    var match = reFind(/^(?:\(\?([idmsux]*)\))?(.*)/, s);
    return new RegExp(match[2], match[1]);
  })();
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
exports.isOdd = isOdd;
exports.merge = merge;
exports.dictionary = dictionary;
exports.isDictionary = isDictionary;
});

require.define("/lib/engine/browser.js",function(require,module,exports,__dirname,__filename,process){var str = (require("../runtime")).str;;

var rest = (require("../list")).rest;;

var readFromString = (require("../reader")).readFromString;;

var compileProgram = (require("../compiler")).compileProgram;;

var transpile = function transpile(source, uri) {
  return str(compileProgram(rest(readFromString(str("(do ", source, ")"), uri))), "\n");
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
    return request.readyState == 4 ?
      (request.status == 0) || (request.status == 200) ?
        callback(run(request.responseText, url)) :
        callback("Could not load") :
      void(0);
  };
  return request.send(null);
};

var runScripts = function runScripts() {
  var scripts = Array.prototype.filter.call(document.getElementsByTagName("script"), function(script) {
    return script.type == "application/wisp";
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

(document.readyState == "complete") || (document.readyState == "interactive") ?
  runScripts() :
window.addEventListener ?
  window.addEventListener("DOMContentLoaded", runScripts, false) :
  window.attachEvent("onload", runScripts);

exports.run = run;
exports.evaluate = evaluate;
exports.transpile = transpile;
});

require.define("/lib/reader.js",function(require,module,exports,__dirname,__filename,process){var rest = (require("./list")).rest;
var cons = (require("./list")).cons;
var rest = (require("./list")).rest;
var third = (require("./list")).third;
var second = (require("./list")).second;
var first = (require("./list")).first;
var isEmpty = (require("./list")).isEmpty;
var count = (require("./list")).count;
var isList = (require("./list")).isList;
var list = (require("./list")).list;;

var str = (require("./runtime")).str;
var reFind = (require("./runtime")).reFind;
var reMatches = (require("./runtime")).reMatches;
var rePattern = (require("./runtime")).rePattern;
var isObject = (require("./runtime")).isObject;
var isString = (require("./runtime")).isString;
var isVector = (require("./runtime")).isVector;
var dec = (require("./runtime")).dec;
var inc = (require("./runtime")).inc;
var isNil = (require("./runtime")).isNil;
var keys = (require("./runtime")).keys;
var merge = (require("./runtime")).merge;
var dictionary = (require("./runtime")).dictionary;
var isOdd = (require("./runtime")).isOdd;;

var name = (require("./ast")).name;
var withMeta = (require("./ast")).withMeta;
var meta = (require("./ast")).meta;
var keyword = (require("./ast")).keyword;
var isKeyword = (require("./ast")).isKeyword;
var symbol = (require("./ast")).symbol;
var isSymbol = (require("./ast")).isSymbol;;

var PushbackReader = function PushbackReader(source, uri, index, buffer) {
  this.source = source;
  this.uri = uri;
  this.indexAtom = index;
  this.bufferAtom = buffer;
  this.columnAtom = 1;
  this.lineAtom = 1;
  return this;
};

var pushBackReader = function pushBackReader(source, uri) {
  return new PushbackReader(source, uri, 0, "");
};

var line = function line(reader) {
  return reader.lineAtom;
};

var column = function column(reader) {
  return reader.columnAtom;
};

var nextChar = function nextChar(reader) {
  return isEmpty(reader.bufferAtom) ?
    reader.source[reader.indexAtom] :
    reader.bufferAtom[0];
};

var readChar = function readChar(reader) {
  nextChar(reader) === "\n" ?
    (function() {
      reader.lineAtom = (line(reader)) + 1;
      return reader.columnAtom = 1;
    })() :
    reader.columnAtom = (column(reader)) + 1;
  return isEmpty(reader.bufferAtom) ?
    (function() {
      var index = reader.indexAtom;
      reader.indexAtom = index + 1;
      return reader.source[index];
    })() :
    (function() {
      var buffer = reader.bufferAtom;
      reader.bufferAtom = buffer.substr(1);
      return buffer[0];
    })();
};

var unreadChar = function unreadChar(reader, ch) {
  return ch ?
    (function() {
      ch === "\n" ?
        reader.lineAtom = reader.lineAtom - 1 :
        reader.columnAtom = reader.columnAtom - 1;
      return reader.bufferAtom = str(ch, reader.bufferAtom);
    })() :
    void(0);
};

var isBreakingWhitespace = function isBreakingWhitespace(ch) {
  return "\t\n\r ".indexOf(ch) >= 0;
};

var isWhitespace = function isWhitespace(ch) {
  return (isBreakingWhitespace(ch)) || ("," === ch);
};

var isNumeric = function isNumeric(ch) {
  return "01234567890".indexOf(ch) >= 0;
};

var isCommentPrefix = function isCommentPrefix(ch) {
  return ";" === ch;
};

var isNumberLiteral = function isNumberLiteral(reader, initch) {
  return (isNumeric(initch)) || ((("+" === initch) || ("-" === initch)) && (isNumeric(nextChar(reader))));
};

var readerError = function readerError(reader, message) {
  return (function() {
    var error = SyntaxError(str(message, "\n", "line:", line(reader), "\n", "column:", column(reader)));
    error.line = line(reader);
    error.column = column(reader);
    error.uri = reader["uri"];
    return (function() { throw error; })();
  })();
};

var isMacroTerminating = function isMacroTerminating(ch) {
  return (!(ch === "#")) && (!(ch === "'")) && (!(ch === ":")) && (macros(ch));
};

var readToken = function readToken(reader, initch) {
  return (function loop(buffer, ch) {
    var recur = loop;
    while (recur === loop) {
      recur = (isNil(ch)) || (isWhitespace(ch)) || (isMacroTerminating(ch)) ?
      (function() {
        unreadChar(reader, ch);
        return buffer;
      })() :
      (buffer = buffer.concat(ch), ch = readChar(reader), loop);
    };
    return recur;
  })(initch, readChar(reader));
};

var skipLine = function skipLine(reader, _) {
  return (function loop() {
    var recur = loop;
    while (recur === loop) {
      recur = (function() {
      var ch = readChar(reader);
      return (ch === "\n") || (ch === "\r") || (isNil(ch)) ?
        reader :
        (loop);
    })();
    };
    return recur;
  })();
};

var intPattern = rePattern("([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?");

var ratioPattern = rePattern("([-+]?[0-9]+)/([0-9]+)");

var floatPattern = rePattern("([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?");

var symbolPattern = rePattern("[:]?([^0-9/].*/)?([^0-9/][^/]*)");

var matchInt = function matchInt(s) {
  return (function() {
    var groups = reFind(intPattern, s);
    var group3 = groups[2];
    return !((isNil(group3)) || (count(group3) < 1)) ?
      0 :
      (function() {
        var negate = "-" === groups[1] ?
          -1 :
          1;
        var a = groups[3] ?
          [groups[3], 10] :
        groups[4] ?
          [groups[4], 16] :
        groups[5] ?
          [groups[5], 8] :
        groups[7] ?
          [groups[7], parseInt(groups[7])] :
        "default" ?
          [void(0), void(0)] :
          void(0);
        var n = a[0];
        var radix = a[1];
        return isNil(n) ?
          void(0) :
          negate * (parseInt(n, radix));
      })();
  })();
};

var matchRatio = function matchRatio(s) {
  return (function() {
    var groups = reFind(ratioPattern, s);
    var numinator = groups[1];
    var denominator = groups[2];
    return (parseInt(numinator)) / (parseInt(denominator));
  })();
};

var matchFloat = function matchFloat(s) {
  return parseFloat(s);
};

var matchNumber = function matchNumber(s) {
  return reMatches(intPattern, s) ?
    matchInt(s) :
  reMatches(ratioPattern, s) ?
    matchRatio(s) :
  reMatches(floatPattern, s) ?
    matchFloat(s) :
    void(0);
};

var escapeCharMap = function escapeCharMap(c) {
  return c === "t" ?
    "\t" :
  c === "r" ?
    "\r" :
  c === "n" ?
    "\n" :
  c === "\\" ?
    "\\" :
  c === "\"" ?
    "\"" :
  c === "b" ?
    "" :
  c === "f" ?
    "" :
  "else" ?
    void(0) :
    void(0);
};

var read2Chars = function read2Chars(reader) {
  return str(readChar(reader), readChar(reader));
};

var read4Chars = function read4Chars(reader) {
  return str(readChar(reader), readChar(reader), readChar(reader), readChar(reader));
};

var unicode2Pattern = rePattern("[0-9A-Fa-f]{2}");

var unicode4Pattern = rePattern("[0-9A-Fa-f]{4}");

var validateUnicodeEscape = function validateUnicodeEscape(unicodePattern, reader, escapeChar, unicodeStr) {
  return reMatches(unicodePattern, unicodeStr) ?
    unicodeStr :
    readerError(reader, str("Unexpected unicode escape ", "\\", escapeChar, unicodeStr));
};

var makeUnicodeChar = function makeUnicodeChar(codeStr) {
  return (function() {
    var code = parseInt(codeStr, 16);
    return String.fromCharCode(code);
  })();
};

var escapeChar = function escapeChar(buffer, reader) {
  return (function() {
    var ch = readChar(reader);
    var mapresult = escapeCharMap(ch);
    return mapresult ?
      mapresult :
    ch === "x" ?
      makeUnicodeChar(validateUnicodeEscape(unicode2Pattern, reader, ch, read2Chars(reader))) :
    ch === "u" ?
      makeUnicodeChar(validateUnicodeEscape(unicode4Pattern, reader, ch, read4Chars(reader))) :
    isNumeric(ch) ?
      String.fromCharCode(ch) :
    "else" ?
      readerError(reader, str("Unexpected unicode escape ", "\\", ch)) :
      void(0);
  })();
};

var readPast = function readPast(predicate, reader) {
  return (function loop(ch) {
    var recur = loop;
    while (recur === loop) {
      recur = predicate(ch) ?
      (ch = readChar(reader), loop) :
      ch;
    };
    return recur;
  })(readChar(reader));
};

var readDelimitedList = function readDelimitedList(delim, reader, isRecursive) {
  return (function loop(a) {
    var recur = loop;
    while (recur === loop) {
      recur = (function() {
      var ch = readPast(isWhitespace, reader);
      !(ch) ?
        readerError(reader, "EOF") :
        void(0);
      return delim === ch ?
        a :
        (function() {
          var macrofn = macros(ch);
          return macrofn ?
            (function() {
              var mret = macrofn(reader, ch);
              return (a = mret === reader ?
                a :
                a.concat([mret]), loop);
            })() :
            (function() {
              unreadChar(reader, ch);
              return (function() {
                var o = read(reader, true, void(0), isRecursive);
                return (a = o === reader ?
                  a :
                  a.concat([o]), loop);
              })();
            })();
        })();
    })();
    };
    return recur;
  })([]);
};

var notImplemented = function notImplemented(reader, ch) {
  return readerError(reader, str("Reader for ", ch, " not implemented yet"));
};

var readDispatch = function readDispatch(reader, _) {
  return (function() {
    var ch = readChar(reader);
    var dm = dispatchMacros(ch);
    return dm ?
      dm(reader, _) :
      (function() {
        var object = maybeReadTaggedType(reader, ch);
        return object ?
          object :
          readerError(reader, "No dispatch macro for ", ch);
      })();
  })();
};

var readUnmatchedDelimiter = function readUnmatchedDelimiter(rdr, ch) {
  return readerError(rdr, "Unmached delimiter ", ch);
};

var readList = function readList(reader) {
  return list.apply(list, readDelimitedList(")", reader, true));
};

var readComment = skipLine;

var readVector = function readVector(reader) {
  return readDelimitedList("]", reader, true);
};

var readMap = function readMap(reader) {
  return (function() {
    var items = readDelimitedList("}", reader, true);
    isOdd(items.length) ?
      readerError(reader, "Map literal must contain an even number of forms") :
      void(0);
    return dictionary.apply(dictionary, items);
  })();
};

var readNumber = function readNumber(reader, initch) {
  return (function loop(buffer, ch) {
    var recur = loop;
    while (recur === loop) {
      recur = (isNil(ch)) || (isWhitespace(ch)) || (macros(ch)) ?
      (function() {
        unreadChar(reader, ch);
        var match = matchNumber(buffer);
        return isNil(match) ?
          readerError(reader, "Invalid number format [", buffer, "]") :
          match;
      })() :
      (buffer = str(buffer, ch), ch = readChar(reader), loop);
    };
    return recur;
  })(initch, readChar(reader));
};

var readString = function readString(reader) {
  return (function loop(buffer, ch) {
    var recur = loop;
    while (recur === loop) {
      recur = isNil(ch) ?
      readerError(reader, "EOF while reading string") :
    "\\" === ch ?
      (buffer = str(buffer, escapeChar(buffer, reader)), ch = readChar(reader), loop) :
    "\"" === ch ?
      buffer :
    "default" ?
      (buffer = str(buffer, ch), ch = readChar(reader), loop) :
      void(0);
    };
    return recur;
  })("", readChar(reader));
};

var readUnquote = function readUnquote(reader) {
  return (function() {
    var ch = readChar(reader);
    return !(ch) ?
      readerError(reader, "EOF while reading character") :
    ch === "@" ?
      list("﻿unquote-splicing", read(reader, true, void(0), true)) :
      (function() {
        unreadChar(reader, ch);
        return list("﻿unquote", read(reader, true, void(0), true));
      })();
  })();
};

var specialSymbols = function specialSymbols(text, notFound) {
  return text === "nil" ?
    void(0) :
  text === "true" ?
    true :
  text === "false" ?
    false :
  "else" ?
    notFound :
    void(0);
};

var readSymbol = function readSymbol(reader, initch) {
  return (function() {
    var token = readToken(reader, initch);
    return token.indexOf("/") >= 0 ?
      symbol(token.substr(0, token.indexOf("/")), token.substr(inc(token.indexOf("/")), token.length)) :
      specialSymbols(token, symbol(token));
  })();
};

var readKeyword = function readKeyword(reader, initch) {
  return (function() {
    var token = readToken(reader, readChar(reader));
    var a = reMatches(symbolPattern, token);
    var token = a[0];
    var ns = a[1];
    var name = a[2];
    return ((!(isNil(ns))) && (ns.substring((ns.length) - 2, ns.length) === ":/")) || (name[dec(name.length)] === ":") || (!(token.indexOf("::", 1) == -1)) ?
      readerError(reader, "Invalid token: ", token) :
    (!(isNil(ns))) && (ns.length > 0) ?
      keyword(ns.substring(0, ns.indexOf("/")), name) :
      keyword(token);
  })();
};

var desugarMeta = function desugarMeta(f) {
  return isSymbol(f) ?
    {
      "tag": f
    } :
  isString(f) ?
    {
      "tag": f
    } :
  isKeyword(f) ?
    dictionary(name(f), true) :
  "else" ?
    f :
    void(0);
};

var wrappingReader = function wrappingReader(prefix) {
  return function(reader) {
    return list(prefix, read(reader, true, void(0), true));
  };
};

var throwingReader = function throwingReader(msg) {
  return function(reader) {
    return readerError(reader, msg);
  };
};

var readMeta = function readMeta(reader, _) {
  return (function() {
    var m = desugarMeta(read(reader, true, void(0), true));
    !(isObject(m)) ?
      readerError(reader, "Metadata must be Symbol, Keyword, String or Map") :
      void(0);
    return (function() {
      var o = read(reader, true, void(0), true);
      return isObject(o) ?
        withMeta(o, merge(meta(o), m)) :
        o;
    })();
  })();
};

var readSet = function readSet(reader, _) {
  return list.apply(list, ["﻿set"].concat(readDelimitedList("}", reader, true)));
};

var readRegex = function readRegex(reader) {
  return (function loop(buffer, ch) {
    var recur = loop;
    while (recur === loop) {
      recur = isNil(ch) ?
      readerError(reader, "EOF while reading string") :
    "\\" === ch ?
      (buffer = str(buffer, ch, readChar(reader)), ch = readChar(reader), loop) :
    "\"" === ch ?
      rePattern(buffer.split("/").join("\\/")) :
    "default" ?
      (buffer = str(buffer, ch), ch = readChar(reader), loop) :
      void(0);
    };
    return recur;
  })("", readChar(reader));
};

var readDiscard = function readDiscard(reader, _) {
  read(reader, true, void(0), true);
  return reader;
};

var macros = function macros(c) {
  return c === "\"" ?
    readString :
  c === ":" ?
    readKeyword :
  c === ";" ?
    readComment :
  c === "'" ?
    wrappingReader("﻿quote") :
  c === "@" ?
    wrappingReader("﻿deref") :
  c === "^" ?
    readMeta :
  c === "`" ?
    wrappingReader("﻿syntax-quote") :
  c === "~" ?
    readUnquote :
  c === "(" ?
    readList :
  c === ")" ?
    readUnmatchedDelimiter :
  c === "[" ?
    readVector :
  c === "]" ?
    readUnmatchedDelimiter :
  c === "{" ?
    readMap :
  c === "}" ?
    readUnmatchedDelimiter :
  c === "\\" ?
    readChar :
  c === "%" ?
    notImplemented :
  c === "#" ?
    readDispatch :
  "else" ?
    void(0) :
    void(0);
};

var dispatchMacros = function dispatchMacros(s) {
  return s === "{" ?
    readSet :
  s === "<" ?
    throwingReader("Unreadable form") :
  s === "\"" ?
    readRegex :
  s === "!" ?
    readComment :
  s === "_" ?
    readDiscard :
  "else" ?
    void(0) :
    void(0);
};

var read = function read(reader, eofIsError, sentinel, isRecursive) {
  return (function loop() {
    var recur = loop;
    while (recur === loop) {
      recur = (function() {
      var ch = readChar(reader);
      return isNil(ch) ?
        eofIsError ?
          readerError(reader, "EOF") :
          sentinel :
      isWhitespace(ch) ?
        (loop) :
      isCommentPrefix(ch) ?
        read(readComment(reader, ch), eofIsError, sentinel, isRecursive) :
      "else" ?
        (function() {
          var f = macros(ch);
          var form = f ?
            f(reader, ch) :
          isNumberLiteral(reader, ch) ?
            readNumber(reader, ch) :
          "else" ?
            readSymbol(reader, ch) :
            void(0);
          return form === reader ?
            (loop) :
            form;
        })() :
        void(0);
    })();
    };
    return recur;
  })();
};

var readFromString = function readFromString(source, uri) {
  return (function() {
    var reader = pushBackReader(source, uri);
    return read(reader, true, void(0), false);
  })();
};

var readUuid = function readUuid(uuid) {
  return isString(uuid) ?
    list("﻿UUID.", uuid) :
    readerError(void(0), "UUID literal expects a string as its representation.");
};

var readQueue = function readQueue(items) {
  return isVector(items) ?
    list("﻿PersistentQueue.", items) :
    readerError(void(0), "Queue literal expects a vector for its elements.");
};

var __tagTable__ = dictionary("uuid", readUuid, "queue", readQueue);

var maybeReadTaggedType = function maybeReadTaggedType(reader, initch) {
  return (function() {
    var tag = readSymbol(reader, initch);
    var pfn = __tagTable__[name(tag)];
    return pfn ?
      pfn(read(reader, true, void(0), false)) :
      readerError(reader, str("Could not find tag parser for ", name(tag), " in ", str(keys(__tagTable__))));
  })();
};

exports.readFromString = readFromString;
exports.read = read;
});

require.define("/lib/ast.js",function(require,module,exports,__dirname,__filename,process){var count = (require("./list")).count;
var first = (require("./list")).first;
var isList = (require("./list")).isList;;

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
});

require.define("/lib/compiler.js",function(require,module,exports,__dirname,__filename,process){var readFromString = (require("./reader")).readFromString;;

var gensym = (require("./ast")).gensym;
var name = (require("./ast")).name;
var isSyntaxQuote = (require("./ast")).isSyntaxQuote;
var isQuote = (require("./ast")).isQuote;
var isUnquoteSplicing = (require("./ast")).isUnquoteSplicing;
var isUnquote = (require("./ast")).isUnquote;
var keyword = (require("./ast")).keyword;
var isKeyword = (require("./ast")).isKeyword;
var symbol = (require("./ast")).symbol;
var isSymbol = (require("./ast")).isSymbol;
var withMeta = (require("./ast")).withMeta;
var meta = (require("./ast")).meta;;

var listToVector = (require("./list")).listToVector;
var reduceList = (require("./list")).reduceList;
var concatList = (require("./list")).concatList;
var mapList = (require("./list")).mapList;
var reverse = (require("./list")).reverse;
var cons = (require("./list")).cons;
var rest = (require("./list")).rest;
var third = (require("./list")).third;
var second = (require("./list")).second;
var first = (require("./list")).first;
var list = (require("./list")).list;
var isList = (require("./list")).isList;
var count = (require("./list")).count;
var isEmpty = (require("./list")).isEmpty;;

var take = (require("./sequence")).take;
var filter = (require("./sequence")).filter;
var map = (require("./sequence")).map;;

var str = (require("./runtime")).str;
var dec = (require("./runtime")).dec;
var inc = (require("./runtime")).inc;
var isRePattern = (require("./runtime")).isRePattern;
var isNil = (require("./runtime")).isNil;
var isFalse = (require("./runtime")).isFalse;
var isTrue = (require("./runtime")).isTrue;
var isBoolean = (require("./runtime")).isBoolean;
var isVector = (require("./runtime")).isVector;
var isNumber = (require("./runtime")).isNumber;
var isString = (require("./runtime")).isString;
var mapDictionary = (require("./runtime")).mapDictionary;
var isContainsVector = (require("./runtime")).isContainsVector;
var vals = (require("./runtime")).vals;
var keys = (require("./runtime")).keys;
var merge = (require("./runtime")).merge;
var dictionary = (require("./runtime")).dictionary;
var isDictionary = (require("./runtime")).isDictionary;
var isOdd = (require("./runtime")).isOdd;;

var isSelfEvaluating = function isSelfEvaluating(form) {
  return (isNumber(form)) || ((isString(form)) && (!(isSymbol(form))) && (!(isKeyword(form)))) || (isBoolean(form)) || (isNil(form)) || (isRePattern(form));
};

var __macros__ = {};

var executeMacro = function executeMacro(name, form) {
  return __macros__[name].apply(__macros__[name], listToVector(form));
};

var installMacro = function installMacro(name, macroFn) {
  return __macros__[name] = macroFn;
};

var isMacro = function isMacro(name) {
  return (isSymbol(name)) && (__macros__[name]) && true;
};

var makeMacro = function makeMacro(pattern, body) {
  return (function() {
    var macroFn = concatList(list("﻿fn", pattern), body);
    return eval(str("(", compile(macroexpand(macroFn)), ")"));
  })();
};

installMacro("﻿defmacro", function(name, signature) {
  var body = Array.prototype.slice.call(arguments, 2);
  return installMacro(name, makeMacro(signature, body));
});

var __specials__ = {};

var installSpecial = function installSpecial(name, f, validator) {
  return __specials__[name] = function(form) {
    validator ?
      validator(form) :
      void(0);
    return f(rest(form));
  };
};

var isSpecial = function isSpecial(name) {
  return (isSymbol(name)) && (__specials__[name]) && true;
};

var executeSpecial = function executeSpecial(name, form) {
  return (__specials__[name])(form);
};

var opt = function opt(argument, fallback) {
  return (isNil(argument)) || (isEmpty(argument)) ?
    fallback :
    first(argument);
};

var applyForm = function applyForm(fnName, form, isQuoted) {
  return cons(fnName, isQuoted ?
    mapList(form, function(e) {
      return list("﻿quote", e);
    }) :
    form, form);
};

var applyUnquotedForm = function applyUnquotedForm(fnName, form) {
  return cons(fnName, mapList(form, function(e) {
    return isUnquote(e) ?
      second(e) :
    (isList(e)) && (isKeyword(first(e))) ?
      list("﻿syntax-quote", second(e)) :
      list("﻿syntax-quote", e);
  }));
};

var splitSplices = function splitSplices(form, fnName) {
  var makeSplice = function makeSplice(form) {
    return (isSelfEvaluating(form)) || (isSymbol(form)) ?
      applyUnquotedForm(fnName, list(form)) :
      applyUnquotedForm(fnName, form);
  };
  return (function loop(nodes, slices, acc) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(nodes) ?
      reverse(isEmpty(acc) ?
        slices :
        cons(makeSplice(reverse(acc)), slices)) :
      (function() {
        var node = first(nodes);
        return isUnquoteSplicing(node) ?
          (nodes = rest(nodes), slices = cons(second(node), isEmpty(acc) ?
            slices :
            cons(makeSplice(reverse(acc)), slices)), acc = list(), loop) :
          (nodes = rest(nodes), slices = slices, acc = cons(node, acc), loop);
      })();
    };
    return recur;
  })(form, list(), list());
};

var syntaxQuoteSplit = function syntaxQuoteSplit(appendName, fnName, form) {
  return (function() {
    var slices = splitSplices(form, fnName);
    return count(slices) == 1 ?
      first(slices) :
      applyForm(appendName, slices);
  })();
};

var compileObject = function compileObject(form, isQuoted) {
  return isKeyword(form) ?
    compileKeyword(form) :
  isSymbol(form) ?
    compileSymbol(form) :
  isNumber(form) ?
    compileNumber(form) :
  isString(form) ?
    compileString(form) :
  isBoolean(form) ?
    compileBoolean(form) :
  isNil(form) ?
    compileNil(form) :
  isRePattern(form) ?
    compileRePattern(form) :
  isVector(form) ?
    compile(applyForm("﻿vector", list.apply(list, form), isQuoted)) :
  isList(form) ?
    compile(applyForm("﻿list", form, isQuoted)) :
  isDictionary(form) ?
    compileDictionary(isQuoted ?
      mapDictionary(form, function(x) {
        return list("﻿quote", x);
      }) :
      form) :
    void(0);
};

var compileReference = function compileReference(form) {
  var id = name(form);
  id = id.split("*").join("_");
  id = id.split("->").join("-to-");
  id = id.split("!").join("");
  id = id.split("%").join("$");
  id = id.substr(-1) === "?" ?
    str("is-", id.substr(0, (id.length) - 1)) :
    id;
  id = id.split("-").reduce(function(result, key) {
    return str(result, (!(isEmpty(result))) && (!(isEmpty(key))) ?
      str(key[0].toUpperCase(), key.substr(1)) :
      key);
  }, "");
  return id;
};

var compileKeywordReference = function compileKeywordReference(form) {
  return str("\"", name(form), "\"");
};

var compileSyntaxQuoted = function compileSyntaxQuoted(form) {
  return isList(form) ?
    compile(syntaxQuoteSplit("﻿concat-list", "﻿list", form)) :
  isVector(form) ?
    compile(syntaxQuoteSplit("﻿concat-vector", "﻿vector", list.apply(list, form))) :
  isDictionary(form) ?
    compile(syntaxQuoteSplit("﻿merge", "﻿dictionary", form)) :
  "else" ?
    compileObject(form) :
    void(0);
};

var compile = function compile(form) {
  return isSelfEvaluating(form) ?
    compileObject(form) :
  isSymbol(form) ?
    compileReference(form) :
  isKeyword(form) ?
    compileKeywordReference(form) :
  isVector(form) ?
    compileObject(form) :
  isDictionary(form) ?
    compileObject(form) :
  isList(form) ?
    (function() {
      var head = first(form);
      return isQuote(form) ?
        compileObject(second(form), true) :
      isSyntaxQuote(form) ?
        compileSyntaxQuoted(second(form)) :
      isSpecial(head) ?
        executeSpecial(head, form) :
      isKeyword(head) ?
        compile(list("﻿get", second(form), head)) :
      "else" ?
        (function() {
          return !((isSymbol(head)) || (isList(head))) ?
            (function() { throw compilerError(form, str("operator is not a procedure: ", head)); })() :
            compileInvoke(form);
        })() :
        void(0);
    })() :
    void(0);
};

var compileProgram = function compileProgram(forms) {
  return (function loop(result, expressions) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(expressions) ?
      result :
      (result = str(result, isEmpty(result) ?
        "" :
        ";\n\n", compile(macroexpand(first(expressions)))), expressions = rest(expressions), loop);
    };
    return recur;
  })("", forms);
};

var macroexpand1 = function macroexpand1(form) {
  return isList(form) ?
    (function() {
      var op = first(form);
      var id = name(op);
      return isSpecial(op) ?
        form :
      isMacro(op) ?
        executeMacro(op, rest(form)) :
      (isSymbol(op)) && (!(id === ".")) ?
        id.charAt(0) === "." ?
          count(form) < 2 ?
            (function() { throw Error("Malformed member expression, expecting (.member target ...)"); })() :
            cons("﻿.", cons(second(form), cons(symbol(id.substr(1)), rest(rest(form))))) :
        id.charAt((id.length) - 1) === "." ?
          cons("﻿new", cons(symbol(id.substr(0, (id.length) - 1)), rest(form))) :
          form :
      "else" ?
        form :
        void(0);
    })() :
    form;
};

var macroexpand = function macroexpand(form) {
  return (function loop(original, expanded) {
    var recur = loop;
    while (recur === loop) {
      recur = original === expanded ?
      original :
      (original = expanded, expanded = macroexpand1(expanded), loop);
    };
    return recur;
  })(form, macroexpand1(form));
};

var compileTemplate = function compileTemplate(form) {
  var indentPattern = /\n *$/;
  var lineBreakPatter = RegExp("\n", "g");
  var getIndentation = function getIndentation(code) {
    return (function() {
      var match = code.match(indentPattern);
      return (match && (match[0])) || "\n";
    })();
  };
  return (function loop(code, parts, values) {
    var recur = loop;
    while (recur === loop) {
      recur = parts.length > 1 ?
      (code = str(code, parts[0], str("", first(values)).replace(lineBreakPatter, getIndentation(parts[0]))), parts = parts.slice(1), values = rest(values), loop) :
      code.concat(parts[0]);
    };
    return recur;
  })("", first(form).split("~{}"), rest(form));
};

var compileDef = function compileDef(form) {
  return compileTemplate(list("var ~{}", compile(cons("﻿set!", form))));
};

var compileIfElse = function compileIfElse(form) {
  return (function() {
    var condition = macroexpand(first(form));
    var thenExpression = macroexpand(second(form));
    var elseExpression = macroexpand(third(form));
    return compileTemplate(list((isList(elseExpression)) && (first(elseExpression) === "﻿if") ?
      "~{} ?\n  ~{} :\n~{}" :
      "~{} ?\n  ~{} :\n  ~{}", compile(condition), compile(thenExpression), compile(elseExpression)));
  })();
};

var compileDictionary = function compileDictionary(form) {
  return (function() {
    var body = (function loop(body, names) {
      var recur = loop;
      while (recur === loop) {
        recur = isEmpty(names) ?
        body :
        (body = str(isNil(body) ?
          "" :
          str(body, ",\n"), compileTemplate(list("~{}: ~{}", compile(first(names)), compile(macroexpand(form[first(names)]))))), names = rest(names), loop);
      };
      return recur;
    })(void(0), keys(form));
    return isNil(body) ?
      "{}" :
      compileTemplate(list("{\n  ~{}\n}", body));
  })();
};

var desugarFnName = function desugarFnName(form) {
  return (isSymbol(first(form))) || (isNil(first(form))) ?
    form :
    cons(void(0), form);
};

var desugarFnDoc = function desugarFnDoc(form) {
  return (isString(second(form))) || (isNil(second(form))) ?
    form :
    cons(first(form), cons(void(0), rest(form)));
};

var desugarFnAttrs = function desugarFnAttrs(form) {
  return (isDictionary(third(form))) || (isNil(third(form))) ?
    form :
    cons(first(form), cons(second(form), cons(void(0), rest(rest(form)))));
};

var compileFnParams = function compileFnParams(params) {
  return isContainsVector(params, "﻿&") ?
    params.slice(0, params.indexOf("﻿&")).map(compile).join(", ") :
    params.map(compile).join(", ");
};

var compileDesugaredFn = function compileDesugaredFn(name, doc, attrs, params, body) {
  return compileTemplate(isNil(name) ?
    list("function(~{}) {\n  ~{}\n}", compileFnParams(params), compileFnBody(map(macroexpand, body), params)) :
    list("function ~{}(~{}) {\n  ~{}\n}", compile(name), compileFnParams(params), compileFnBody(map(macroexpand, body), params)));
};

var compileStatements = function compileStatements(form, prefix) {
  return (function loop(result, expression, expressions) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(expressions) ?
      str(result, isNil(prefix) ?
        "" :
        prefix, compile(macroexpand(expression)), ";") :
      (result = str(result, compile(macroexpand(expression)), ";\n"), expression = first(expressions), expressions = rest(expressions), loop);
    };
    return recur;
  })("", first(form), rest(form));
};

var compileFnBody = function compileFnBody(form, params) {
  return (isVector(params)) && (isContainsVector(params, "﻿&")) ?
    compileStatements(cons(list("﻿def", params[inc(params.indexOf("﻿&"))], list("﻿Array.prototype.slice.call", "﻿arguments", params.indexOf("﻿&"))), form), "return ") :
    (function() {
      return (count(form) == 1) && (isList(first(form))) && (first(first(form)) == "﻿do") ?
        compileFnBody(rest(first(form)), params) :
        compileStatements(form, "return ");
    })();
};

var isVariadic = function isVariadic(params) {
  return params.indexOf("﻿&") >= 0;
};

var overloadArity = function overloadArity(params) {
  return isVariadic() ?
    params.indexOf("﻿&") :
    params.length;
};

var analyzeOverloadedFn = function analyzeOverloadedFn(name, doc, attrs, overloads) {
  return map(function(overload) {
    return (function() {
      var params = first(overload);
      var variadic = isVariadic(params);
      var fixedArity = variadic ?
        (count(params)) - 2 :
        count(params);
      return {
        "variadic": variadic,
        "rest": isVariadic ?
          params[dec(count(params))] :
          void(0),
        "fixed-arity": fixedArity,
        "params": take(fixedArity, params),
        "body": rest(overload)
      };
    })();
  }, overloads);
};

var compileOverloadedFn = function compileOverloadedFn(name, doc, attrs, overloads) {
  return (function() {
    var methods = analyzeOverloadedFn(name, doc, attrs, overloads);
    var fixedMethods = filter(function(method) {
      return !(method["variadic"]);
    }, methods);
    var variadic = first(filter(function(method) {
      return method["variadic"];
    }, methods));
    var names = reduceList(methods, function(a, b) {
      return count(a) > count(b["params"]) ?
        a :
        b["params"];
    }, []);
    return list("﻿fn", name, doc, attrs, names, list("﻿raw*", compileSwitch("﻿arguments.length", map(function(method) {
      return cons(method["fixed-arity"], list("﻿raw*", compileFnBody(concatList(compileRebind(names, method["params"]), method["body"]))));
    }, fixedMethods), isNil(variadic) ?
      list("﻿throw", list("﻿Error", "Invalid arity")) :
      list("﻿raw*", compileFnBody(concatList(compileRebind(cons(list("﻿Array.prototype.slice.call", "﻿arguments", variadic["fixed-arity"]), names), cons(variadic["rest"], variadic["params"])), variadic["body"]))))), void(0));
  })();
};

var compileRebind = function compileRebind(bindings, names) {
  return (function loop(form, bindings, names) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(names) ?
      reverse(form) :
      (form = first(names) === first(bindings) ?
        form :
        cons(list("﻿def", first(names), first(bindings)), form), bindings = rest(bindings), names = rest(names), loop);
    };
    return recur;
  })(list(), bindings, names);
};

var compileSwitchCases = function compileSwitchCases(cases) {
  return reduceList(cases, function(form, caseExpression) {
    return str(form, compileTemplate(list("case ~{}:\n  ~{}\n", compile(macroexpand(first(caseExpression))), compile(macroexpand(rest(caseExpression))))));
  }, "");
};

var compileSwitch = function compileSwitch(value, cases, defaultCase) {
  return compileTemplate(list("switch (~{}) {\n  ~{}\n  default:\n    ~{}\n}", compile(macroexpand(value)), compileSwitchCases(cases), compile(macroexpand(defaultCase))));
};

var compileFn = function compileFn(form) {
  return (function() {
    var signature = desugarFnAttrs(desugarFnDoc(desugarFnName(form)));
    var name = first(signature);
    var doc = second(signature);
    var attrs = third(signature);
    return isVector(third(rest(signature))) ?
      compileDesugaredFn(name, doc, attrs, third(rest(signature)), rest(rest(rest(rest(signature))))) :
      compile(compileOverloadedFn(name, doc, attrs, rest(rest(rest(signature)))));
  })();
};

var compileInvoke = function compileInvoke(form) {
  return compileTemplate(list(isList(first(form)) ?
    "(~{})(~{})" :
    "~{}(~{})", compile(first(form)), compileGroup(rest(form))));
};

var compileGroup = function compileGroup(form, wrap) {
  return wrap ?
    str("(", compileGroup(form), ")") :
    listToVector(mapList(mapList(form, macroexpand), compile)).join(", ");
};

var compileDo = function compileDo(form) {
  return compile(list(cons("﻿fn", cons([], form))));
};

var defineBindings = function defineBindings(form) {
  return (function loop(defs, bindings) {
    var recur = loop;
    while (recur === loop) {
      recur = count(bindings) == 0 ?
      reverse(defs) :
      (defs = cons(list("﻿def", bindings[0], bindings[1]), defs), bindings = rest(rest(bindings)), loop);
    };
    return recur;
  })(list(), form);
};

var compileThrow = function compileThrow(form) {
  return compileTemplate(list("(function() { throw ~{}; })()", compile(macroexpand(first(form)))));
};

var compileSet = function compileSet(form) {
  return compileTemplate(list("~{} = ~{}", compile(macroexpand(first(form))), compile(macroexpand(second(form)))));
};

var compileVector = function compileVector(form) {
  return compileTemplate(list("[~{}]", compileGroup(form)));
};

var compileTry = function compileTry(form) {
  return (function loop(tryExprs, catchExprs, finallyExprs, exprs) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(exprs) ?
      isEmpty(catchExprs) ?
        compileTemplate(list("(function() {\ntry {\n  ~{}\n} finally {\n  ~{}\n}})()", compileFnBody(tryExprs), compileFnBody(finallyExprs))) :
      isEmpty(finallyExprs) ?
        compileTemplate(list("(function() {\ntry {\n  ~{}\n} catch (~{}) {\n  ~{}\n}})()", compileFnBody(tryExprs), compile(first(catchExprs)), compileFnBody(rest(catchExprs)))) :
        compileTemplate(list("(function() {\ntry {\n  ~{}\n} catch (~{}) {\n  ~{}\n} finally {\n  ~{}\n}})()", compileFnBody(tryExprs), compile(first(catchExprs)), compileFnBody(rest(catchExprs)), compileFnBody(finallyExprs))) :
    first(first(exprs)) === "﻿catch" ?
      (tryExprs = tryExprs, catchExprs = rest(first(exprs)), finallyExprs = finallyExprs, exprs = rest(exprs), loop) :
    first(first(exprs)) === "﻿finally" ?
      (tryExprs = tryExprs, catchExprs = catchExprs, finallyExprs = rest(first(exprs)), exprs = rest(exprs), loop) :
      (tryExprs = cons(first(exprs), tryExprs), catchExprs = catchExprs, finallyExprs = finallyExprs, exprs = rest(exprs), loop);
    };
    return recur;
  })(list(), list(), list(), reverse(form));
};

var compileProperty = function compileProperty(form) {
  return name(second(form))[0] === "-" ?
    compileTemplate(list(isList(first(form)) ?
      "(~{}).~{}" :
      "~{}.~{}", compile(macroexpand(first(form))), compile(macroexpand(symbol(name(second(form)).substr(1)))))) :
    compileTemplate(list("~{}.~{}(~{})", compile(macroexpand(first(form))), compile(macroexpand(second(form))), compileGroup(rest(rest(form)))));
};

var compileApply = function compileApply(form) {
  return compile(list("﻿.", first(form), "﻿apply", first(form), second(form)));
};

var compileNew = function compileNew(form) {
  return compileTemplate(list("new ~{}", compile(form)));
};

var compileCompoundAccessor = function compileCompoundAccessor(form) {
  return compileTemplate(list("~{}[~{}]", compile(macroexpand(first(form))), compile(macroexpand(second(form)))));
};

var compileInstance = function compileInstance(form) {
  return compileTemplate(list("~{} instanceof ~{}", compile(macroexpand(second(form))), compile(macroexpand(first(form)))));
};

var compileNot = function compileNot(form) {
  return compileTemplate(list("!(~{})", compile(macroexpand(first(form)))));
};

var compileLoop = function compileLoop(form) {
  return (function() {
    var bindings = dictionary.apply(dictionary, first(form));
    var names = keys(bindings);
    var values = vals(bindings);
    var body = rest(form);
    return compile(cons(cons("﻿fn", cons("﻿loop", cons(names, compileRecur(names, body)))), list.apply(list, values)));
  })();
};

var rebindBindings = function rebindBindings(names, values) {
  return (function loop(result, names, values) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(names) ?
      reverse(result) :
      (result = cons(list("﻿set!", first(names), first(values)), result), names = rest(names), values = rest(values), loop);
    };
    return recur;
  })(list(), names, values);
};

var expandRecur = function expandRecur(names, body) {
  return mapList(body, function(form) {
    return isList(form) ?
      first(form) === "﻿recur" ?
        list("﻿raw*", compileGroup(concatList(rebindBindings(names, rest(form)), list("﻿loop")), true)) :
        expandRecur(names, form) :
      form;
  });
};

var compileRecur = function compileRecur(names, body) {
  return list(list("﻿raw*", compileTemplate(list("var recur = loop;\nwhile (recur === loop) {\n  recur = ~{}\n}", compileStatements(expandRecur(names, body))))), "﻿recur");
};

var compileRaw = function compileRaw(form) {
  return first(form);
};

installSpecial("﻿set!", compileSet);

installSpecial("﻿get", compileCompoundAccessor);

installSpecial("﻿aget", compileCompoundAccessor);

installSpecial("﻿def", compileDef);

installSpecial("﻿if", compileIfElse);

installSpecial("﻿do", compileDo);

installSpecial("﻿do*", compileStatements);

installSpecial("﻿fn", compileFn);

installSpecial("﻿throw", compileThrow);

installSpecial("﻿vector", compileVector);

installSpecial("﻿try", compileTry);

installSpecial("﻿.", compileProperty);

installSpecial("﻿apply", compileApply);

installSpecial("﻿new", compileNew);

installSpecial("﻿instance?", compileInstance);

installSpecial("﻿not", compileNot);

installSpecial("﻿loop", compileLoop);

installSpecial("﻿raw*", compileRaw);

var compileKeyword = function compileKeyword(form) {
  return str("\"", "꞉", name(form), "\"");
};

var compileSymbol = function compileSymbol(form) {
  return str("\"", "﻿", name(form), "\"");
};

var compileNil = function compileNil(form) {
  return "void(0)";
};

var compileNumber = function compileNumber(form) {
  return form;
};

var compileBoolean = function compileBoolean(form) {
  return isTrue(form) ?
    "true" :
    "false";
};

var compileString = function compileString(form) {
  form = form.replace(RegExp("\\\\", "g"), "\\\\");
  form = form.replace(RegExp("\n", "g"), "\\n");
  form = form.replace(RegExp("\r", "g"), "\\r");
  form = form.replace(RegExp("\t", "g"), "\\t");
  form = form.replace(RegExp("\"", "g"), "\\\"");
  return str("\"", form, "\"");
};

var compileRePattern = function compileRePattern(form) {
  return str(form);
};

var installNative = function installNative(alias, operator, validator, fallback) {
  return installSpecial(alias, function(form) {
    return reduceList(mapList(form, function(operand) {
      return compileTemplate(list(isList(operand) ?
        "(~{})" :
        "~{}", compile(macroexpand(operand))));
    }), function(left, right) {
      return compileTemplate(list("~{} ~{} ~{}", left, name(operator), right));
    }, isEmpty(form) ?
      fallback :
      void(0));
  }, validator);
};

var installOperator = function installOperator(alias, operator) {
  return installSpecial(alias, function(form) {
    return (function loop(result, left, right, operands) {
      var recur = loop;
      while (recur === loop) {
        recur = isEmpty(operands) ?
        str(result, compileTemplate(list("~{} ~{} ~{}", compile(macroexpand(left)), name(operator), compile(macroexpand(right))))) :
        (result = str(result, compileTemplate(list("~{} ~{} ~{} && ", compile(macroexpand(left)), name(operator), compile(macroexpand(right))))), left = right, right = first(operands), operands = rest(operands), loop);
      };
      return recur;
    })("", first(form), second(form), rest(rest(form)));
  }, verifyTwo);
};

var compilerError = function compilerError(form, message) {
  return (function() {
    var error = Error(str(message));
    error.line = 1;
    return (function() { throw error; })();
  })();
};

var verifyTwo = function verifyTwo(form) {
  return (isEmpty(rest(form))) || (isEmpty(rest(rest(form)))) ?
    (function() { throw compilerError(form, str(first(form), " form requires at least two operands")); })() :
    void(0);
};

installNative("﻿+", "﻿+", void(0), 0);

installNative("﻿-", "﻿-", void(0), "NaN");

installNative("﻿*", "﻿*", void(0), 1);

installNative("﻿/", "﻿/", verifyTwo);

installNative("﻿mod", symbol("%"), verifyTwo);

installNative("﻿and", "﻿&&");

installNative("﻿or", "﻿||");

installOperator("﻿=", "﻿==");

installOperator("﻿not=", "﻿!=");

installOperator("﻿==", "﻿==");

installOperator("﻿identical?", "﻿===");

installOperator("﻿>", "﻿>");

installOperator("﻿>=", "﻿>=");

installOperator("﻿<", "﻿<");

installOperator("﻿<=", "﻿<=");

installNative("﻿bit-and", "﻿&", verifyTwo);

installNative("﻿bit-or", "﻿|", verifyTwo);

installNative("﻿bit-xor", symbol("^"));

installNative("﻿bit-not", symbol("~"), verifyTwo);

installNative("﻿bit-shift-left", "﻿<<", verifyTwo);

installNative("﻿bit-shift-right", "﻿>>", verifyTwo);

installNative("﻿bit-shift-right-zero-fil", "﻿>>>", verifyTwo);

installMacro("﻿let", function letMacro(bindings) {
  var body = Array.prototype.slice.call(arguments, 1);
  return cons("﻿do", concatList(defineBindings(bindings), body));
});

installMacro("﻿cond", function cond() {
  var clauses = Array.prototype.slice.call(arguments, 0);
  return !(isEmpty(clauses)) ?
    list("﻿if", first(clauses), isEmpty(rest(clauses)) ?
      (function() { throw Error("cond requires an even number of forms"); })() :
      second(clauses), cons("﻿cond", rest(rest(clauses)))) :
    void(0);
});

installMacro("﻿defn", function defn(name) {
  var body = Array.prototype.slice.call(arguments, 1);
  return list("﻿def", name, concatList(list("﻿fn", name), body));
});

installMacro("﻿assert", function assert(x, message) {
  return isNil(message) ?
    list("﻿assert", x, "") :
    list("﻿if", list("﻿not", x), list("﻿throw", list("﻿Error.", list("﻿.concat", "Assert failed: ", message, "\n", list("﻿quote", x)))));
});

installMacro("﻿export", function() {
  var names = Array.prototype.slice.call(arguments, 0);
  return isEmpty(names) ?
    void(0) :
  isEmpty(rest(names)) ?
    list("﻿set!", "﻿module.exports", first(names)) :
    (function loop(form, exports) {
      var recur = loop;
      while (recur === loop) {
        recur = isEmpty(exports) ?
        concatList(list("﻿do*"), form) :
        (form = cons(list("﻿set!", list(symbol(str(".-", name(first(exports)))), "﻿exports"), first(exports)), form), exports = rest(exports), loop);
      };
      return recur;
    })(list(), names);
});

installMacro("﻿import", function(imports, path) {
  return isNil(path) ?
    list("﻿require", imports) :
  isSymbol(imports) ?
    list("﻿def", imports, list("﻿require", path)) :
    (function loop(form, names) {
      var recur = loop;
      while (recur === loop) {
        recur = isEmpty(names) ?
        concatList(list("﻿do*"), form) :
        (function() {
          var alias = first(names);
          var id = symbol(str(".-", name(alias)));
          return (form = cons(list("﻿def", alias, list(id, list("﻿require", path))), form), names = rest(names), loop);
        })();
      };
      return recur;
    })(list(), imports);
});

exports.macroexpand1 = macroexpand1;
exports.macroexpand = macroexpand;
exports.compileProgram = compileProgram;
exports.compile = compile;
exports.isSelfEvaluating = isSelfEvaluating;
});

require.define("/lib/sequence.js",function(require,module,exports,__dirname,__filename,process){var dec = (require("./runtime")).dec;
var isVector = (require("./runtime")).isVector;;

var cons = (require("./list")).cons;
var list = (require("./list")).list;
var isList = (require("./list")).isList;;

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
      (result = cons(f(first(items)), result), items = rest(items), loop);
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

var take = function take(n, sequence) {
  return isVector(sequence) ?
    takeVector(n, sequence) :
    takeList(n, sequence);
};

var takeVector = function takeVector(n, vector) {
  return vector.slice(0, n);
};

var takeList = function takeList(n, sequence) {
  return (function loop(taken, items, n) {
    var recur = loop;
    while (recur === loop) {
      recur = (n == 0) || (isEmpty(items)) ?
      reverse(taken) :
      (taken = cons(first(items), taken), items = rest(items), n = dec(n), loop);
    };
    return recur;
  })(list(), sequence, n);
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
});

require.define("/support/embed.js",function(require,module,exports,__dirname,__filename,process){var rest = (require("../lib/list")).rest;;

var str = (require("../lib/runtime")).str;;

var transpile = (require("../lib/engine/browser")).transpile;;

var readFromString = (require("../lib/reader")).readFromString;;

var compileProgram = (require("../lib/compiler")).compileProgram;;

var updatePreview = function updatePreview(editor) {
  clearTimeout(updatePreview.id);
  return (function() {
    var code = editor.getValue();
    localStorage.buffer = code;
    return updatePreview.id = setTimeout(function() {
      return (function() {
      try {
        editor.clearMarker(updatePreview.line || 1);
        return output.setValue(transpile(code));
      } catch (error) {
        updatePreview.line = error.line;
        return editor.setMarker(error.line || 0, str("<span title='", error.message, "'>●</span> %N%"));
      }})();
    }, 200);
  })();
};

var input = CodeMirror(document.getElementById("input"), {
  "lineNumbers": true,
  "autoClearEmptyLines": true,
  "tabSize": 2,
  "indentWithTabs": false,
  "electricChars": true,
  "mode": "clojure",
  "theme": "ambiance",
  "autofocus": true,
  "fixedGutter": true,
  "matchBrackets": true,
  "value": localStorage.buffer || ((document.getElementById("examples")).innerHTML),
  "onChange": updatePreview,
  "onCursorActivity": function() {
    input.setLineClass(hlLine, null, null);
    return hlLine = input.setLineClass((input.getCursor()).line, null, "activeline");
  },
  "onGutterClick": function() {
    var output = document.getElementById("output");
    var input = document.getElementById("input");
    output.hidden = !(output.hidden);
    return input.style.width = output.hidden ?
      "100%" :
      "50%";
  }
});

var hlLine = input.setLineClass(0, void(0), "activeline");

var output = CodeMirror(document.getElementById("output"), {
  "lineNumbers": true,
  "fixedGutter": true,
  "matchBrackets": true,
  "mode": "javascript",
  "theme": "ambiance",
  "readOnly": true
});

setTimeout(updatePreview, 1000, input)
});
require("/support/embed.js");
})();

