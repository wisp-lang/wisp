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

require.define("/lib/runtime.js",function(require,module,exports,__dirname,__filename,process){// Generated by LispyScript v0.2.1
var isOdd = function(n) {
  return ((n % 2) === 1);
};

var isDictionary = function(form) {
  return ((form && (typeof(form) === "object")) && ((Object.getPrototypeOf(form) && (typeof(Object.getPrototypeOf(form)) === "object")) && (Object.getPrototypeOf(Object.getPrototypeOf(form)) == null)));
};

var dictionary = function() {
  return (function loop(keyValues, result) {
    var recur = loop;
    while ((recur === loop)) {
      recur = (keyValues).length ?
        (function() {
          result[keyValues[0]] = keyValues[1];
          return (keyValues = keyValues.slice(2),
           result = result,
           loop);
        })() :
        result
    };
    return recur;
  })(Array.prototype.slice.call(arguments), {});
};

var keys = function(dictionary) {
  return Object.keys(dictionary);
};

var vals = function(dictionary) {
  return keys(dictionary).map(function(key) {
    return dictionary[key];
  });
};

var merge = function() {
  return Object.create(Object.prototype, Array.prototype.reduce.call(arguments, function(descriptor, dictionary) {
    (dictionary && (typeof(dictionary) === "object")) ?
      Array.prototype.forEach.call(Object.keys(dictionary), function(name) {
        return descriptor[name] = Object.getOwnPropertyDescriptor(dictionary, name);
      }) :
      void 0;
    return descriptor;
  }, Object.create(Object.prototype)));
};

var isVector = function(form) {
  return (Object.prototype.toString.call(form) === '[object Array]');
};

var isContainsVector = function(vector, element) {
  return (vector.indexOf(element) >= 0);
};

var mapDictionary = function(source, f) {
  return dictionary(Array.prototype.reduce.call(Object.keys(source), function(target, key) {
    return target[key] = f(source[key]);
  }, {}));
};

exports.isDictionary = isDictionary;
exports.dictionary = dictionary;
exports.merge = merge;
exports.isOdd = isOdd;
exports.isVector = isVector;
exports.mapDictionary = mapDictionary;
exports.isContainsVector = isContainsVector;
exports.keys = keys;
exports.vals = vals;

});

require.define("/lib/list.js",function(require,module,exports,__dirname,__filename,process){// Generated by LispyScript v0.2.1
var List = function(head, tail) {
  this.head = head;
  this.tail = tail;
  this.length = ((tail).length + 1);
  return this;
};

List.prototype.length = 0;

List.prototype.tail = Object.create(List.prototype);

List.prototype.toString = function() {
  return (function loop(result, list) {
    var recur = loop;
    while ((recur === loop)) {
      recur = isEmpty(list) ?
        ''.concat("(", result.substr(1), ")") :
        (result = ''.concat(result, " ", (Object.prototype.toString.call(first(list)) === '[object Array]') ?
          ''.concat("[", first(list).join(" "), "]") :
          (first(list) == null) ?
            "nil" :
            (Object.prototype.toString.call(first(list)) === '[object String]') ?
              JSON.stringify(first(list)) :
              (Object.prototype.toString.call(first(list)) === '[object Number]') ?
                JSON.stringify(first(list)) :
                first(list)),
         list = rest(list),
         loop)
    };
    return recur;
  })("", this);
};

var isList = function(value) {
  return List.prototype.isPrototypeOf(value);
};

var count = function(sequence) {
  return (sequence).length;
};

var isEmpty = function(sequence) {
  return (count(sequence) == 0);
};

var first = function(sequence) {
  return isList(sequence) ?
    (sequence).head :
    sequence[0];
};

var second = function(sequence) {
  return isList(sequence) ?
    first(rest(sequence)) :
    sequence[1];
};

var third = function(sequence) {
  return isList(sequence) ?
    first(rest(rest(sequence))) :
    sequence[2];
};

var rest = function(sequence) {
  return isList(sequence) ?
    (sequence).tail :
    sequence.slice(1);
};

var cons = function(head, tail) {
  return isList(tail) ?
    new List(head, tail) :
    Array(head).concat(tail);
};

var list = function() {
  return ((arguments).length == 0) ?
    Object.create(List.prototype) :
    Array.prototype.slice.call(arguments).reduceRight(function(tail, head) {
      return cons(head, tail);
    }, list());
};

var reverse = function(sequence) {
  return isList(sequence) ?
    (function loop(items, source) {
      var recur = loop;
      while ((recur === loop)) {
        recur = isEmpty(source) ?
          list.apply(list, items) :
          (items = [ first(source) ].concat(items),
           source = rest(source),
           loop)
      };
      return recur;
    })([], sequence) :
    sequence.reverse();
};

var mapList = function(source, f) {
  return isEmpty(source) ?
    source :
    cons(f(first(source)), mapList(rest(source), f));
};

var reduceList = function(form, f, initial) {
  return (function loop(result, items) {
    var recur = loop;
    while ((recur === loop)) {
      recur = isEmpty(items) ?
        result :
        (result = f(result, first(items)),
         items = rest(items),
         loop)
    };
    return recur;
  })((initial == null) ?
    first(form) :
    initial, (initial == null) ?
    rest(form) :
    form);
};

var concatList = function(left, right) {
  return (function loop(result, prefix) {
    var recur = loop;
    while ((recur === loop)) {
      recur = isEmpty(prefix) ?
        result :
        (result = cons(first(prefix), result),
         prefix = rest(prefix),
         loop)
    };
    return recur;
  })(right, reverse(left));
};

var listToVector = function(source) {
  return (function loop(result, list) {
    var recur = loop;
    while ((recur === loop)) {
      recur = isEmpty(list) ?
        result :
        (result = (function() {
          result.push(first(list));
          return result;
        })(),
         list = rest(list),
         loop)
    };
    return recur;
  })(Array(), source);
};

var sortList = function(items, f) {
  return list.apply(list, listToVector(items).sort((f == null) ?
    f :
    function(a, b) {
      return f(a, b) ?
        0 :
        1;
    }));
};

exports.isEmpty = isEmpty;
exports.count = count;
exports.isList = isList;
exports.first = first;
exports.second = second;
exports.third = third;
exports.rest = rest;
exports.cons = cons;
exports.list = list;
exports.reverse = reverse;
exports.reduceList = reduceList;
exports.mapList = mapList;
exports.listToVector = listToVector;
exports.concatList = concatList;
exports.sortList = sortList;

});

