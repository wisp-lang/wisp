var readFromString = (require("./reader")).readFromString;;

var prStr = (require("./ast")).prStr;
var gensym = (require("./ast")).gensym;
var name = (require("./ast")).name;
var isSyntaxQuote = (require("./ast")).isSyntaxQuote;
var isQuote = (require("./ast")).isQuote;
var isUnquoteSplicing = (require("./ast")).isUnquoteSplicing;
var isUnquote = (require("./ast")).isUnquote;
var namespace = (require("./ast")).namespace;
var keyword = (require("./ast")).keyword;
var isKeyword = (require("./ast")).isKeyword;
var symbol = (require("./ast")).symbol;
var isSymbol = (require("./ast")).isSymbol;
var withMeta = (require("./ast")).withMeta;
var meta = (require("./ast")).meta;;

var concat = (require("./sequence")).concat;
var take = (require("./sequence")).take;
var filter = (require("./sequence")).filter;
var map = (require("./sequence")).map;
var last = (require("./sequence")).last;
var vec = (require("./sequence")).vec;
var reduce = (require("./sequence")).reduce;
var reverse = (require("./sequence")).reverse;
var conj = (require("./sequence")).conj;
var cons = (require("./sequence")).cons;
var rest = (require("./sequence")).rest;
var third = (require("./sequence")).third;
var second = (require("./sequence")).second;
var first = (require("./sequence")).first;
var list = (require("./sequence")).list;
var isList = (require("./sequence")).isList;
var count = (require("./sequence")).count;
var isEmpty = (require("./sequence")).isEmpty;;

var isStrictEqual = (require("./runtime")).isStrictEqual;
var isEqual = (require("./runtime")).isEqual;
var int = (require("./runtime")).int;
var char = (require("./runtime")).char;
var str = (require("./runtime")).str;
var dec = (require("./runtime")).dec;
var inc = (require("./runtime")).inc;
var isRePattern = (require("./runtime")).isRePattern;
var isNil = (require("./runtime")).isNil;
var isFalse = (require("./runtime")).isFalse;
var isTrue = (require("./runtime")).isTrue;
var reFind = (require("./runtime")).reFind;
var subs = (require("./runtime")).subs;
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

var replace = (require("./string")).replace;
var upperCase = (require("./string")).upperCase;
var join = (require("./string")).join;
var split = (require("./string")).split;;

var isSelfEvaluating = function isSelfEvaluating(form) {
  return (isNumber(form)) || ((isString(form)) && (!(isSymbol(form))) && (!(isKeyword(form)))) || (isBoolean(form)) || (isNil(form)) || (isRePattern(form));
};

var __macros__ = {};

var executeMacro = function executeMacro(name, form) {
  return __macros__[name].apply(__macros__[name], vec(form));
};

var installMacro = function installMacro(name, macroFn) {
  return __macros__[name] = macroFn;
};

var isMacro = function isMacro(name) {
  return (isSymbol(name)) && (__macros__[name]) && true;
};

var makeMacro = function makeMacro(pattern, body) {
  var macroFn = concat(list(symbol(void(0), "fn"), pattern), body);
  return eval("" + "(" + (compile(macroexpand(macroFn))) + ")");
};

installMacro(symbol(void(0), "defmacro"), function(name, signature) {
  var body = Array.prototype.slice.call(arguments, 2);
  return installMacro(name, makeMacro(signature, body));
});

var __specials__ = {};

var installSpecial = function installSpecial(name, f, validator) {
  return __specials__[name] = function(form) {
    validator ?
      validator(form) :
      void(0);
    return f(withMeta(rest(form), meta(form)));
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
    map(function(e) {
      return list(symbol(void(0), "quote"), e);
    }, form) :
    form, form);
};

var applyUnquotedForm = function applyUnquotedForm(fnName, form) {
  return cons(fnName, map(function(e) {
    return isUnquote(e) ?
      second(e) :
    (isList(e)) && (isKeyword(first(e))) ?
      list(symbol(void(0), "syntax-quote"), second(e)) :
      list(symbol(void(0), "syntax-quote"), e);
  }, form));
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
  var slices = splitSplices(form, fnName);
  var n = count(slices);
  return n === 0 ?
    list(fnName) :
  n === 1 ?
    first(slices) :
  "default" ?
    applyForm(appendName, slices) :
    void(0);
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
    compile(applyForm(symbol(void(0), "vector"), list.apply(list, form), isQuoted)) :
  isList(form) ?
    compile(applyForm(symbol(void(0), "list"), form, isQuoted)) :
  isDictionary(form) ?
    compileDictionary(isQuoted ?
      mapDictionary(form, function(x) {
        return list(symbol(void(0), "quote"), x);
      }) :
      form) :
    void(0);
};

