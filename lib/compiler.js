var readFromString = (require("./reader")).readFromString;;

var isSymbolIdentical = (require("./ast")).isSymbolIdentical;
var isAtom = (require("./ast")).isAtom;
var set = (require("./ast")).set;
var deref = (require("./ast")).deref;
var gensym = (require("./ast")).gensym;
var name = (require("./ast")).name;
var syntaxQuote = (require("./ast")).syntaxQuote;
var isSyntaxQuote = (require("./ast")).isSyntaxQuote;
var quote = (require("./ast")).quote;
var isQuote = (require("./ast")).isQuote;
var unquoteSplicing = (require("./ast")).unquoteSplicing;
var isUnquoteSplicing = (require("./ast")).isUnquoteSplicing;
var unquote = (require("./ast")).unquote;
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
  return (isNumber(form)) || ((isString(form)) && (!(isSymbol(form)))) || (isBoolean(form)) || (isNil(form)) || (isKeyword(form)) || (isRePattern(form));
};

var __macros__ = {};

var executeMacro = function executeMacro(name, form) {
  return (__macros__[name])(form);
};

var installMacro = function installMacro(name, macro) {
  return __macros__[name] = macro;
};

var isMacro = function isMacro(name) {
  return (isSymbol(name)) && (__macros__[name]) && true;
};

var makeMacro = function makeMacro(pattern, body) {
  return (function() {
    var x = gensym();
    var program = compile(macroexpand(cons(symbol("fn"), cons(pattern, body))));
    var macro = eval(str("(", program, ")"));
    return function(form) {
      return (function() {
      try {
        return macro.apply(macro, listToVector(rest(form)));
      } catch (Error) {
        error;
        return (function() { throw compilerError(form, error.message); })();
      }})();
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
      return list(quote, e);
    }) :
    form, form);
};

