var rest = (require("./list")).rest;
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

var deref = (require("./ast")).deref;
var name = (require("./ast")).name;
var withMeta = (require("./ast")).withMeta;
var meta = (require("./ast")).meta;
var unquoteSplicing = (require("./ast")).unquoteSplicing;
var unquote = (require("./ast")).unquote;
var syntaxQuote = (require("./ast")).syntaxQuote;
var quote = (require("./ast")).quote;
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
    var error = Error(str(message, "\n", "line:", line(reader), "\n", "column:", column(reader)));
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
      list(unquoteSplicing, read(reader, true, void(0), true)) :
      (function() {
        unreadChar(reader, ch);
        return list(unquote, read(reader, true, void(0), true));
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
    dictionary(keyword("tag"), f) :
  isString(f) ?
    dictionary(keyword("tag"), f) :
  isKeyword(f) ?
    dictionary(f, true) :
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
  return list.apply(list, [symbol("set")].concat(readDelimitedList("}", reader, true)));
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
    wrappingReader(quote) :
  c === "@" ?
    wrappingReader(deref) :
  c === "^" ?
    readMeta :
  c === "`" ?
    wrappingReader(syntaxQuote) :
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
          var res = f ?
            f(reader, ch) :
          isNumberLiteral(reader, ch) ?
            readNumber(reader, ch) :
          "else" ?
            readSymbol(reader, ch) :
            void(0);
          return res === reader ?
            (loop) :
            res;
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
    list(symbol("new"), symbol("UUID"), uuid) :
    readerError(void(0), "UUID literal expects a string as its representation.");
};

var readQueue = function readQueue(items) {
  return isVector(items) ?
    list(symbol("new"), symbol("PersistentQueue"), items) :
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