var compileReference = function compileReference(form) {
  var id = name(form);
  id = id === "*" ?
    "multiply" :
  id === "/" ?
    "divide" :
  id === "+" ?
    "sum" :
  id === "-" ?
    "subtract" :
  id === "=" ?
    "equal?" :
  id === "==" ?
    "strict-equal?" :
  id === "<=" ?
    "not-greater-than" :
  id === ">=" ?
    "not-less-than" :
  id === ">" ?
    "greater-than" :
  id === "<" ?
    "less-than" :
  "else" ?
    id :
    void(0);
  id = join("_", split(id, "*"));
  id = join("-to-", split(id, "->"));
  id = join(split(id, "!"));
  id = join("$", split(id, "%"));
  id = join("-plus-", split(id, "+"));
  id = join("-and-", split(id, "&"));
  id = last(id) === "?" ?
    "" + "is-" + (subs(id, 0, dec(count(id)))) :
    id;
  id = reduce(function(result, key) {
    return "" + result + ((!(isEmpty(result))) && (!(isEmpty(key))) ?
      "" + (upperCase(key[0])) + (subs(key, 1)) :
      key);
  }, "", split(id, "-"));
  return id;
};

var compileKeywordReference = function compileKeywordReference(form) {
  return "" + "\"" + (name(form)) + "\"";
};

var compileSyntaxQuotedVector = function compileSyntaxQuotedVector(form) {
  var concatForm = syntaxQuoteSplit(symbol(void(0), "concat"), symbol(void(0), "vector"), list.apply(list, form));
  return compile(count(concatForm) > 1 ?
    list(symbol(void(0), "vec"), concatForm) :
    concatForm);
};

var compileSyntaxQuoted = function compileSyntaxQuoted(form) {
  return isList(form) ?
    compile(syntaxQuoteSplit(symbol(void(0), "concat"), symbol(void(0), "list"), form)) :
  isVector(form) ?
    compileSyntaxQuotedVector(form) :
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
      return isEmpty(form) ?
        compileObject(form, true) :
      isQuote(form) ?
        compileObject(second(form), true) :
      isSyntaxQuote(form) ?
        compileSyntaxQuoted(second(form)) :
      isSpecial(head) ?
        executeSpecial(head, form) :
      isKeyword(head) ?
        compile(list(symbol(void(0), "get"), list(symbol(void(0), "or"), second(form), 0), head)) :
      "else" ?
        (function() {
          return !((isSymbol(head)) || (isList(head))) ?
            (function() { throw compilerError(form, "" + "operator is not a procedure: " + head); })() :
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
      join(";\n\n", result) :
      (function() {
        var expression = first(expressions);
        var form = macroexpand(expression);
        var expanded = isList(form) ?
          withMeta(form, conj({
            "top": true
          }, meta(form))) :
          form;
        return (result = conj(result, compile(expanded)), expressions = rest(expressions), loop);
      })();
    };
    return recur;
  })([], forms);
};