var applyUnquotedForm = function applyUnquotedForm(fnName, form) {
  return cons(fnName, mapList(form, function(e) {
    return isUnquote(e) ?
      second(e) :
    (isList(e)) && (isKeyword(first(e))) ?
      list(syntaxQuote, second(e)) :
      list(syntaxQuote, e);
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
    compile(list(symbol("::compile:keyword"), form)) :
  isSymbol(form) ?
    compile(list(symbol("::compile:symbol"), form)) :
  isNumber(form) ?
    compile(list(symbol("::compile:number"), form)) :
  isString(form) ?
    compile(list(symbol("::compile:string"), form)) :
  isBoolean(form) ?
    compile(list(symbol("::compile:boolean"), form)) :
  isNil(form) ?
    compile(list(symbol("::compile:nil"), form)) :
  isRePattern(form) ?
    compileRePattern(form) :
  isVector(form) ?
    compile(applyForm(symbol("vector"), list.apply(list, form), isQuoted)) :
  isList(form) ?
    compile(applyForm(symbol("list"), form, isQuoted)) :
  isDictionary(form) ?
    compileDictionary(form) :
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

var compileSyntaxQuoted = function compileSyntaxQuoted(form) {
  return isList(form) ?
    compile(syntaxQuoteSplit(symbol("concat-list"), symbol("list"), form)) :
  isVector(form) ?
    compile(syntaxQuoteSplit(symbol("concat-vector"), symbol("vector"), list.apply(list, form))) :
  isDictionary(form) ?
    compile(syntaxQuoteSplit(symbol("merge"), symbol("dictionary"), form)) :
  "else" ?
    compileObject(form) :
    void(0);
};

var compile = function compile(form) {
  return isSelfEvaluating(form) ?
    compileObject(form) :
  isSymbol(form) ?
    compileReference(form) :
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
            compile(list(symbol("::compile:invoke"), head, rest(form)));
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
        executeMacro(op, form) :
      (isSymbol(op)) && (!(id === ".")) ?
        id.charAt(0) === "." ?
          count(form) < 2 ?
            (function() { throw Error("Malformed member expression, expecting (.member target ...)"); })() :
            cons(symbol("."), cons(second(form), cons(symbol(id.substr(1)), rest(rest(form))))) :
        id.charAt((id.length) - 1) === "." ?
          cons(symbol("new"), cons(symbol(id.substr(0, (id.length) - 1)), rest(form))) :
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
  return compileTemplate(list("var ~{}", compile(cons(symbol("set!"), form))));
};

var compileIfElse = function compileIfElse(form) {
  return (function() {
    var condition = macroexpand(first(form));
    var thenExpression = macroexpand(second(form));
    var elseExpression = macroexpand(third(form));
    return compileTemplate(list((isList(elseExpression)) && (first(elseExpression) === symbol("if")) ?
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
          str(body, ",\n"), compileTemplate(list("~{}: ~{}", name(first(names)), compile(macroexpand(form[first(names)]))))), names = rest(names), loop);
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
  return isContainsVector(params, symbol("&")) ?
    params.slice(0, params.indexOf(symbol("&"))).map(compile).join(", ") :
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
  return (isVector(params)) && (isContainsVector(params, symbol("&"))) ?
    compileStatements(cons(list(symbol("def"), params[inc(params.indexOf(symbol("&")))], list(symbol("Array.prototype.slice.call"), symbol("arguments"), params.indexOf(symbol("&")))), form), "return ") :
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

var compileFnInvoke = function compileFnInvoke(form) {
  return compileTemplate(list(isList(first(form)) ?
    "(~{})(~{})" :
    "~{}(~{})", compile(first(form)), compileGroup(second(form))));
};

var compileGroup = function compileGroup(form, wrap) {
  return wrap ?
    str("(", compileGroup(form), ")") :
    listToVector(mapList(mapList(form, macroexpand), compile)).join(", ");
};

var compileDo = function compileDo(form) {
  return compile(list(cons(symbol("fn"), cons(Array(), form))));
};

var defineBindings = function defineBindings(form) {
  return (function loop(defs, bindings) {
    var recur = loop;
    while (recur === loop) {
      recur = count(bindings) == 0 ?
      reverse(defs) :
      (defs = cons(list(symbol("def"), bindings[0], bindings[1]), defs), bindings = rest(rest(bindings)), loop);
    };
    return recur;
  })(list(), form);
};

var compileLet = function compileLet(form) {
  return compile(cons(symbol("do"), concatList(defineBindings(first(form)), rest(form))));
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
    isSymbolIdentical(first(first(exprs)), symbol("catch")) ?
      (tryExprs = tryExprs, catchExprs = rest(first(exprs)), finallyExprs = finallyExprs, exprs = rest(exprs), loop) :
    isSymbolIdentical(first(first(exprs)), symbol("finally")) ?
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
  return compile(list(symbol("."), first(form), symbol("apply"), first(form), second(form)));
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
    return compile(cons(cons(symbol("fn"), cons(symbol("loop"), cons(names, compileRecur(names, body)))), list.apply(list, values)));
  })();
};

var rebindBindings = function rebindBindings(names, values) {
  return (function loop(result, names, values) {
    var recur = loop;
    while (recur === loop) {
      recur = isEmpty(names) ?
      reverse(result) :
      (result = cons(list(symbol("set!"), first(names), first(values)), result), names = rest(names), values = rest(values), loop);
    };
    return recur;
  })(list(), names, values);
};

var expandRecur = function expandRecur(names, body) {
  return mapList(body, function(form) {
    return isList(form) ?
      first(form) === symbol("recur") ?
        list(symbol("::raw"), compileGroup(concatList(rebindBindings(names, rest(form)), list(symbol("loop"))), true)) :
        expandRecur(names, form) :
      form;
  });
};

var compileRecur = function compileRecur(names, body) {
  return list(list(symbol("::raw"), compileTemplate(list("var recur = loop;\nwhile (recur === loop) {\n  recur = ~{}\n}", compileStatements(expandRecur(names, body))))), symbol("recur"));
};

var compileRaw = function compileRaw(form) {
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

installSpecial(symbol("array"), compileVector);

installSpecial(symbol("try"), compileTry);

installSpecial(symbol("."), compileProperty);

installSpecial(symbol("apply"), compileApply);

installSpecial(symbol("new"), compileNew);

installSpecial(symbol("instance?"), compileInstance);

installSpecial(symbol("not"), compileNot);

installSpecial(symbol("loop"), compileLoop);

installSpecial(symbol("::raw"), compileRaw);

installSpecial(symbol("::compile:invoke"), compileFnInvoke);

installSpecial(symbol("::compile:keyword"), function(form) {
  return str("\"", name(first(form)), "\"");
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
  return isTrue(first(form)) ?
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
  return str("\"", string, "\"");
});

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

installNative(symbol("+"), symbol("+"), void(0), 0);

installNative(symbol("-"), symbol("-"), void(0), "NaN");

installNative(symbol("*"), symbol("*"), void(0), 1);

installNative(symbol("/"), symbol("/"), verifyTwo);

installNative(symbol("mod"), symbol("%"), verifyTwo);

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

var defmacroFromString = function defmacroFromString(macroSource) {
  return compileProgram(macroexpand(readFromString(str("(do ", macroSource, ")"))));
};

defmacroFromString("\n(defmacro cond\n  \"Takes a set of test/expr pairs. It evaluates each test one at a\n  time.  If a test returns logical true, cond evaluates and returns\n  the value of the corresponding expr and doesn't evaluate any of the\n  other tests or exprs. (cond) returns nil.\"\n  ;{:added \"1.0\"}\n  [clauses]\n  (set! clauses (apply list arguments))\n  (if (not (empty? clauses))\n    (list 'if (first clauses)\n          (if (empty? (rest clauses))\n            (throw (Error \"cond requires an even number of forms\"))\n            (second clauses))\n          (cons 'cond (rest (rest clauses))))))\n\n(defmacro defn\n   \"Same as (def name (fn [params* ] exprs*)) or\n   (def name (fn ([params* ] exprs*)+)) with any doc-string or attrs added\n   to the var metadata\"\n  ;{:added \"1.0\", :special-form true ]}\n  [name]\n  (def body (apply list (Array.prototype.slice.call arguments 1)))\n  `(def ~name (fn ~name ~@body)))\n\n(defmacro import\n  \"Helper macro for importing node modules\"\n  [imports path]\n  (if (nil? path)\n    `(require ~imports)\n    (if (symbol? imports)\n      `(def ~imports (require ~path))\n      (loop [form '() names imports]\n        (if (empty? names)\n          `(do* ~@form)\n          (let [alias (first names)\n                id (symbol (str \".-\" (name alias)))]\n            (recur (cons `(def ~alias\n                            (~id (require ~path))) form)\n                   (rest names))))))))\n\n(defmacro export\n  \"Helper macro for exporting multiple / single value\"\n  [& names]\n  (if (empty? names)\n    nil\n    (if (empty? (rest names))\n      `(set! module.exports ~(first names))\n      (loop [form '() exports names]\n        (if (empty? exports)\n          `(do* ~@form)\n          (recur (cons `(set!\n                         (~(symbol (str \".-\" (name (first exports))))\n                           exports)\n                         ~(first exports))\n                       form)\n               (rest exports)))))))\n\n(defmacro assert\n  \"Evaluates expr and throws an exception if it does not evaluate to\n  logical true.\"\n  {:added \"1.0\"}\n  [x message]\n  (if (nil? message)\n    `(assert ~x \"\")\n    `(if (not ~x)\n       (throw (Error. ~(str \"Assert failed: \" message \"\n\" '~x))))))\n");

exports.macroexpand1 = macroexpand1;
exports.macroexpand = macroexpand;
exports.compileProgram = compileProgram;
exports.compile = compile;
exports.isSelfEvaluating = isSelfEvaluating;