require.define("/lib/reader.js",function(require,module,exports,__dirname,__filename,process){// Generated by LispyScript v0.2.1
var list = require("./list").list;
var isList = require("./list").isList;
var count = require("./list").count;
var isEmpty = require("./list").isEmpty;
var first = require("./list").first;
var second = require("./list").second;
var third = require("./list").third;
var rest = require("./list").rest;
var cons = require("./list").cons;
var rest = require("./list").rest;

var isOdd = require("./runtime").isOdd;
var dictionary = require("./runtime").dictionary;
var merge = require("./runtime").merge;
var keys = require("./runtime").keys;

var isSymbol = require("./ast").isSymbol;
var symbol = require("./ast").symbol;
var isKeyword = require("./ast").isKeyword;
var keyword = require("./ast").keyword;
var quote = require("./ast").quote;
var syntaxQuote = require("./ast").syntaxQuote;
var unquote = require("./ast").unquote;
var unquoteSplicing = require("./ast").unquoteSplicing;
var meta = require("./ast").meta;
var withMeta = require("./ast").withMeta;
var name = require("./ast").name;
var deref = require("./ast").deref;

var nil = void 0;

var PushbackReader = function(source, uri, index, buffer) {
  this.source = source;
  this.uri = uri;
  this.indexAtom = index;
  this.bufferAtom = buffer;
  this.columnAtom = 1;
  this.lineAtom = 1;
  return this;
};

var pushBackReader = function(source, uri) {
  return new PushbackReader(source, uri, 0, "");
};

var line = function(reader) {
  return (reader).lineAtom;
};

var column = function(reader) {
  return (reader).columnAtom;
};

var nextChar = function(reader) {
  return isEmpty(reader.bufferAtom) ?
    reader.source[reader.indexAtom] :
    reader.bufferAtom[0];
};

var readChar = function(reader) {
  (nextChar(reader) === "\n") ?
    (function() {
      reader.lineAtom = (line(reader) + 1);
      return reader.columnAtom = 1;
    })() :
    reader.columnAtom = (column(reader) + 1);
  return isEmpty(reader.bufferAtom) ?
    (function() {
      var index = reader.indexAtom;
      reader.indexAtom = (index + 1);
      return reader.source[index];
    })() :
    (function() {
      var buffer = reader.bufferAtom;
      reader.bufferAtom = buffer.substr(1);
      return buffer[0];
    })();
};

var unreadChar = function(reader, ch) {
  return ch ?
    (function() {
      (ch === "\n") ?
        reader.lineAtom = (reader.lineAtom - 1) :
        reader.columnAtom = (reader.columnAtom - 1);
      return reader.bufferAtom = ''.concat(ch, reader.bufferAtom);
    })() :
    void 0;
};

var isBreakingWhitespace = function(ch) {
  return ("\t\n\r ".indexOf(ch) >= 0);
};

var isWhitespace = function(ch) {
  return (isBreakingWhitespace(ch) || ("," === ch));
};

var isNumeric = function(ch) {
  return ("01234567890".indexOf(ch) >= 0);
};

var isCommentPrefix = function(ch) {
  return (";" === ch);
};

var isNumberLiteral = function(reader, initch) {
  return (isNumeric(initch) || ((("+" === initch) || ("-" === initch)) && isNumeric(nextChar(reader))));
};

var readerError = function(reader, message) {
  return (function() {
    var error = Error(''.concat(message, "\n", "line:", line(reader), "\n", "column:", column(reader)));
    error.line = line(reader);
    error.column = column(reader);
    error.uri = reader["uri"];
    return (function() {
      throw error;
    })();
  })();
};

var isMacroTerminating = function(ch) {
  return (!(ch === "#") && (!(ch === "'") && (!(ch === ":") && macros(ch))));
};

var readToken = function(reader, initch) {
  return (function loop(buffer, ch) {
    var recur = loop;
    while ((recur === loop)) {
      recur = ((ch == null) || (isWhitespace(ch) || isMacroTerminating(ch))) ?
        (function() {
          unreadChar(reader, ch);
          return buffer;
        })() :
        (buffer = buffer.concat(ch),
         ch = readChar(reader),
         loop)
    };
    return recur;
  })(initch, readChar(reader));
};

var skipLine = function(reader, _) {
  return (function loop() {
    var recur = loop;
    while ((recur === loop)) {
      recur = (function() {
        var ch = readChar(reader);
        return ((ch === "\n") || ((ch === "\r") || (ch == null))) ?
          reader :
          loop;
      })()
    };
    return recur;
  })();
};

var intPattern = /([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?/;

var ratioPattern = /([-+]?[0-9]+)\/([0-9]+)/;

var floatPattern = /([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?/;

var symbolPattern = /[:]?([^0-9\/].*\/)?([^0-9\/][^\/]*)/;

var reFind = function(re, s) {
  return (function() {
    var matches = re.exec(s);
    return !(matches == null) ?
      ((matches).length == 1) ?
        matches[0] :
        matches :
      void 0;
  })();
};

var matchInt = function(s) {
  return (function() {
    var groups = reFind(intPattern, s);
    var group3 = groups[2];
    return !((group3 == null) || ((group3).length < 1)) ?
      0 :
      (function() {
        var negate = ("-" === groups[1]) ?
          -1 :
          1;
        var a = groups[3] ? ([ groups[3], 10 ]) :
        groups[4] ? ([ groups[4], 16 ]) :
        groups[5] ? ([ groups[5], 8 ]) :
        groups[7] ? ([ groups[7], parseInt(groups[7]) ]) :
        "default" ? ([ nil, nil ]) :
        void 0;
        var n = a[0];
        var radix = a[1];
        return (n == null) ?
          nil :
          (negate * parseInt(n, radix));
      })();
  })();
};

var matchRatio = function(s) {
  return (function() {
    var groups = reFind(ratioPattern, s);
    var numinator = groups[1];
    var denominator = groups[2];
    return (parseInt(numinator) / parseInt(denominator));
  })();
};

var matchFloat = function(s) {
  return parseFloat(s);
};

var reMatches = function(pattern, source) {
  return (function() {
    var matches = pattern.exec(source);
    return (!(matches == null) && (matches[0] === source)) ?
      (function() {
        return ((matches).length == 1) ?
          matches[0] :
          matches;
      })() :
      void 0;
  })();
};

var matchNumber = function(s) {
  return reMatches(intPattern, s) ? (matchInt(s)) :
  reMatches(ratioPattern, s) ? (matchRatio(s)) :
  reMatches(floatPattern, s) ? (matchFloat(s)) :
  void 0;
};

var escapeCharMap = function(c) {
  return (c === "t") ? ("\t") :
  (c === "r") ? ("\r") :
  (c === "n") ? ("\n") :
  (c === "\\") ? ("\\") :
  (c === "\"") ? ("\"") :
  (c === "b") ? ("\b") :
  (c === "f") ? ("\f") :
  "else" ? (nil) :
  void 0;
};

var read2Chars = function(reader) {
  return ''.concat(readChar(reader), readChar(reader));
};

var read4Chars = function(reader) {
  return ''.concat(readChar(reader), readChar(reader), readChar(reader), readChar(reader));
};

var unicode2Pattern = /[0-9A-Fa-f]{2}/;

var unicode4Pattern = /[0-9A-Fa-f]{4}/;

var validateUnicodeEscape = function(unicodePattern, reader, escapeChar, unicodeStr) {
  return reMatches(unicodePattern, unicodeStr) ?
    unicodeStr :
    readerError(reader, ''.concat("Unexpected unicode escape ", "\\", escapeChar, unicodeStr));
};

var makeUnicodeChar = function(codeStr) {
  return (function() {
    var code = parseInt(codeStr, 16);
    return String.fromCharCode(code);
  })();
};

var escapeChar = function(buffer, reader) {
  return (function() {
    var ch = readChar(reader);
    var mapresult = escapeCharMap(ch);
    return mapresult ?
      mapresult :
      (ch === "\\x") ? (makeUnicodeChar(validateUnicodeEscape(unicode2Pattern, reader, ch, read2Chars(reader)))) :
      (ch === "\\u") ? (makeUnicodeChar(validateUnicodeEscape(unicode4Pattern, reader, ch, read4Chars(reader)))) :
      isNumeric(ch) ? (String.fromCharCode(ch)) :
      "else" ? (readerError(reader, ''.concat("Unexpected unicode escape ", "\\", ch))) :
      void 0;
  })();
};

var readPast = function(predicate, reader) {
  return (function loop(ch) {
    var recur = loop;
    while ((recur === loop)) {
      recur = predicate(ch) ?
        (ch = readChar(reader),
         loop) :
        ch
    };
    return recur;
  })(readChar(reader));
};

var readDelimitedList = function(delim, reader, isRecursive) {
  return (function loop(a) {
    var recur = loop;
    while ((recur === loop)) {
      recur = (function() {
        var ch = readPast(isWhitespace, reader);
        !ch ?
          readerError(reader, "EOF") :
          void 0;
        return (delim === ch) ?
          a :
          (function() {
            var macrofn = macros(ch);
            return macrofn ?
              (function() {
                var mret = macrofn(reader, ch);
                return (a = (mret === reader) ?
                  a :
                  a.concat([ mret ]),
                 loop);
              })() :
              (function() {
                unreadChar(reader, ch);
                return (function() {
                  var o = read(reader, true, nil, isRecursive);
                  return (a = (o === reader) ?
                    a :
                    a.concat([ o ]),
                   loop);
                })();
              })();
          })();
      })()
    };
    return recur;
  })([]);
};

var notImplemented = function(reader, ch) {
  return readerError(reader, ''.concat("Reader for ", ch, " not implemented yet"));
};

var maybeReadTaggedType = void 0;

var readDispatch = function(reader, _) {
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

var readUnmatchedDelimiter = function(rdr, ch) {
  return readerError(rdr, "Unmached delimiter ", ch);
};

var readList = function(reader) {
  return list.apply(list, readDelimitedList(")", reader, true));
};

var readComment = skipLine;

var readVector = function(reader) {
  return readDelimitedList("]", reader, true);
};

var readMap = function(reader) {
  return (function() {
    var items = readDelimitedList("}", reader, true);
    isOdd((items).length) ?
      readerError(reader, "Map literal must contain an even number of forms") :
      void 0;
    return dictionary.apply(dictionary, items);
  })();
};

var readNumber = function(reader, initch) {
  return (function loop(buffer, ch) {
    var recur = loop;
    while ((recur === loop)) {
      recur = ((ch == null) || (isWhitespace(ch) || macros(ch))) ?
        (function() {
          unreadChar(reader, ch);
          var match = matchNumber(buffer);
          return (match == null) ?
            readerError(reader, "Invalid number format [", buffer, "]") :
            match;
        })() :
        (buffer = ''.concat(buffer, ch),
         ch = readChar(reader),
         loop)
    };
    return recur;
  })(initch, readChar(reader));
};

var readString = function(reader) {
  return (function loop(buffer, ch) {
    var recur = loop;
    while ((recur === loop)) {
      recur = (ch == null) ? (readerError(reader, "EOF while reading string")) :
      ("\\" === ch) ? ((buffer = ''.concat(buffer, escapeChar(buffer, reader)),
       ch = readChar(reader),
       loop)) :
      ("\"" === ch) ? (buffer) :
      "default" ? ((buffer = ''.concat(buffer, ch),
       ch = readChar(reader),
       loop)) :
      void 0
    };
    return recur;
  })("", readChar(reader));
};

var readUnquote = function(reader) {
  return (function() {
    var ch = readChar(reader);
    return !ch ?
      readerError(reader, "EOF while reading character") :
      (ch === "@") ?
        list(unquoteSplicing, read(reader, true, nil, true)) :
        (function() {
          unreadChar(reader, ch);
          return list(unquote, read(reader, true, nil, true));
        })();
  })();
};

var specialSymbols = function(text, notFound) {
  return (text === "nil") ? (nil) :
  (text === "true") ? (true) :
  (text === "false") ? (false) :
  "else" ? (notFound) :
  void 0;
};

var readSymbol = function(reader, initch) {
  return (function() {
    var token = readToken(reader, initch);
    return (token.indexOf("/") >= 0) ?
      symbol(token.substr(0, token.indexOf("/")), token.substr((token.indexOf("/") + 1), (token).length)) :
      specialSymbols(token, symbol(token));
  })();
};

var readKeyword = function(reader, initch) {
  return (function() {
    var token = readToken(reader, readChar(reader));
    var a = reMatches(symbolPattern, token);
    var token = a[0];
    var ns = a[1];
    var name = a[2];
    return ((!(ns === undefined) && (ns.substring(((ns).length - 2), (ns).length) === ":/")) || ((name[((name).length - 1)] === ":") || !(token.indexOf("::", 1) == -1))) ?
      readerError(reader, "Invalid token: ", token) :
      (!(ns == null) && ((ns).length > 0)) ?
        keyword(ns.substring(0, ns.indexOf("/")), name) :
        keyword(token);
  })();
};

var desugarMeta = function(f) {
  return isSymbol(f) ? (dictionary(keyword("tag"), f)) :
  (Object.prototype.toString.call(f) === '[object String]') ? (dictionary(keyword("tag"), f)) :
  isKeyword(f) ? (dictionary(f, true)) :
  "else" ? (f) :
  void 0;
};

var wrappingReader = function(prefix) {
  return function(reader) {
    return list(prefix, read(reader, true, nil, true));
  };
};

var throwingReader = function(msg) {
  return function(reader) {
    return readerError(reader, msg);
  };
};

var readMeta = function(reader, _) {
  return (function() {
    var m = desugarMeta(read(reader, true, nil, true));
    !(m && (typeof(m) === "object")) ?
      readerError(reader, "Metadata must be Symbol, Keyword, String or Map") :
      void 0;
    return (function() {
      var o = read(reader, true, nil, true);
      return (o && (typeof(o) === "object")) ?
        withMeta(o, merge(meta(o), m)) :
        readerError(reader, "Metadata can only be applied to IWithMetas");
    })();
  })();
};

var readSet = function(reader, _) {
  return list.apply(list, [ symbol("set") ].concat(readDelimitedList("}", reader, true)));
};

var readRegex = function(reader, ch) {
  return _rePattern(readString(reader, ch));
};

var readDiscard = function(reader, _) {
  read(reader, true, nil, true);
  return reader;
};

var macros = function(c) {
  return (c === "\"") ? (readString) :
  (c === "\:") ? (readKeyword) :
  (c === "\;") ? (readComment) :
  (c === "\'") ? (wrappingReader(quote)) :
  (c === "\@") ? (wrappingReader(deref)) :
  (c === "\^") ? (readMeta) :
  (c === "\`") ? (wrappingReader(syntaxQuote)) :
  (c === "\~") ? (readUnquote) :
  (c === "\(") ? (readList) :
  (c === "\)") ? (readUnmatchedDelimiter) :
  (c === "\[") ? (readVector) :
  (c === "\]") ? (readUnmatchedDelimiter) :
  (c === "\{") ? (readMap) :
  (c === "\}") ? (readUnmatchedDelimiter) :
  (c === "\\") ? (readChar) :
  (c === "\%") ? (notImplemented) :
  (c === "\#") ? (readDispatch) :
  "else" ? (nil) :
  void 0;
};

var dispatchMacros = function(s) {
  return (s === "{") ? (readSet) :
  (s === "<") ? (throwingReader("Unreadable form")) :
  (s === "\"") ? (readRegex) :
  (s === "!") ? (readComment) :
  (s === "_") ? (readDiscard) :
  "else" ? (nil) :
  void 0;
};

var read = function(reader, eofIsError, sentinel, isRecursive) {
  return (function loop() {
    var recur = loop;
    while ((recur === loop)) {
      recur = (function() {
        var ch = readChar(reader);
        return (ch == null) ? (eofIsError ?
          readerError(reader, "EOF") :
          sentinel) :
        isWhitespace(ch) ? (loop) :
        isCommentPrefix(ch) ? (read(readComment(reader, ch), eofIsError, sentinel, isRecursive)) :
        "else" ? ((function() {
          var f = macros(ch);
          var res = f ? (f(reader, ch)) :
          isNumberLiteral(reader, ch) ? (readNumber(reader, ch)) :
          "else" ? (readSymbol(reader, ch)) :
          void 0;
          return (res === reader) ?
            loop :
            res;
        })()) :
        void 0;
      })()
    };
    return recur;
  })();
};

var readFromString = function(source, uri) {
  return (function() {
    var reader = pushBackReader(source, uri);
    return read(reader, true, nil, false);
  })();
};

var readUuid = function(uuid) {
  return (Object.prototype.toString.call(uuid) === '[object String]') ?
    list(symbol("new"), symbol("UUID"), uuid) :
    readerError(nil, "UUID literal expects a string as its representation.");
};

var readQueue = function(items) {
  return (Object.prototype.toString.call(items) === '[object Array]') ?
    list(symbol("new"), symbol("PersistentQueue"), items) :
    readerError(nil, "Queue literal expects a vector for its elements.");
};

var __tagTable__ = dictionary("uuid", readUuid, "queue", readQueue);

var maybeReadTaggedType = function(reader, initch) {
  return (function() {
    var tag = readSymbol(reader, initch);
    var pfn = __tagTable__[name(tag)];
    return pfn ?
      pfn(read(reader, true, nil, false)) :
      readerError(reader, ''.concat("Could not find tag parser for ", name(tag), " in ", ''.concat(keys(__tagTable__))));
  })();
};

exports.read = read;
exports.readFromString = readFromString;

});

require.define("/lib/ast.js",function(require,module,exports,__dirname,__filename,process){// Generated by LispyScript v0.2.1
var list = require("./list").list;
var isList = require("./list").isList;
var first = require("./list").first;

var withMeta = function(value, metadata) {
  value.metadata = metadata;
  return value;
};

var meta = function(value) {
  return (value && (typeof(value) === "object")) ?
    (value).metadata :
    void 0;
};

var isAtom = function(form) {
  return ((Object.prototype.toString.call(form) === '[object Number]') || ((Object.prototype.toString.call(form) === '[object String]') || ((typeof(form) === "boolean") || ((form == null) || (isKeyword(form) || (isSymbol(form) || (isList(form) && isEmpty(form))))))));
};

var symbol = function(ns, id) {
  return isSymbol(ns) ? (ns) :
  isKeyword(ns) ? ("\uFEFF".concat(name(ns))) :
  "else" ? ((id == null) ?
    "\uFEFF".concat(ns) :
    "\uFEFF".concat(ns, "/", id)) :
  void 0;
};

var isSymbol = function(x) {
  return ((Object.prototype.toString.call(x) === '[object String]') && (x.charAt(0) === "\uFEFF"));
};

var isSymbolIdentical = function(actual, expected) {
  return (actual === expected);
};

var isKeyword = function(x) {
  return ((Object.prototype.toString.call(x) === '[object String]') && (x.charAt(0) === "\uA789"));
};

var keyword = function(ns, id) {
  return isKeyword(ns) ? (ns) :
  isSymbol(ns) ? ("\uA789".concat(name(ns))) :
  "else" ? ((id == null) ?
    "\uA789".concat(ns) :
    "\uA789".concat(ns, "/", id)) :
  void 0;
};

var name = function(value) {
  return (isKeyword(value) || isSymbol(value)) ? ((((value).length > 2) && (value.indexOf("/") >= 0)) ?
    value.substr((value.indexOf("/") + 1)) :
    value.substr(1)) :
  (Object.prototype.toString.call(value) === '[object String]') ? (value) :
  void 0;
};

var gensym = function(prefix) {
  return symbol(''.concat((prefix == null) ?
    "G__" :
    prefix, gensym.base = (gensym.base + 1)));
};

gensym.base = 0;

var unquote = symbol("unquote");

var unquoteSplicing = symbol("unquote-splicing");

var syntaxQuote = symbol("syntax-quote");

var quote = symbol("quote");

var deref = symbol("deref");

var set = symbol("set");

var isUnquote = function(form) {
  return (isList(form) && (first(form) === unquote));
};

var isUnquoteSplicing = function(form) {
  return (isList(form) && (first(form) === unquoteSplicing));
};

var isQuote = function(form) {
  return (isList(form) && isSymbolIdentical(first(form), quote));
};

var isSyntaxQuote = function(form) {
  return (isList(form) && (first(form) === syntaxQuote));
};

exports.meta = meta;
exports.withMeta = withMeta;
exports.isAtom = isAtom;
exports.isSymbol = isSymbol;
exports.symbol = symbol;
exports.isSymbolIdentical = isSymbolIdentical;
exports.isKeyword = isKeyword;
exports.keyword = keyword;
exports.gensym = gensym;
exports.name = name;
exports.deref = deref;
exports.set = set;
exports.isUnquote = isUnquote;
exports.unquote = unquote;
exports.isUnquoteSplicing = isUnquoteSplicing;
exports.unquoteSplicing = unquoteSplicing;
exports.isQuote = isQuote;
exports.quote = quote;
exports.isSyntaxQuote = isSyntaxQuote;
exports.syntaxQuote = syntaxQuote;

});

require.define("/lib/compiler.js",function(require,module,exports,__dirname,__filename,process){// Generated by LispyScript v0.2.1
var readFromString = require("./reader").readFromString;

var meta = require("./ast").meta;
var withMeta = require("./ast").withMeta;
var isSymbol = require("./ast").isSymbol;
var symbol = require("./ast").symbol;
var isKeyword = require("./ast").isKeyword;
var keyword = require("./ast").keyword;
var isUnquote = require("./ast").isUnquote;
var unquote = require("./ast").unquote;
var isUnquoteSplicing = require("./ast").isUnquoteSplicing;
var unquoteSplicing = require("./ast").unquoteSplicing;
var isQuote = require("./ast").isQuote;
var quote = require("./ast").quote;
var isSyntaxQuote = require("./ast").isSyntaxQuote;
var syntaxQuote = require("./ast").syntaxQuote;
var name = require("./ast").name;
var gensym = require("./ast").gensym;
var deref = require("./ast").deref;
var set = require("./ast").set;
var isAtom = require("./ast").isAtom;
var isSymbolIdentical = require("./ast").isSymbolIdentical;

var isEmpty = require("./list").isEmpty;
var count = require("./list").count;
var isList = require("./list").isList;
var list = require("./list").list;
var first = require("./list").first;
var second = require("./list").second;
var third = require("./list").third;
var rest = require("./list").rest;
var cons = require("./list").cons;
var reverse = require("./list").reverse;
var mapList = require("./list").mapList;
var concatList = require("./list").concatList;
var reduceList = require("./list").reduceList;
var listToVector = require("./list").listToVector;

var isOdd = require("./runtime").isOdd;
var isDictionary = require("./runtime").isDictionary;
var dictionary = require("./runtime").dictionary;
var merge = require("./runtime").merge;
var keys = require("./runtime").keys;
var isContainsVector = require("./runtime").isContainsVector;
var mapDictionary = require("./runtime").mapDictionary;

var nil = void 0;

var isSelfEvaluating = function(form) {
  return ((Object.prototype.toString.call(form) === '[object Number]') || (((Object.prototype.toString.call(form) === '[object String]') && !isSymbol(form)) || ((typeof(form) === "boolean") || ((form == null) || isKeyword(form)))));
};

var __macros__ = {};

var executeMacro = function(name, form) {
  return __macros__[name](form);
};

var installMacro = function(name, macro) {
  return __macros__[name] = macro;
};

var isMacro = function(name) {
  return (isSymbol(name) && (__macros__[name] && true));
};

var makeMacro = function(pattern, body) {
  return (function() {
    var x = gensym();
    var program = compile(macroexpand(cons(symbol("fn"), cons(pattern, body))));
    var macro = eval(''.concat("(", program, ")"));
    return function(form) {
      return (function() {
        try {
          return macro.apply(macro, listToVector(rest(form)))
        } catch (error) {
          return (function() {
            throw compilerError(form, error.message);
          })()
        };
      })();
    };
  })();
};

installMacro(symbol("defmacro"), function(form) {
  return (function() {
    var signature = rest(form);
    return (function() {
      var name = first(signature);
      var pattern = second(signature);
      var body = rest(rest(signature));
      return installMacro(name, makeMacro(pattern, body));
    })();
  })();
});

var __specials__ = {};

var installSpecial = function(name, f, validator) {
  return __specials__[name] = function(form) {
    validator ?
      validator(form) :
      void 0;
    return f(rest(form));
  };
};

var isSpecial = function(name) {
  return (isSymbol(name) && (__specials__[name] && true));
};

var executeSpecial = function(name, form) {
  return __specials__[name](form);
};

var opt = function(argument, fallback) {
  return ((argument == null) || isEmpty(argument)) ?
    fallback :
    first(argument);
};

var applyForm = function(fnName, form, isQuoted) {
  return cons(fnName, isQuoted ?
    mapList(form, function(e) {
      return list(quote, e);
    }) :
    form, form);
};

var applyUnquotedForm = function(fnName, form) {
  return cons(fnName, mapList(form, function(e) {
    return isUnquote(e) ?
      second(e) :
      (isList(e) && isKeyword(first(e))) ?
        list(syntaxQuote, second(e)) :
        list(syntaxQuote, e);
  }));
};

var splitSplices = function(form, fnName) {
  var makeSplice = function(form) {
    return (isSelfEvaluating(form) || isSymbol(form)) ?
      applyUnquotedForm(fnName, list(form)) :
      applyUnquotedForm(fnName, form);
  };
  return (function loop(nodes, slices, acc) {
    var recur = loop;
    while ((recur === loop)) {
      recur = isEmpty(nodes) ?
        reverse(isEmpty(acc) ?
          slices :
          cons(makeSplice(reverse(acc)), slices)) :
        (function() {
          var node = first(nodes);
          return isUnquoteSplicing(node) ?
            (nodes = rest(nodes),
             slices = cons(second(node), isEmpty(acc) ?
               slices :
               cons(makeSplice(reverse(acc)), slices)),
             acc = list(),
             loop) :
            (nodes = rest(nodes),
             slices = slices,
             acc = cons(node, acc),
             loop);
        })()
    };
    return recur;
  })(form, list(), list());
};

var syntaxQuoteSplit = function(appendName, fnName, form) {
  return (function() {
    var slices = splitSplices(form, fnName);
    return (count(slices) == 1) ?
      first(slices) :
      applyForm(appendName, slices);
  })();
};

var compileObject = function(form) {
  return isKeyword(form) ? (compile(list(symbol("::compile:keyword"), form))) :
  isSymbol(form) ? (compile(list(symbol("::compile:symbol"), form))) :
  (Object.prototype.toString.call(form) === '[object Number]') ? (compile(list(symbol("::compile:number"), form))) :
  (Object.prototype.toString.call(form) === '[object String]') ? (compile(list(symbol("::compile:string"), form))) :
  (typeof(form) === "boolean") ? (compile(list(symbol("::compile:boolean"), form))) :
  (form == null) ? (compile(list(symbol("::compile:nil"), form))) :
  (Object.prototype.toString.call(form) === '[object Array]') ? (compile(applyForm(symbol("vector"), list.apply(list, form)))) :
  isList(form) ? (compile(applyForm(symbol("list"), form))) :
  isDictionary(form) ? (compileDictionary(form)) :
  void 0;
};

var compileReference = function(form) {
  var id = name(form);
  id = id.split("*").join("_");
  id = id.split("->").join("-to-");
  id = id.split("!").join("");
  id = id.split("%").join("$");
  id = (id.substr(-1) === "?") ?
    ''.concat("is-", id.substr(0, ((id).length - 1))) :
    id;
  id = id.split("-").reduce(function(result, key) {
    return ''.concat(result, result ?
      ''.concat(key[0].toUpperCase(), key.substr(1)) :
      key);
  }, "");
  return id;
};

var compileSyntaxQuoted = function(form) {
  return isList(form) ? (compile(syntaxQuoteSplit(symbol("concat-list"), symbol("list"), form))) :
  (Object.prototype.toString.call(form) === '[object Array]') ? (compile(syntaxQuoteSplit(symbol("concat-vector"), symbol("vector"), list.apply(list, form)))) :
  isDictionary(form) ? (compile(syntaxQuoteSplit(symbol("merge"), symbol("dictionary"), form))) :
  "else" ? (compileObject(form)) :
  void 0;
};

var compile = function(form) {
  return isSelfEvaluating(form) ? (compileObject(form)) :
  isSymbol(form) ? (compileReference(form)) :
  (Object.prototype.toString.call(form) === '[object Array]') ? (compileObject(form)) :
  isDictionary(form) ? (compileObject(form)) :
  isList(form) ? ((function() {
    var head = first(form);
    return isQuote(form) ? (compileObject(second(form))) :
    isSyntaxQuote(form) ? (compileSyntaxQuoted(second(form))) :
    isSpecial(head) ? (executeSpecial(head, form)) :
    "else" ? ((function() {
      return !(isSymbol(head) || isList(head)) ?
        (function() {
          throw ''.concat("operator is not a procedure: ", head);
        })() :
        compile(list(symbol("::compile:invoke"), head, rest(form)));
    })()) :
    void 0;
  })()) :
  void 0;
};

var compileProgram = function(forms) {
  return (function loop(result, expressions) {
    var recur = loop;
    while ((recur === loop)) {
      recur = isEmpty(expressions) ?
        result :
        (result = ''.concat(result, isEmpty(result) ?
          "" :
          ";\n\n", compile(macroexpand(first(expressions)))),
         expressions = rest(expressions),
         loop)
    };
    return recur;
  })("", forms);
};

var macroexpand1 = function(form) {
  return isList(form) ?
    (function() {
      var op = first(form);
      var id = name(op);
      return isSpecial(op) ? (form) :
      isMacro(op) ? (executeMacro(op, form)) :
      (isSymbol(op) && !(id === ".")) ? ((id.charAt(0) === ".") ?
        (count(form) < 2) ?
          (function() {
            throw Error("Malformed member expression, expecting (.member target ...)");
          })() :
          cons(symbol("."), cons(second(form), cons(symbol(id.substr(1)), rest(rest(form))))) :
        (id.charAt(((id).length - 1)) === ".") ?
          cons(symbol("new"), cons(symbol(id.substr(0, ((id).length - 1))), rest(form))) :
          form) :
      "else" ? (form) :
      void 0;
    })() :
    form;
};

var macroexpand = function(form) {
  return (function loop(original, expanded) {
    var recur = loop;
    while ((recur === loop)) {
      recur = (original === expanded) ?
        original :
        (original = expanded,
         expanded = macroexpand1(expanded),
         loop)
    };
    return recur;
  })(form, macroexpand1(form));
};

var compileTemplate = function(form) {
  var indentPattern = /\n *$/;
  var lineBreakPatter = RegExp("\n", "g");
  var getIndentation = function(code) {
    return (function() {
      var match = code.match(indentPattern);
      return ((match && match[0]) || "\n");
    })();
  };
  return (function loop(code, parts, values) {
    var recur = loop;
    while ((recur === loop)) {
      recur = ((parts).length > 1) ?
        (code = ''.concat(code, parts[0], ''.concat("", first(values)).replace(lineBreakPatter, getIndentation(parts[0]))),
         parts = parts.slice(1),
         values = rest(values),
         loop) :
        code.concat(parts[0])
    };
    return recur;
  })("", first(form).split("~{}"), rest(form));
};

var compileDef = function(form) {
  return compileTemplate(list("var ~{}", compile(cons(symbol("set!"), form))));
};

var compileIfElse = function(form) {
  return compileTemplate(list("~{} ?\n  ~{} :\n  ~{}", compile(macroexpand(first(form))), compile(macroexpand(second(form))), compile(macroexpand(third(form)))));
};

var compileDictionary = function(form) {
  return (function() {
    var body = (function loop(body, names) {
      var recur = loop;
      while ((recur === loop)) {
        recur = isEmpty(names) ?
          body :
          (body = ''.concat((body == null) ?
            "" :
            ''.concat(body, ",\n"), compileTemplate(list("~{}: ~{}", name(first(names)), compile(macroexpand(form[first(names)]))))),
           names = rest(names),
           loop)
      };
      return recur;
    })(nil, keys(form));
    return (body == null) ?
      "{}" :
      compileTemplate(list("{\n  ~{}\n}", body));
  })();
};

var desugarFnName = function(form) {
  return isSymbol(first(form)) ?
    form :
    cons(nil, form);
};

var desugarFnDoc = function(form) {
  return (Object.prototype.toString.call(second(form)) === '[object String]') ?
    form :
    cons(first(form), cons(nil, rest(form)));
};

var desugarFnAttrs = function(form) {
  return isDictionary(third(form)) ?
    form :
    cons(first(form), cons(second(form), cons(nil, rest(rest(form)))));
};

var desugarBody = function(form) {
  return isList(third(form)) ?
    form :
    withMeta(cons(first(form), cons(second(form), list(rest(rest(form))))), meta(third(form)));
};

var compileFnParams = function(params) {
  return isContainsVector(params, symbol("&")) ?
    params.slice(0, params.indexOf(symbol("&"))).map(compile).join(", ") :
    params.map(compile).join(", ");
};

var compileDesugaredFn = function(name, doc, attrs, params, body) {
  return compileTemplate((name == null) ?
    list("function(~{}) {\n  ~{}\n}", compileFnParams(params), compileFnBody(body, params)) :
    list("function ~{}(~{}) {\n  ~{}\n}", compile(name), compileFnParams(params), compileFnBody(body, params)));
};

var compileStatements = function(form, prefix) {
  return (function loop(result, expression, expressions) {
    var recur = loop;
    while ((recur === loop)) {
      recur = isEmpty(expressions) ?
        ''.concat(result, (prefix == null) ?
          "" :
          prefix, compile(macroexpand(expression)), ";") :
        (result = ''.concat(result, compile(macroexpand(expression)), ";\n"),
         expression = first(expressions),
         expressions = rest(expressions),
         loop)
    };
    return recur;
  })("", first(form), rest(form));
};

var compileFnBody = function(form, params) {
  return ((Object.prototype.toString.call(params) === '[object Array]') && isContainsVector(params, symbol("&"))) ?
    compileStatements(cons(list(symbol("def"), params[(params.indexOf(symbol("&")) + 1)], list(symbol("Array.prototype.slice.call"), symbol("arguments"), params.indexOf(symbol("&")))), form), "return ") :
    compileStatements(form, "return ");
};

var compileFn = function(form) {
  return (function() {
    var signature = desugarFnAttrs(desugarFnDoc(desugarFnName(form)));
    var name = first(signature);
    var doc = second(signature);
    var attrs = third(signature);
    var params = third(rest(signature));
    var body = rest(rest(rest(rest(signature))));
    return compileDesugaredFn(name, doc, attrs, params, body);
  })();
};

var compileFnInvoke = function(form) {
  return compileTemplate(list(isList(first(form)) ?
    "(~{})(~{})" :
    "~{}(~{})", compile(first(form)), compileGroup(second(form))));
};

var compileGroup = function(form, wrap) {
  return wrap ?
    ''.concat("(", compileGroup(form), ")") :
    listToVector(mapList(mapList(form, macroexpand), compile)).join(", ");
};

var compileDo = function(form) {
  return compile(list(cons(symbol("fn"), cons(Array(), form))));
};

var defineBindings = function(bindings) {
  return (function loop(defs, bindings) {
    var recur = loop;
    while ((recur === loop)) {
      recur = ((bindings).length == 0) ?
        reverse(defs) :
        (defs = cons(list(symbol("def"), bindings[0], bindings[1]), defs),
         bindings = bindings.slice(2),
         loop)
    };
    return recur;
  })(list(), bindings);
};

var compileLet = function(form) {
  return compile(cons(symbol("do"), concatList(defineBindings(first(form)), rest(form))));
};

var compileThrow = function(form) {
  return compileTemplate(list("(function() { throw ~{}; })()", compile(first(form))));
};

var compileSet = function(form) {
  return compileTemplate(list("~{} = ~{}", compile(macroexpand(first(form))), compile(macroexpand(second(form)))));
};

var compileVector = function(form) {
  return compileTemplate(list("[~{}]", compileGroup(form)));
};

var compileTry = function(form) {
  return (function loop(tryExprs, catchExprs, finallyExprs, exprs) {
    var recur = loop;
    while ((recur === loop)) {
      recur = isEmpty(exprs) ?
        isEmpty(catchExprs) ?
          compileTemplate(list("(function() {\ntry {\n  ~{}\n} finally {\n  ~{}\n}})()", compileFnBody(tryExprs), compileFnBody(finallyExprs))) :
          isEmpty(finallyExprs) ?
            compileTemplate(list("(function() {\ntry {\n  ~{}\n} catch (~{}) {\n  ~{}\n}})()", compileFnBody(tryExprs), compile(first(catchExprs)), compileFnBody(rest(catchExprs)))) :
            compileTemplate(list("(function() {\ntry {\n  ~{}\n} catch (~{}) {\n  ~{}\n} finally {\n  ~{}\n}})()", compileFnBody(tryExprs), compile(first(catchExprs)), compileFnBody(rest(catchExprs)), compileFnBody(finallyExprs))) :
        isSymbolIdentical(first(first(exprs)), symbol("catch")) ?
          (tryExprs = tryExprs,
           catchExprs = rest(first(exprs)),
           finallyExprs = finallyExprs,
           exprs = rest(exprs),
           loop) :
          isSymbolIdentical(first(first(exprs)), symbol("finally")) ?
            (tryExprs = tryExprs,
             catchExprs = catchExprs,
             finallyExprs = rest(first(exprs)),
             exprs = rest(exprs),
             loop) :
            (tryExprs = cons(first(exprs), tryExprs),
             catchExprs = catchExprs,
             finallyExprs = finallyExprs,
             exprs = rest(exprs),
             loop)
    };
    return recur;
  })(list(), list(), list(), reverse(form));
};

var compileProperty = function(form) {
  return (name(second(form))[0] === "-") ?
    compileTemplate(list(isList(first(form)) ?
      "(~{}).~{}" :
      "~{}.~{}", compile(macroexpand(first(form))), compile(macroexpand(second(form))))) :
    compile(cons(symbol(''.concat(compile(macroexpand(first(form))), ".", compile(macroexpand(second(form))))), rest(rest(form))));
};

var compileApply = function(form) {
  return compile(list(symbol("."), first(form), symbol("apply"), first(form), second(form)));
};

var compileNew = function(form) {
  return compileTemplate(list("new ~{}", compile(form)));
};

var compileCompoundAccessor = function(form) {
  return compileTemplate(list("~{}[~{}]", compile(macroexpand(first(form))), compile(macroexpand(second(form)))));
};

var compileStr = function(form) {
  return isEmpty(form) ?
    compileStr(list("")) :
    compile(cons(symbol("+"), form));
};

var compileInstance = function(form) {
  return compileTemplate(list("~{} instanceof ~{}", compile(macroexpand(second(form))), compile(macroexpand(first(form)))));
};

var compileIsNil = function(form) {
  return compile(list(symbol("identical?"), list(symbol("typeof"), first(form)), "undefined"));
};

var compileNot = function(form) {
  return compileTemplate(list("!~{}", compile(macroexpand(first(form)))));
};

var compileLoop = function(form) {
  return (function() {
    var bindings = first(form);
    var body = rest(form);
    return compile(list(cons(symbol("fn"), cons(symbol("loop"), cons(Array(), concatList(defineBindings(bindings), compileRecur(bindings, body)))))));
  })();
};

var rebindBindings = function(oldBindings, newValues) {
  return (function loop(result, bindings, values) {
    var recur = loop;
    while ((recur === loop)) {
      recur = isEmpty(bindings) ?
        reverse(result) :
        (result = cons(list(symbol("set!"), first(bindings), first(values)), result),
         bindings = rest(rest(bindings)),
         values = rest(values),
         loop)
    };
    return recur;
  })(list(), oldBindings, newValues);
};

var expandRecur = function(bindings, body) {
  return mapList(body, function(form) {
    return isList(form) ?
      (first(form) === symbol("recur")) ?
        list(symbol("::raw"), compileGroup(concatList(rebindBindings(bindings, rest(form)), list(symbol("loop"))), true)) :
        expandRecur(bindings, form) :
      form;
  });
};

var compileRecur = function(bindings, body) {
  return list(list(symbol("::raw"), compileTemplate(list("\nvar recur = loop;\nwhile (recur === loop) {\n  recur = ~{}\n}", compileStatements(expandRecur(bindings, body))))), symbol("recur"));
};

var compileRaw = function(form) {
  return first(form);
};

installSpecial(symbol("set!"), compileSet);

installSpecial(symbol("get"), compileCompoundAccessor);

installSpecial(symbol("aget"), compileCompoundAccessor);

installSpecial(symbol("def"), compileDef);

installSpecial(symbol("if"), compileIfElse);

installSpecial(symbol("do"), compileDo);

installSpecial(symbol("do*"), compileStatements);

installSpecial(symbol("fn"), compileFn);

installSpecial(symbol("let"), compileLet);

installSpecial(symbol("throw"), compileThrow);

installSpecial(symbol("vector"), compileVector);

installSpecial(symbol("try"), compileTry);

installSpecial(symbol("."), compileProperty);

installSpecial(symbol("apply"), compileApply);

installSpecial(symbol("new"), compileNew);

installSpecial(symbol("instance?"), compileInstance);

installSpecial(symbol("not"), compileNot);

installSpecial(symbol("nil?"), compileIsNil);

installSpecial(symbol("str"), compileStr);

installSpecial(symbol("loop"), compileLoop);

installSpecial(symbol("::raw"), compileRaw);

installSpecial(symbol("::compile:invoke"), compileFnInvoke);

installSpecial(symbol("::compile:keyword"), function(form) {
  return ''.concat("\"", name(first(form)), "\"");
});

installSpecial(symbol("::compile:reference"), function(form) {
  return name(compileReference(first(form)));
});

installSpecial(symbol("::compile:symbol"), function(form) {
  return compile(list(symbol("symbol"), name(first(form))));
});

installSpecial(symbol("::compile:nil"), function(form) {
  return "void(0)";
});

installSpecial(symbol("::compile:number"), function(form) {
  return first(form);
});

installSpecial(symbol("::compile:boolean"), function(form) {
  return (first(form) === true) ?
    "true" :
    "false";
});

installSpecial(symbol("::compile:string"), function(form) {
  string = first(form);
  string = string.replace(RegExp("\\\\", "g"), "\\\\");
  string = string.replace(RegExp("\n", "g"), "\\n");
  string = string.replace(RegExp("\r", "g"), "\\r");
  string = string.replace(RegExp("\t", "g"), "\\t");
  string = string.replace(RegExp("\"", "g"), "\\\"");
  return ''.concat("\"", string, "\"");
});

var installNative = function(alias, operator, validator, fallback) {
  return installSpecial(alias, function(form) {
    return reduceList(mapList(form, function(operand) {
      return compileTemplate(list(isList(operand) ?
        "(~{})" :
        "~{}", compile(macroexpand(operand))));
    }), function(left, right) {
      return compileTemplate(list("~{} ~{} ~{}", left, name(operator), right));
    }, isEmpty(form) ?
      fallback :
      nil);
  }, validator);
};

var installOperator = function(alias, operator) {
  return installSpecial(alias, function(form) {
    return (function loop(result, left, right, operands) {
      var recur = loop;
      while ((recur === loop)) {
        recur = isEmpty(operands) ?
          ''.concat(result, compileTemplate(list("~{} ~{} ~{}", compile(macroexpand(left)), name(operator), compile(macroexpand(right))))) :
          (result = ''.concat(result, compileTemplate(list("~{} ~{} ~{} && ", compile(macroexpand(left)), name(operator), compile(macroexpand(right))))),
           left = right,
           right = first(operands),
           operands = rest(operands),
           loop)
      };
      return recur;
    })("", first(form), second(form), rest(rest(form)));
  }, verifyTwo);
};

var compilerError = function(form, message) {
  return (function() {
    var error = Error(''.concat(message));
    error.line = 1;
    return (function() {
      throw error;
    })();
  })();
};

var verifyTwo = function(form) {
  return (isEmpty(rest(form)) || isEmpty(rest(rest(form)))) ?
    (function() {
      throw compilerError(form, ''.concat(first(form), " form requires at least two operands"));
    })() :
    void 0;
};

installNative(symbol("+"), symbol("+"), nil, 0);

installNative(symbol("-"), symbol("-"), nil, "NaN");

installNative(symbol("*"), symbol("*"), nil, 1);

installNative(symbol("/"), symbol("/"), verifyTwo);

installNative(symbol("mod"), symbol("%"), verifyTwo);

installNative(symbol("inc"), symbol("++"));

installNative(symbol("dec"), symbol("--"));

installNative(symbol("and"), symbol("&&"));

installNative(symbol("or"), symbol("||"));

installOperator(symbol("="), symbol("=="));

installOperator(symbol("not="), symbol("!="));

installOperator(symbol("=="), symbol("=="));

installOperator(symbol("identical?"), symbol("==="));

installOperator(symbol(">"), symbol(">"));

installOperator(symbol(">="), symbol(">="));

installOperator(symbol("<"), symbol("<"));

installOperator(symbol("<="), symbol("<="));

installNative(symbol("bit-and"), symbol("&"), verifyTwo);

installNative(symbol("bit-or"), symbol("|"), verifyTwo);

installNative(symbol("bit-xor"), symbol("^"));

installNative(symbol("bit-not "), symbol("~"), verifyTwo);

installNative(symbol("bit-shift-left"), symbol("<<"), verifyTwo);

installNative(symbol("bit-shift-right"), symbol(">>"), verifyTwo);

installNative(symbol("bit-shift-right-zero-fil"), symbol(">>>"), verifyTwo);

var defmacroFromString = function(macroSource) {
  return compileProgram(macroexpand(readFromString(''.concat("(do ", macroSource, ")"))));
};

defmacroFromString("\n(defmacro cond\n  \"Takes a set of test/expr pairs. It evaluates each test one at a\n  time.  If a test returns logical true, cond evaluates and returns\n  the value of the corresponding expr and doesn't evaluate any of the\n  other tests or exprs. (cond) returns nil.\"\n  ;{:added \"1.0\"}\n  [clauses]\n  (set! clauses (apply list arguments))\n  (if (not (empty? clauses))\n    (list 'if (first clauses)\n          (if (empty? (rest clauses))\n            (throw (Error \"cond requires an even number of forms\"))\n            (second clauses))\n          (cons 'cond (rest (rest clauses))))))\n\n(defmacro defn\n   \"Same as (def name (fn [params* ] exprs*)) or\n   (def name (fn ([params* ] exprs*)+)) with any doc-string or attrs added\n   to the var metadata\"\n  ;{:added \"1.0\", :special-form true ]}\n  [name]\n  (def body (apply list (Array.prototype.slice.call arguments 1)))\n  `(def ~name (fn ~name ~@body)))\n\n(defmacro import\n  \"Helper macro for importing node modules\"\n  [imports path]\n  (if (symbol? imports)\n    `(def ~imports (require ~path))\n    (loop [form '() names imports]\n      (if (empty? names)\n        `(do* ~@form)\n        (let [alias (first names)\n              id (symbol (str \".-\" (name alias)))]\n          (recur (cons `(def ~alias\n                          (~id (require ~path))) form)\n                 (rest names)))))))\n\n(defmacro export\n  \"Helper macro for exporting multiple / single value\"\n  [& names]\n  (if (empty? names)\n    nil\n    (if (empty? (rest names))\n      `(set! module.exports ~(first names))\n      (loop [form '() exports names]\n        (if (empty? exports)\n          `(do* ~@form)\n          (recur (cons `(set!\n                         (~(symbol (str \".-\" (name (first exports))))\n                           exports)\n                         ~(first exports))\n                       form)\n               (rest exports)))))))\n");

exports.isSelfEvaluating = isSelfEvaluating;
exports.compile = compile;
exports.compileProgram = compileProgram;
exports.macroexpand = macroexpand;
exports.macroexpand1 = macroexpand1;

});

require.define("/support/embed.js",function(require,module,exports,__dirname,__filename,process){// Generated by LispyScript v0.2.1
var dictionary = require("../lib/runtime").dictionary;

var rest = require("../lib/list").rest;

var readFromString = require("../lib/reader").readFromString;

var compileProgram = require("../lib/compiler").compileProgram;

var updatePreview = function(editor) {
  clearTimeout(updatePreview.id);
  return (function() {
    var code = editor.getValue();
    var source = ''.concat("(do ", code, ")");
    localStorage.buffer = code;
    return updatePreview.id = setTimeout(function() {
      return (function() {
        try {
          return (function() {
            editor.clearMarker((updatePreview.line || 1));
            return output.setValue(compileProgram(rest(readFromString(source))));
          })()
        } catch (error) {
          return (function() {
            updatePreview.line = error.line;
            return editor.setMarker((error.line || 0), ''.concat("<span title='", error.message, "'>●</span> %N%"));
          })()
        };
      })();
    }, 200);
  })();
};

var input = CodeMirror(document.getElementById("input"), dictionary("lineNumbers", true, "autoClearEmptyLines:", true, "tabSize", 2, "indentWithTabs", false, "electricChars", true, "autoClearEmptyLines", true, "mode", "clojure", "theme", "ambiance", "autofocus", true, "fixedGutter", true, "matchBrackets", true, "value", (localStorage.buffer || (document.getElementById("examples")).innerHTML), "onChange", updatePreview, "onCursorActivity", function() {
  input.setLineClass(hlLine, null, null);
  return hlLine = input.setLineClass((input.getCursor()).line, null, "activeline");
}, "onGutterClick", function() {
  return (function() {
    var output = document.getElementById("output");
    var input = document.getElementById("input");
    output.hidden = !output.hidden;
    return input.style.width = output.hidden ?
      "100%" :
      "50%";
  })();
}));

var hlLine = input.setLineClass(0, "activeline");

var output = CodeMirror(document.getElementById("output"), dictionary("lineNumbers", true, "fixedGutter", true, "matchBrackets", true, "mode", "javascript", "theme", "ambiance", "readOnly", true));

setTimeout(updatePreview, 1000, input);

});
require("/support/embed.js");
})();