var macroexpand1 = function macroexpand1(form) {
  return isList(form) ?
    (function() {
      var op = first(form);
      var id = isSymbol(op) ?
        name(op) :
        void(0);
      return isSpecial(op) ?
        form :
      isMacro(op) ?
        executeMacro(op, rest(form)) :
      (isSymbol(op)) && (!(id === ".")) ?
        first(id) === "." ?
          count(form) < 2 ?
            (function() { throw Error("Malformed member expression, expecting (.member target ...)"); })() :
            cons(symbol(void(0), "."), cons(second(form), cons(symbol(subs(id, 1)), rest(rest(form))))) :
        last(id) === "." ?
          cons(symbol(void(0), "new"), cons(symbol(subs(id, 0, dec(count(id)))), rest(form))) :
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
  var getIndentation = function(code) {
    return (reFind(indentPattern, code)) || "\n";
  };
  return (function loop(code, parts, values) {
    var recur = loop;
    while (recur === loop) {
      recur = count(parts) > 1 ?
      (code = "" + code + (first(parts)) + (replace("" + "" + (first(values)), lineBreakPatter, getIndentation(first(parts)))), parts = rest(parts), values = rest(values), loop) :
      "" + code + (first(parts));
    };
    return recur;
  })("", split(first(form), "~{}"), rest(form));
};

var compileComment = function compileComment(form) {
  return compileTemplate(list("//~{}\n", first(form)));
};

var compileDef = function compileDef(form) {
  var id = first(form);
  var isExport = ((((meta(form)) || {}) || 0)["top"]) && (!((((meta(id)) || {}) || 0)["private"]));
  var attribute = symbol(namespace(id), "" + "-" + (name(id)));
  return isExport ?
    compileTemplate(list("var ~{};\n~{}", compile(cons(symbol(void(0), "set!"), form)), compile(list(symbol(void(0), "set!"), list(symbol(void(0), "."), symbol(void(0), "exports"), attribute), id)))) :
    compileTemplate(list("var ~{}", compile(cons(symbol(void(0), "set!"), form))));
};

var compileIfElse = function compileIfElse(form) {
  var condition = macroexpand(first(form));
  var thenExpression = macroexpand(second(form));
  var elseExpression = macroexpand(third(form));
  return compileTemplate(list((isList(elseExpression)) && (isEqual(first(elseExpression), symbol(void(0), "if"))) ?
    "~{} ?\n  ~{} :\n~{}" :
    "~{} ?\n  ~{} :\n  ~{}", compile(condition), compile(thenExpression), compile(elseExpression)));
};

var compileDictionary = function compileDictionary(form) {
  var body = (function loop(body, names) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(names) ?
      body :
      (body = "" + (isNil(body) ?
        "" :
        "" + body + ",\n") + (compileTemplate(list("~{}: ~{}", compile(first(names)), compile(macroexpand(form[first(names)]))))), names = rest(names), loop);
    };
    return recur;
  })(void(0), keys(form));
  return isNil(body) ?
    "{}" :
    compileTemplate(list("{\n  ~{}\n}", body));
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

var compileDesugaredFn = function compileDesugaredFn(name, doc, attrs, params, body) {
  return compileTemplate(isNil(name) ?
    list("function(~{}) {\n  ~{}\n}", join(", ", map(compile, (params || 0)["names"])), compileFnBody(map(macroexpand, body), params)) :
    list("function ~{}(~{}) {\n  ~{}\n}", compile(name), join(", ", map(compile, (params || 0)["names"])), compileFnBody(map(macroexpand, body), params)));
};

var compileStatements = function compileStatements(form, prefix) {
  return (function loop(result, expression, expressions) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(expressions) ?
      "" + result + (isNil(prefix) ?
        "" :
        prefix) + (compile(macroexpand(expression))) + ";" :
      (result = "" + result + (compile(macroexpand(expression))) + ";\n", expression = first(expressions), expressions = rest(expressions), loop);
    };
    return recur;
  })("", first(form), rest(form));
};

var compileFnBody = function compileFnBody(form, params) {
  return (isDictionary(params)) && ((params || 0)["rest"]) ?
    compileStatements(cons(list(symbol(void(0), "def"), (params || 0)["rest"], list(symbol(void(0), "Array.prototype.slice.call"), symbol(void(0), "arguments"), (params || 0)["arity"])), form), "return ") :
  (count(form) === 1) && (isList(first(form))) && (isEqual(first(first(form)), symbol(void(0), "do"))) ?
    compileFnBody(rest(first(form)), params) :
    compileStatements(form, "return ");
};

var desugarParams = function desugarParams(params) {
  return (function loop(names, params) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(params) ?
      {
        "names": names,
        "arity": count(names),
        "rest": void(0)
      } :
    isEqual(first(params), symbol(void(0), "&")) ?
      isEqual(count(params), 1) ?
        {
          "names": names,
          "arity": count(names),
          "rest": void(0)
        } :
      isEqual(count(params), 2) ?
        {
          "names": names,
          "arity": count(names),
          "rest": second(params)
        } :
      "else" ?
        (function() { throw TypeError("Unexpected number of parameters after &"); })() :
        void(0) :
    "else" ?
      (names = conj(names, first(params)), params = rest(params), loop) :
      void(0);
    };
    return recur;
  })([], params);
};

