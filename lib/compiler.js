var readFromString = (require("./reader")).readFromString;;

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
  return isSymbol(first(form)) ?
    form :
    cons(void(0), form);
};

var desugarFnDoc = function desugarFnDoc(form) {
  return isString(second(form)) ?
    form :
    cons(first(form), cons(void(0), rest(form)));
};

var desugarFnAttrs = function desugarFnAttrs(form) {
  return isDictionary(third(form)) ?
    form :
    cons(first(form), cons(second(form), cons(void(0), rest(rest(form)))));
};

var desugarBody = function desugarBody(form) {
  return isList(third(form)) ?
    form :
    withMeta(cons(first(form), cons(second(form), list(rest(rest(form))))), meta(third(form)));
};

var compileFnParams = function compileFnParams(params) {
  return isContainsVector(params, "﻿&") ?
    params.slice(0, params.indexOf("﻿&")).map(compile).join(", ") :
    params.map(compile).join(", ");
};

var compileDesugaredFn = function compileDesugaredFn(name, doc, attrs, params, body) {
  return compileTemplate(isNil(name) ?
    list("function(~{}) {\n  ~{}\n}", compileFnParams(params), compileFnBody(body, params)) :
    list("function ~{}(~{}) {\n  ~{}\n}", compile(name), compileFnParams(params), compileFnBody(body, params)));
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
    compileStatements(form, "return ");
};

var compileFn = function compileFn(form) {
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

var compileLet = function compileLet(form) {
  return compile(cons("﻿do", concatList(defineBindings(first(form)), rest(form))));
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

installSpecial("﻿let", compileLet);

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
