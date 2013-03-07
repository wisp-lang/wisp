var sort = (require("./sequence")).sort;
var butlast = (require("./sequence")).butlast;
var last = (require("./sequence")).last;
var concat = (require("./sequence")).concat;
var rest = (require("./sequence")).rest;
var conj = (require("./sequence")).conj;
var cons = (require("./sequence")).cons;
var vec = (require("./sequence")).vec;
var map = (require("./sequence")).map;
var rest = (require("./sequence")).rest;
var third = (require("./sequence")).third;
var second = (require("./sequence")).second;
var first = (require("./sequence")).first;
var isEmpty = (require("./sequence")).isEmpty;
var count = (require("./sequence")).count;
var isList = (require("./sequence")).isList;
var list = (require("./sequence")).list;;

var vals = (require("./runtime")).vals;
var char = (require("./runtime")).char;
var subs = (require("./runtime")).subs;
var str = (require("./runtime")).str;
var reFind = (require("./runtime")).reFind;
var reMatches = (require("./runtime")).reMatches;
var rePattern = (require("./runtime")).rePattern;
var isDictionary = (require("./runtime")).isDictionary;
var isObject = (require("./runtime")).isObject;
var isString = (require("./runtime")).isString;
var isVector = (require("./runtime")).isVector;
var dec = (require("./runtime")).dec;
var inc = (require("./runtime")).inc;
var isNil = (require("./runtime")).isNil;
var keys = (require("./runtime")).keys;
var dictionary = (require("./runtime")).dictionary;
var isOdd = (require("./runtime")).isOdd;;

var name = (require("./ast")).name;
var withMeta = (require("./ast")).withMeta;
var meta = (require("./ast")).meta;
var keyword = (require("./ast")).keyword;
var isKeyword = (require("./ast")).isKeyword;
var symbol = (require("./ast")).symbol;
var isSymbol = (require("./ast")).isSymbol;;

var join = (require("./string")).join;
var split = (require("./string")).split;;

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

var peekChar = function peekChar(reader) {
  return isEmpty(reader.bufferAtom) ?
    reader.source[reader.indexAtom] :
    reader.bufferAtom[0];
};

var readChar = function readChar(reader) {
  peekChar(reader) === "\n" ?
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
  return (ch === " ") || (ch === "\t") || (ch === "\n") || (ch === "\r");
};

var isWhitespace = function isWhitespace(ch) {
  return (isBreakingWhitespace(ch)) || ("," === ch);
};

var isNumeric = function isNumeric(ch) {
  return (ch === "0") || (ch === "1") || (ch === "2") || (ch === "3") || (ch === "4") || (ch === "5") || (ch === "6") || (ch === "7") || (ch === "8") || (ch === "9");
};

var isCommentPrefix = function isCommentPrefix(ch) {
  return ";" === ch;
};

var isNumberLiteral = function isNumberLiteral(reader, initch) {
  return (isNumeric(initch)) || ((("+" === initch) || ("-" === initch)) && (isNumeric(peekChar(reader))));
};