var analyzeOverloadedFn = function analyzeOverloadedFn(name, doc, attrs, overloads) {
  return map(function(overload) {
    var params = desugarParams(first(overload));
    return {
      "rest": (params || 0)["rest"],
      "names": (params || 0)["names"],
      "arity": (params || 0)["arity"],
      "body": rest(overload)
    };
  }, overloads);
};

var compileOverloadedFn = function compileOverloadedFn(name, doc, attrs, overloads) {
  var methods = analyzeOverloadedFn(name, doc, attrs, overloads);
  var fixedMethods = filter(function(method) {
    return !((method || 0)["rest"]);
  }, methods);
  var variadic = first(filter(function(method) {
    return (method || 0)["rest"];
  }, methods));
  var names = reduce(function(names, params) {
    return count(names) > (params || 0)["arity"] ?
      names :
      (params || 0)["names"];
  }, [], methods);
  return list(symbol(void(0), "fn"), name, doc, attrs, names, list(symbol(void(0), "raw*"), compileSwitch(symbol(void(0), "arguments.length"), map(function(method) {
    return cons((method || 0)["arity"], list(symbol(void(0), "raw*"), compileFnBody(concat(compileRebind(names, (method || 0)["names"]), (method || 0)["body"]))));
  }, fixedMethods), isNil(variadic) ?
    list(symbol(void(0), "throw"), list(symbol(void(0), "Error"), "Invalid arity")) :
    list(symbol(void(0), "raw*"), compileFnBody(concat(compileRebind(cons(list(symbol(void(0), "Array.prototype.slice.call"), symbol(void(0), "arguments"), (variadic || 0)["arity"]), names), cons((variadic || 0)["rest"], (variadic || 0)["names"])), (variadic || 0)["body"]))))), void(0));
};

var compileRebind = function compileRebind(bindings, names) {
  return (function loop(form, bindings, names) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(names) ?
      reverse(form) :
      (form = isEqual(first(names), first(bindings)) ?
        form :
        cons(list(symbol(void(0), "def"), first(names), first(bindings)), form), bindings = rest(bindings), names = rest(names), loop);
    };
    return recur;
  })(list(), bindings, names);
};

var compileSwitchCases = function compileSwitchCases(cases) {
  return reduce(function(form, caseExpression) {
    return "" + form + (compileTemplate(list("case ~{}:\n  ~{}\n", compile(macroexpand(first(caseExpression))), compile(macroexpand(rest(caseExpression))))));
  }, "", cases);
};

var compileSwitch = function compileSwitch(value, cases, defaultCase) {
  return compileTemplate(list("switch (~{}) {\n  ~{}\n  default:\n    ~{}\n}", compile(macroexpand(value)), compileSwitchCases(cases), compile(macroexpand(defaultCase))));
};

var compileFn = function compileFn(form) {
  var signature = desugarFnAttrs(desugarFnDoc(desugarFnName(form)));
  var name = first(signature);
  var doc = second(signature);
  var attrs = third(signature);
  return isVector(third(rest(signature))) ?
    compileDesugaredFn(name, doc, attrs, desugarParams(third(rest(signature))), rest(rest(rest(rest(signature))))) :
    compile(compileOverloadedFn(name, doc, attrs, rest(rest(rest(signature)))));
};

var compileInvoke = function compileInvoke(form) {
  return compileTemplate(list(isList(first(form)) ?
    "(~{})(~{})" :
    "~{}(~{})", compile(first(form)), compileGroup(rest(form))));
};

var compileGroup = function compileGroup(form, wrap) {
  return wrap ?
    "" + "(" + (compileGroup(form)) + ")" :
    join(", ", vec(map(compile, map(macroexpand, form))));
};

var compileDo = function compileDo(form) {
  return compile(list(cons(symbol(void(0), "fn"), cons([], form))));
};

