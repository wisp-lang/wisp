/*
 * 
LispyScript - Javascript using tree syntax!
*
*/
// ToDo handle extra closing parenthesis at end. Comments.

var _ = require('underscore');

String.prototype.repeat = function(num) {
    return new Array(num + 1).join(this);
}

var templates = {};
templates["var"] = _.template("var <%= rest %>");
templates["set"] = _.template("<%= name %> = <%= value %>");
templates["function"] = _.template("function(<%= params %>) {\n<%= expressions %><%= indent %>}");
templates["try"] = _.template("(function () {try {\n<%= trypart %><%= indent %>} catch (err) {(<%= catchpart %>)(err)}})()");
templates["if"] = _.template("<%= condition %> ?\n<%= indent %><%= trueexpr %> :\n<%= indent %><%= falseexpr %>");

var parse = function(code) {
    if (/^\s*\(/.test(code) === false) throw _LS.error(0, 1);
    var code = "(" + code + ")";
    var length = code.length;
    var pos = 1;
    var lineno = 1;
    var parser = function() {
        var tree = [];
        tree._line = lineno;
        var token = "";
        var isString = false;
        var isSingleString = false;
        var isJSArray = 0;
        var isJSObject = 0;
        var isListComplete = false;
        var handleToken = function() {
            if (token) {
                tree.push(token);
                token = "";
            };
        };
        while (pos < length) {
            var c = code.charAt(pos);
            if (c == "\n") lineno++;
            pos++;
            if (c == '"') {
                isString = !isString;
                token += c;
                continue;
            };
            if (isString) {
                token += c;
                continue;
            };
            if (c == "'") {
                isSingleString = !isSingleString;
                token += c;
                continue;
            };
            if (isSingleString) {
                token += c;
                continue;
            };
            if (c == '[') {
                isJSArray++;
                token += c;
                continue;
            };
            if (c == ']') {
                if (isJSArray === 0) throw _LS.error(4, tree._line);
                isJSArray--;
                token += c;
                continue;
            };
            if (isJSArray) {
                token += c;
                continue;
            };
            if (c == '{') {
                isJSObject++;
                token += c;
                continue;
            };
            if (c == '}') {
                if (isJSObject === 0) throw _LS.error(6, tree._line);
                isJSObject--;
                token += c;
                continue;
            };
            if (isJSObject) {
                token += c;
                continue;
            };
            if (c == "(") {
                tree.push(parser());
                continue;
            };
            if (c == ")") {
                isListComplete = true;
                handleToken();
                break;
            };
            if (_LS.whitespace.test(c)) {
                handleToken();
                continue;
            };
            token += c;
        };
        if (isString) throw _LS.error(3, tree._line);
        if (isSingleString) throw _LS.error(3, tree._line);
        if (isJSArray > 0) throw _LS.error(5, tree._line);
        if (isJSObject > 0) throw _LS.error(7, tree._line);
        if (!isListComplete) throw _LS.error(8, tree._line);
        return tree;
    };
    return parser();
};

var handleExpressions = function(exprs) {
    indent += 4;
    var indentstr = " ".repeat(indent);
    var ret = "";
    var l = exprs.length;
    for (var i = 0; i < l; i++) {
        var tmp;
        var r = "";
        if (i === l - 1 && indent) {
            t = exprs[i][0];
            if (t !== "set" && t !== "var" && t !== "throw")
                r = "return "
        }
        if (typeof exprs[i] === "object") {
            tmp = handleExpression(exprs[i]);
        } else {
            tmp = exprs[i];
        }
        if (tmp.length > 0)
            ret += indentstr + r + tmp + ";\n";
    }
    indent -= 4;
    return ret;
};

var handleExpression = function(tree) {
    var command = tree[0];
    if (_LS.macros[command]) {
        tree = _LS.macroExpand(tree);
        return handleExpression(tree);
    }
    if (typeof command == "string") {
        if (command.charAt(0) == ".") {
            return "(" + handleExpression(tree[1]) +")" + command;
        }
        if (_LS[command]) {
            return _LS[command](tree);
        }
    }
    handleSubExpressions(tree);
//    tree = _LS.expandObjects(tree);
//    _.each(tree, function(value, i, t) {
//        if (_.isArray(value)) t[i] = handleExpression(value);
//    });
    var fName = tree[0];
    if (!fName) throw _LS.error(1, tree._line);
    if (fName === "_tco") _LS.tconeeded = _LS.tco;
//    if (!_LS.isFunction.test(fName))
//        if (!_LS.validFunction.test(fName)) {
//           console.log(fName);
//           throw _LS.error(2, tree._line);
//        }
    // testing for anonymous func called immediately
    if (_LS.isFunction.test(fName)) fName = "(" + fName + ")";
    return fName + "(" + tree.slice(1).join(",") + ")";
    
};

var handleSubExpressions = function(tree) {
    _.each(tree, function(value, i, t) {
        if (_.isArray(value)) t[i] = handleExpression(value);
    });    
};

var _LS = {};
_LS.version = "0.1.0";
_LS.gen = "// Generated by LispyScript v" + _LS.version + "\n";
_LS.tco = "var _tco = function(f) {var value, active = false, accumulated = [];recur = function() {accumulated.push(arguments);if (!active) {active = true;while (accumulated.length) value = f.apply(this, accumulated.shift());active = false;return value;};};return recur;};var recur;\n";
_LS.tconeeded = "";
_LS.whitespace = /\s/;
_LS.isFunction = /^function/;
_LS.varset = /^var|set\s/;
var validName = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
_LS.validFunction = /^[a-zA-Z_$][0-9a-zA-Z_$.]*$/;
_LS.macros = {};
indent = -4;

_LS.expandObjects = function(tree) {
   for (var i = 0; i < tree.length; i++) {
        if (typeof tree[i] == "object") {
            tree[i] = handleExpression(tree[i]);
        }
    };
    return tree;
};

_LS.macroExpand = function(tree) {
    var command = tree[0];
    var template = _LS.macros[command]["template"];
    var code = _LS.macros[command]["code"];
    var replacements = {};
    for (var i = 0; i < template.length; i++) {
        if (template[i] == "rest...") {
            replacements["~rest..."] = tree.slice(i + 1);
        } else {
            replacements["~" + template[i]] = tree[i + 1];
        }
    }
    var replaceCode = function(source) {
        var ret = [];
        ret._line = tree._line;
        for (var i = 0; i < source.length; i++) {
            if (typeof source[i] == "object") {
                ret.push(replaceCode(source[i]));
            } else {
                var token = source[i];
                var isATSign = false;
                if (token.indexOf("@") >= 0) {
                    isATSign = true;
                    token = token.replace("@", "") ;
                }
                if (replacements[token]) {
                    var repl = replacements[token];
                    if (isATSign) {
                        for (var i = 0; i < repl.length; i++)
                            ret.push(repl[i]);
                    } else {
                        ret.push(repl);
                    }
                } else {                    
                    ret.push(token);
                }
            }
        }
        return ret;
    }
    var ret = replaceCode(code);
    return ret;
};

_LS["var"] = function(arr) {
    if (!validName.test(arr[1])) throw _LS.error(9, arr._line);
    return templates["var"]({rest: _LS.set(arr)});
};

_LS["set"] = function(arr) {
    if (arr.length != 3) throw _LS.error(0, arr._line);
    return templates["set"]({
        name: arr[1],
        value: (typeof arr[2] == "object") ? handleExpression(arr[2]) : arr[2]});
}

_LS["function"] = function(arr) {
    if (arr.length < 3) throw _LS.error(0, arr._line);
    if (typeof arr[1] != "object") throw _LS.error(0, arr._line);
    return templates["function"]({
        params: arr[1].join(","),
        expressions: handleExpressions(arr.slice(2)),
        indent: " ".repeat(indent)});
}

_LS["try"] = function(arr) {
    if (arr.length < 3) throw _LS.error(0, arr._line);
    var c = arr.pop();
    return templates["try"]({
        trypart: handleExpressions(arr.slice(1)),
        catchpart: handleExpression(c),
        indent: " ".repeat(indent)});
}

_LS["if"] = function(arr) {
    if (arr.length < 3 || arr.length > 4)  throw _LS.error(0, arr._line);
    indent += 4;
    handleSubExpressions(arr);
    var ret = templates["if"]({
        condition: arr[1],
        trueexpr: arr[2],
        falseexpr: arr[3],
        indent: " ".repeat(indent)});
    indent -= 4;
    return ret;
}


_LS.get = function(arr) {
    if (arr.length != 3) throw _LS.error(0, arr._line);
    return arr[2] + "[" + arr[1] + "]";
};


_LS.handleOperator = function(arr) {
    if (arr.length != 3)  throw _LS.error(0, arr._line);
    arr = _LS.expandObjects(arr);
    return "(" + arr[1] + " " + arr[0] + " " + arr[2] + ")";    
};

_LS["+"] = _LS.handleOperator;

_LS["-"] = _LS.handleOperator;

_LS["*"] = _LS.handleOperator;

_LS["/"] = _LS.handleOperator;

_LS["%"] = _LS.handleOperator;

_LS["="] = function(arr) {
    if (arr.length != 3)  throw _LS.error(0, arr._line);
    arr = _LS.expandObjects(arr);
    return "(" + arr[1] + " === " + arr[2] + ")";
}

_LS["!="] = function(arr) {
    if (arr.length != 3)  throw _LS.error(0, arr._line);
    arr = _LS.expandObjects(arr);
    return "(" + arr[1] + " !== " + arr[2] + ")";
}

_LS[">"] = _LS.handleOperator;

_LS[">="] = _LS.handleOperator;

_LS["<"] = _LS.handleOperator;

_LS["<="] = _LS.handleOperator;

_LS["||"] = _LS.handleOperator;

_LS["&&"] = _LS.handleOperator;

_LS["!"] = function(arr) {
    if (arr.length != 2)  throw _LS.error(0, arr._line);
    arr = _LS.expandObjects(arr);
    return "(!" + arr[1] + ")";
}

_LS.macro = function(arr) {
    if (arr.length != 4)  throw _LS.error(0, arr._line);
    _LS.macros[arr[1]] = {template: arr[2], code: arr[3]};
    return "";
}

_LS.error = function(no, line) {
    return _LS.err[no] + ", line no " + line;
}
_LS.err = [];
_LS.err[0] = "Syntax Error";
_LS.err[1] = "Empty statement";
_LS.err[2] = "Invalid characters in function name";
_LS.err[3] = "End of File encountered, unterminated string";
_LS.err[4] = "Closing square bracket, without an opening square bracket";
_LS.err[5] = "End of File encountered, unterminated array";
_LS.err[6] = "Closing curly brace, without an opening curly brace";
_LS.err[7] = "End of File encountered, unterminated javascript object '}'";
_LS.err[8] = "End of File encountered, unterminated parenthesis";
_LS.err[9] = "Invalid character in var name";
_LS.err[10] = "UnderscoreJs required\n$ npm install underscore";

this.version = _LS.version;

this._compile = function(code) {
  var tree = parse(code);
  var gen = handleExpressions(tree);
  return _LS.gen +  _LS.tconeeded + gen;
}