var readerError = function readerError(reader, message) {
  var error = SyntaxError(str(message, "\n", "line:", line(reader), "\n", "column:", column(reader)));
  error.line = line(reader);
  error.column = column(reader);
  error.uri = reader["uri"];
  return (function() { throw error; })();
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
      (buffer = str(buffer, ch), ch = readChar(reader), loop);
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

var intPattern = rePattern("^([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?$");

var ratioPattern = rePattern("([-+]?[0-9]+)/([0-9]+)");

var floatPattern = rePattern("([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?");

var matchInt = function matchInt(s) {
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
};

var matchRatio = function matchRatio(s) {
  var groups = reFind(ratioPattern, s);
  var numinator = groups[1];
  var denominator = groups[2];
  return (parseInt(numinator)) / (parseInt(denominator));
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

var makeUnicodeChar = function makeUnicodeChar(codeStr, base) {
  var base = base || 16;
  var code = parseInt(codeStr, base);
  return char(code);
};

var escapeChar = function escapeChar(buffer, reader) {
  var ch = readChar(reader);
  var mapresult = escapeCharMap(ch);
  return mapresult ?
    mapresult :
  ch === "x" ?
    makeUnicodeChar(validateUnicodeEscape(unicode2Pattern, reader, ch, read2Chars(reader))) :
  ch === "u" ?
    makeUnicodeChar(validateUnicodeEscape(unicode4Pattern, reader, ch, read4Chars(reader))) :
  isNumeric(ch) ?
    char(ch) :
  "else" ?
    readerError(reader, str("Unexpected unicode escape ", "\\", ch)) :
    void(0);
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
                conj(a, mret), loop);
            })() :
            (function() {
              unreadChar(reader, ch);
              return (function() {
                var o = read(reader, true, void(0), isRecursive);
                return (a = o === reader ?
                  a :
                  conj(a, o), loop);
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
};

var readUnmatchedDelimiter = function readUnmatchedDelimiter(rdr, ch) {
  return readerError(rdr, "Unmached delimiter ", ch);
};

var readList = function readList(reader, _) {
  var lineNumber = line(reader);
  var columnNumber = column(reader);
  var items = readDelimitedList(")", reader, true);
  return withMeta(list.apply(list, items), {
    "line": lineNumber,
    "column": columnNumber
  });
};

var readComment = skipLine;

var readVector = function readVector(reader) {
  var lineNumber = line(reader);
  var columnNumber = column(reader);
  var items = readDelimitedList("]", reader, true);
  return withMeta(items, {
    "line": lineNumber,
    "column": columnNumber
  });
};

var readMap = function readMap(reader) {
  var lineNumber = line(reader);
  var columnNumber = column(reader);
  var items = readDelimitedList("}", reader, true);
  return isOdd(count(items)) ?
    readerError(reader, "Map literal must contain an even number of forms") :
    withMeta(dictionary.apply(dictionary, items), {
      "line": lineNumber,
      "column": columnNumber
    });
};

var readSet = function readSet(reader, _) {
  var lineNumber = line(reader);
  var columnNumber = column(reader);
  var items = readDelimitedList("}", reader, true);
  return withMeta(concat(["﻿set"], items), {
    "line": lineNumber,
    "column": columnNumber
  });
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
  var ch = readChar(reader);
  return !(ch) ?
    readerError(reader, "EOF while reading character") :
  ch === "@" ?
    list("﻿unquote-splicing", read(reader, true, void(0), true)) :
    (function() {
      unreadChar(reader, ch);
      return list("﻿unquote", read(reader, true, void(0), true));
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
  var token = readToken(reader, initch);
  var parts = split(token, "/");
  var hasNs = (count(parts) > 1) && (count(token) > 1);
  var ns = first(parts);
  var name = join("/", rest(parts));
  return hasNs ?
    symbol(ns, name) :
    specialSymbols(token, symbol(token));
};

var readKeyword = function readKeyword(reader, initch) {
  var token = readToken(reader, readChar(reader));
  var parts = split(token, "/");
  var name = last(parts);
  var ns = count(parts) > 1 ?
    join("/", butlast(parts)) :
    void(0);
  var issue = last(ns) === ":" ?
    "namespace can't ends with \":\"" :
  last(name) === ":" ?
    "name can't end with \":\"" :
  last(name) === "/" ?
    "name can't end with \"/\"" :
  count(split(token, "::")) > 1 ?
    "name can't contain \"::\"" :
    void(0);
  return issue ?
    readerError(reader, "Invalid token (", issue, "): ", token) :
  (!(ns)) && (first(name) === ":") ?
    keyword(rest(name)) :
    keyword(ns, name);
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
  var lineNumber = line(reader);
  var columnNumber = line(column);
  var metadata = desugarMeta(read(reader, true, void(0), true));
  !(isObject(metadata)) ?
    readerError(reader, "Metadata must be Symbol, Keyword, String or Map") :
    void(0);
  return (function() {
    var form = read(reader, true, void(0), true);
    return isObject(form) ?
      withMeta(form, conj(metadata, meta(form), {
        "line": lineNumber,
        "column": columnNumber
      })) :
      form;
  })();
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
      rePattern(buffer) :
    "default" ?
      (buffer = str(buffer, ch), ch = readChar(reader), loop) :
      void(0);
    };
    return recur;
  })("", readChar(reader));
};

var readParam = function readParam(reader, initch) {
  var form = readSymbol(reader, initch);
  return form == symbol("%") ?
    symbol("%1") :
    form;
};

var isParam = function isParam(form) {
  return (isSymbol(form)) && ("%" === first(name(form)));
};

var lambdaParamsHash = function lambdaParamsHash(form) {
  return isParam(form) ?
    dictionary(form, form) :
  (isDictionary(form)) || (isVector(form)) || (isList(form)) ?
    conj.apply(conj, map(lambdaParamsHash, vec(form))) :
  "else" ?
    {} :
    void(0);
};

var lambdaParams = function lambdaParams(body) {
  var names = sort(vals(lambdaParamsHash(body)));
  var variadic = first(names) == symbol("%&");
  var n = variadic && (count(names) == 1) ?
    0 :
    parseInt(rest(name(last(names))));
  var params = (function loop(names, i) {
    var recur = loop;
    while (recur === loop) {
      recur = i <= n ?
      (names = conj(names, symbol(str("%", i))), i = inc(i), loop) :
      names;
    };
    return recur;
  })([], 1);
  return variadic ?
    conj(params, "﻿&", "﻿%&") :
    names;
};

var readLambda = function readLambda(reader) {
  var body = readList(reader);
  return list("﻿fn", lambdaParams(body), body);
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
    readParam :
  c === "#" ?
    readDispatch :
  "else" ?
    void(0) :
    void(0);
};

var dispatchMacros = function dispatchMacros(s) {
  return s === "{" ?
    readSet :
  s === "(" ?
    readLambda :
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
  var reader = pushBackReader(source, uri);
  return read(reader, true, void(0), false);
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
  var tag = readSymbol(reader, initch);
  var pfn = __tagTable__[name(tag)];
  return pfn ?
    pfn(read(reader, true, void(0), false)) :
    readerError(reader, str("Could not find tag parser for ", name(tag), " in ", str(keys(__tagTable__))));
};

exports.pushBackReader = pushBackReader;
exports.readFromString = readFromString;
exports.read = read;