var defineBindings = function defineBindings(form) {
  return (function loop(defs, bindings) {
    var recur = loop;
    while (recur === loop) {
      recur = count(bindings) === 0 ?
      reverse(defs) :
      (defs = cons(list(symbol(void(0), "def"), bindings[0], bindings[1]), defs), bindings = rest(rest(bindings)), loop);
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
    isEqual(first(first(exprs)), symbol(void(0), "catch")) ?
      (tryExprs = tryExprs, catchExprs = rest(first(exprs)), finallyExprs = finallyExprs, exprs = rest(exprs), loop) :
    isEqual(first(first(exprs)), symbol(void(0), "finally")) ?
      (tryExprs = tryExprs, catchExprs = catchExprs, finallyExprs = rest(first(exprs)), exprs = rest(exprs), loop) :
      (tryExprs = cons(first(exprs), tryExprs), catchExprs = catchExprs, finallyExprs = finallyExprs, exprs = rest(exprs), loop);
    };
    return recur;
  })(list(), list(), list(), reverse(form));
};

var compileProperty = function compileProperty(form) {
  return (name(second(form)))[0] === "-" ?
    compileTemplate(list(isList(first(form)) ?
      "(~{}).~{}" :
      "~{}.~{}", compile(macroexpand(first(form))), compile(macroexpand(symbol(subs(name(second(form)), 1)))))) :
    compileTemplate(list("~{}.~{}(~{})", compile(macroexpand(first(form))), compile(macroexpand(second(form))), compileGroup(rest(rest(form)))));
};

var compileApply = function compileApply(form) {
  return compile(list(symbol(void(0), "."), first(form), symbol(void(0), "apply"), first(form), second(form)));
};

var compileNew = function compileNew(form) {
  return compileTemplate(list("new ~{}", compile(form)));
};

var compileCompoundAccessor = function compileCompoundAccessor(form) {
  var target = macroexpand(first(form));
  var attribute = macroexpand(second(form));
  var template = isList(target) ?
    "(~{})[~{}]" :
    "~{}[~{}]";
  return compileTemplate(list(template, compile(target), compile(attribute)));
};

var compileInstance = function compileInstance(form) {
  return compileTemplate(list("~{} instanceof ~{}", compile(macroexpand(second(form))), compile(macroexpand(first(form)))));
};

var compileNot = function compileNot(form) {
  return compileTemplate(list("!(~{})", compile(macroexpand(first(form)))));
};

var compileLoop = function compileLoop(form) {
  var bindings = (function loop(names, values, tokens) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(tokens) ?
      {
        "names": names,
        "values": values
      } :
      (names = conj(names, first(tokens)), values = conj(values, second(tokens)), tokens = rest(rest(tokens)), loop);
    };
    return recur;
  })([], [], first(form));
  var names = (bindings || 0)["names"];
  var values = (bindings || 0)["values"];
  var body = rest(form);
  return compile(cons(cons(symbol(void(0), "fn"), cons(symbol(void(0), "loop"), cons(names, compileRecur(names, body)))), list.apply(list, values)));
};

var rebindBindings = function rebindBindings(names, values) {
  return (function loop(result, names, values) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(names) ?
      reverse(result) :
      (result = cons(list(symbol(void(0), "set!"), first(names), first(values)), result), names = rest(names), values = rest(values), loop);
    };
    return recur;
  })(list(), names, values);
};

var expandRecur = function expandRecur(names, body) {
  return map(function(form) {
    return isList(form) ?
      isEqual(first(form), symbol(void(0), "recur")) ?
        list(symbol(void(0), "raw*"), compileGroup(concat(rebindBindings(names, rest(form)), list(symbol(void(0), "loop"))), true)) :
        expandRecur(names, form) :
      form;
  }, body);
};

var compileRecur = function compileRecur(names, body) {
  return list(list(symbol(void(0), "raw*"), compileTemplate(list("var recur = loop;\nwhile (recur === loop) {\n  recur = ~{}\n}", compileStatements(expandRecur(names, body))))), symbol(void(0), "recur"));
};

var compileRaw = function compileRaw(form) {
  return first(form);
};

installSpecial(symbol(void(0), "set!"), compileSet);

installSpecial(symbol(void(0), "get"), compileCompoundAccessor);

installSpecial(symbol(void(0), "aget"), compileCompoundAccessor);

installSpecial(symbol(void(0), "def"), compileDef);

installSpecial(symbol(void(0), "if"), compileIfElse);

installSpecial(symbol(void(0), "do"), compileDo);

installSpecial(symbol(void(0), "do*"), compileStatements);

installSpecial(symbol(void(0), "fn"), compileFn);

installSpecial(symbol(void(0), "throw"), compileThrow);

installSpecial(symbol(void(0), "vector"), compileVector);

installSpecial(symbol(void(0), "try"), compileTry);

installSpecial(symbol(void(0), "."), compileProperty);

installSpecial(symbol(void(0), "apply"), compileApply);

installSpecial(symbol(void(0), "new"), compileNew);

installSpecial(symbol(void(0), "instance?"), compileInstance);

installSpecial(symbol(void(0), "not"), compileNot);

installSpecial(symbol(void(0), "loop"), compileLoop);

installSpecial(symbol(void(0), "raw*"), compileRaw);

installSpecial(symbol(void(0), "comment"), compileComment);

var compileKeyword = function compileKeyword(form) {
  return "" + "\"" + "꞉" + (name(form)) + "\"";
};

var compileSymbol = function compileSymbol(form) {
  return compile(list(symbol(void(0), "symbol"), namespace(form), name(form)));
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
  form = replace(form, RegExp("\\\\", "g"), "\\\\");
  form = replace(form, RegExp("\n", "g"), "\\n");
  form = replace(form, RegExp("\r", "g"), "\\r");
  form = replace(form, RegExp("\t", "g"), "\\t");
  form = replace(form, RegExp("\"", "g"), "\\\"");
  return "" + "\"" + form + "\"";
};

var compileRePattern = function compileRePattern(form) {
  return "" + form;
};

var installNative = function installNative(alias, operator, validator, fallback) {
  return installSpecial(alias, function(form) {
    return isEmpty(form) ?
      fallback :
      reduce(function(left, right) {
        return compileTemplate(list("~{} ~{} ~{}", left, name(operator), right));
      }, map(function(operand) {
        return compileTemplate(list(isList(operand) ?
          "(~{})" :
          "~{}", compile(macroexpand(operand))));
      }, form));
  }, validator);
};

var installOperator = function installOperator(alias, operator) {
  return installSpecial(alias, function(form) {
    return (function loop(result, left, right, operands) {
      var recur = loop;
      while (recur === loop) {
        recur = isEmpty(operands) ?
        "" + result + (compileTemplate(list("~{} ~{} ~{}", compile(macroexpand(left)), name(operator), compile(macroexpand(right))))) :
        (result = "" + result + (compileTemplate(list("~{} ~{} ~{} && ", compile(macroexpand(left)), name(operator), compile(macroexpand(right))))), left = right, right = first(operands), operands = rest(operands), loop);
      };
      return recur;
    })("", first(form), second(form), rest(rest(form)));
  }, verifyTwo);
};

var compilerError = function compilerError(form, message) {
  var error = Error("" + message);
  error.line = 1;
  return (function() { throw error; })();
};

var verifyTwo = function verifyTwo(form) {
  return (isEmpty(rest(form))) || (isEmpty(rest(rest(form)))) ?
    (function() { throw compilerError(form, "" + (first(form)) + " form requires at least two operands"); })() :
    void(0);
};

installNative(symbol(void(0), "+"), symbol(void(0), "+"), void(0), 0);

installNative(symbol(void(0), "-"), symbol(void(0), "-"), void(0), "NaN");

installNative(symbol(void(0), "*"), symbol(void(0), "*"), void(0), 1);

installNative(symbol(void(0), "/"), symbol(void(0), "/"), verifyTwo);

installNative(symbol(void(0), "mod"), symbol("%"), verifyTwo);

installNative(symbol(void(0), "and"), symbol(void(0), "&&"));

installNative(symbol(void(0), "or"), symbol(void(0), "||"));

installOperator(symbol(void(0), "not="), symbol(void(0), "!="));

installOperator(symbol(void(0), "=="), symbol(void(0), "==="));

installOperator(symbol(void(0), "identical?"), symbol(void(0), "==="));

installOperator(symbol(void(0), ">"), symbol(void(0), ">"));

installOperator(symbol(void(0), ">="), symbol(void(0), ">="));

installOperator(symbol(void(0), "<"), symbol(void(0), "<"));

installOperator(symbol(void(0), "<="), symbol(void(0), "<="));

installNative(symbol(void(0), "bit-and"), symbol(void(0), "&"), verifyTwo);

installNative(symbol(void(0), "bit-or"), symbol(void(0), "|"), verifyTwo);

installNative(symbol(void(0), "bit-xor"), symbol("^"));

installNative(symbol(void(0), "bit-not"), symbol("~"), verifyTwo);

installNative(symbol(void(0), "bit-shift-left"), symbol(void(0), "<<"), verifyTwo);

installNative(symbol(void(0), "bit-shift-right"), symbol(void(0), ">>"), verifyTwo);

installNative(symbol(void(0), "bit-shift-right-zero-fil"), symbol(void(0), ">>>"), verifyTwo);

installMacro(symbol(void(0), "str"), function str() {
  var forms = Array.prototype.slice.call(arguments, 0);
  return concat(list(symbol(void(0), "+"), ""), forms);
});

installMacro(symbol(void(0), "let"), function letMacro(bindings) {
  var body = Array.prototype.slice.call(arguments, 1);
  return cons(symbol(void(0), "do"), concat(defineBindings(bindings), body));
});

installMacro(symbol(void(0), "cond"), function cond() {
  var clauses = Array.prototype.slice.call(arguments, 0);
  return !(isEmpty(clauses)) ?
    list(symbol(void(0), "if"), first(clauses), isEmpty(rest(clauses)) ?
      (function() { throw Error("cond requires an even number of forms"); })() :
      second(clauses), cons(symbol(void(0), "cond"), rest(rest(clauses)))) :
    void(0);
});

installMacro(symbol(void(0), "defn"), function defn(name) {
  var body = Array.prototype.slice.call(arguments, 1);
  return list(symbol(void(0), "def"), name, concat(list(symbol(void(0), "fn"), name), body));
});

installMacro(symbol(void(0), "defn-"), function defn(name) {
  var body = Array.prototype.slice.call(arguments, 1);
  return concat(list(symbol(void(0), "defn"), withMeta(name, conj({
    "private": true
  }, meta(name)))), body);
});

installMacro(symbol(void(0), "assert"), function assert(x, message) {
  var title = message || "";
  var assertion = prStr(x);
  var uri = (x || 0)["uri"];
  var form = isList(x) ?
    second(x) :
    x;
  return list(symbol(void(0), "do"), list(symbol(void(0), "if"), list(symbol(void(0), "and"), list(symbol(void(0), "not"), list(symbol(void(0), "identical?"), list(symbol(void(0), "typeof"), symbol(void(0), "**verbose**")), "undefined")), symbol(void(0), "**verbose**")), list(symbol(void(0), ".log"), symbol(void(0), "console"), "Assert:", assertion)), list(symbol(void(0), "if"), list(symbol(void(0), "not"), x), list(symbol(void(0), "throw"), list(symbol(void(0), "Error."), list(symbol(void(0), "str"), "Assert failed: ", title, "\n\nAssertion:\n\n", assertion, "\n\nActual:\n\n", form, "\n--------------\n"), uri))));
});

installMacro(symbol(void(0), "export"), function() {
  var names = Array.prototype.slice.call(arguments, 0);
  return isEmpty(names) ?
    void(0) :
  isEmpty(rest(names)) ?
    list(symbol(void(0), "set!"), symbol(void(0), "module.exports"), first(names)) :
    (function loop(form, exports) {
      var recur = loop;
      while (recur === loop) {
        recur = isEmpty(exports) ?
        concat(list(symbol(void(0), "do*")), form) :
        (form = cons(list(symbol(void(0), "set!"), list(symbol("" + ".-" + (name(first(exports)))), symbol(void(0), "exports")), first(exports)), form), exports = rest(exports), loop);
      };
      return recur;
    })(list(), names);
});

installMacro(symbol(void(0), "import"), function(imports, path) {
  return isNil(path) ?
    list(symbol(void(0), "require"), imports) :
  isSymbol(imports) ?
    list(symbol(void(0), "def"), imports, list(symbol(void(0), "require"), path)) :
    (function loop(form, names) {
      var recur = loop;
      while (recur === loop) {
        recur = isEmpty(names) ?
        concat(list(symbol(void(0), "do*")), form) :
        (function() {
          var alias = first(names);
          var id = symbol("" + ".-" + (name(alias)));
          return (form = cons(list(symbol(void(0), "def"), alias, list(id, list(symbol(void(0), "require"), path))), form), names = rest(names), loop);
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
