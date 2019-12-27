require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.backend.escodegen.generator',
            doc: void 0
        };
    var wisp_reader = require('./../../reader');
    var readString = wisp_reader.readFromString;
    var read_ = wisp_reader.read_;
    var wisp_ast = require('./../../ast');
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var isSymbol = wisp_ast.isSymbol;
    var symbol = wisp_ast.symbol;
    var isKeyword = wisp_ast.isKeyword;
    var keyword = wisp_ast.keyword;
    var namespace = wisp_ast.namespace;
    var isUnquote = wisp_ast.isUnquote;
    var isUnquoteSplicing = wisp_ast.isUnquoteSplicing;
    var isQuote = wisp_ast.isQuote;
    var isSyntaxQuote = wisp_ast.isSyntaxQuote;
    var name = wisp_ast.name;
    var gensym = wisp_ast.gensym;
    var prStr = wisp_ast.prStr;
    var wisp_sequence = require('./../../sequence');
    var isEmpty = wisp_sequence.isEmpty;
    var count = wisp_sequence.count;
    var isList = wisp_sequence.isList;
    var list = wisp_sequence.list;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var cons = wisp_sequence.cons;
    var conj = wisp_sequence.conj;
    var butlast = wisp_sequence.butlast;
    var reverse = wisp_sequence.reverse;
    var reduce = wisp_sequence.reduce;
    var vec = wisp_sequence.vec;
    var last = wisp_sequence.last;
    var map = wisp_sequence.map;
    var filter = wisp_sequence.filter;
    var take = wisp_sequence.take;
    var concat = wisp_sequence.concat;
    var partition = wisp_sequence.partition;
    var repeat = wisp_sequence.repeat;
    var interleave = wisp_sequence.interleave;
    var wisp_runtime = require('./../../runtime');
    var isOdd = wisp_runtime.isOdd;
    var isDictionary = wisp_runtime.isDictionary;
    var dictionary = wisp_runtime.dictionary;
    var merge = wisp_runtime.merge;
    var keys = wisp_runtime.keys;
    var vals = wisp_runtime.vals;
    var isContainsVector = wisp_runtime.isContainsVector;
    var mapDictionary = wisp_runtime.mapDictionary;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isVector = wisp_runtime.isVector;
    var isBoolean = wisp_runtime.isBoolean;
    var subs = wisp_runtime.subs;
    var reFind = wisp_runtime.reFind;
    var isTrue = wisp_runtime.isTrue;
    var isFalse = wisp_runtime.isFalse;
    var isNil = wisp_runtime.isNil;
    var isRePattern = wisp_runtime.isRePattern;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var str = wisp_runtime.str;
    var char = wisp_runtime.char;
    var int = wisp_runtime.int;
    var isEqual = wisp_runtime.isEqual;
    var isStrictEqual = wisp_runtime.isStrictEqual;
    var wisp_string = require('./../../string');
    var split = wisp_string.split;
    var join = wisp_string.join;
    var upperCase = wisp_string.upperCase;
    var replace = wisp_string.replace;
    var wisp_expander = require('./../../expander');
    var installMacro = wisp_expander.installMacro;
    var wisp_analyzer = require('./../../analyzer');
    var emptyEnv = wisp_analyzer.emptyEnv;
    var analyze = wisp_analyzer.analyze;
    var analyze_ = wisp_analyzer.analyze_;
    var wisp_backend_escodegen_writer = require('./writer');
    var write = wisp_backend_escodegen_writer.write;
    var compile = wisp_backend_escodegen_writer.compile;
    var write_ = wisp_backend_escodegen_writer.write_;
    var escodegen = require('escodegen');
    var generate_ = escodegen.generate;
    var base64Encode = require('base64-encode');
    var btoa = base64Encode;
    var fs = require('fs');
    var readFileSync = fs.readFileSync;
    var writeFileSync = fs.writeFileSync;
    var path = require('path');
    var basename = path.basename;
    var dirname = path.dirname;
    var joinPath = path.join;
}
var generate = exports.generate = function generate(options) {
        var nodes = Array.prototype.slice.call(arguments, 1);
        return function () {
            var astø1 = write_.apply(void 0, nodes);
            var outputø1 = generate_(astø1, {
                    'file': (options || 0)['output-uri'],
                    'sourceContent': (options || 0)['source'],
                    'sourceMap': (options || 0)['source-uri'],
                    'sourceMapRoot': (options || 0)['source-root'],
                    'sourceMapWithCode': true
                });
            (outputø1 || 0)['map'].setSourceContent((options || 0)['source-uri'], (options || 0)['source']);
            return {
                'code': (options || 0)['no-map'] ? (outputø1 || 0)['code'] : '' + (outputø1 || 0)['code'] + '\n//# sourceMappingURL=' + 'data:application/json;base64,' + btoa('' + (outputø1 || 0)['map']) + '\n',
                'source-map': (outputø1 || 0)['map'],
                'js-ast': astø1
            };
        }.call(this);
    };
var expandDefmacro = exports.expandDefmacro = function expandDefmacro(_andForm, id) {
        var body = Array.prototype.slice.call(arguments, 2);
        return function () {
            var fnø1 = withMeta(list.apply(void 0, [symbol(void 0, 'defn')].concat([id], vec(body))), meta(_andForm));
            var formø1 = list.apply(void 0, [symbol(void 0, 'do')].concat([fnø1], [id]));
            var astø1 = analyze(formø1);
            var codeø1 = compile(astø1);
            var macroø1 = eval(codeø1);
            installMacro(id, macroø1);
            return void 0;
        }.call(this);
    };
installMacro(symbol(void 0, 'defmacro'), withMeta(expandDefmacro, { 'implicit': ['&form'] }));


},{"./../../analyzer":"wisp/analyzer","./../../ast":"wisp/ast","./../../expander":"wisp/expander","./../../reader":"wisp/reader","./../../runtime":"wisp/runtime","./../../sequence":"wisp/sequence","./../../string":"wisp/string","./writer":2,"base64-encode":5,"escodegen":9,"fs":7,"path":16}],2:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.backend.escodegen.writer',
            doc: void 0
        };
    var wisp_reader = require('./../../reader');
    var readFromString = wisp_reader.readFromString;
    var wisp_ast = require('./../../ast');
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var isSymbol = wisp_ast.isSymbol;
    var symbol = wisp_ast.symbol;
    var isKeyword = wisp_ast.isKeyword;
    var keyword = wisp_ast.keyword;
    var namespace = wisp_ast.namespace;
    var isUnquote = wisp_ast.isUnquote;
    var isUnquoteSplicing = wisp_ast.isUnquoteSplicing;
    var isQuote = wisp_ast.isQuote;
    var isSyntaxQuote = wisp_ast.isSyntaxQuote;
    var name = wisp_ast.name;
    var gensym = wisp_ast.gensym;
    var prStr = wisp_ast.prStr;
    var wisp_sequence = require('./../../sequence');
    var isEmpty = wisp_sequence.isEmpty;
    var count = wisp_sequence.count;
    var isList = wisp_sequence.isList;
    var list = wisp_sequence.list;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var cons = wisp_sequence.cons;
    var conj = wisp_sequence.conj;
    var butlast = wisp_sequence.butlast;
    var reverse = wisp_sequence.reverse;
    var reduce = wisp_sequence.reduce;
    var vec = wisp_sequence.vec;
    var last = wisp_sequence.last;
    var map = wisp_sequence.map;
    var filter = wisp_sequence.filter;
    var take = wisp_sequence.take;
    var concat = wisp_sequence.concat;
    var partition = wisp_sequence.partition;
    var repeat = wisp_sequence.repeat;
    var interleave = wisp_sequence.interleave;
    var assoc = wisp_sequence.assoc;
    var wisp_runtime = require('./../../runtime');
    var isOdd = wisp_runtime.isOdd;
    var isDictionary = wisp_runtime.isDictionary;
    var dictionary = wisp_runtime.dictionary;
    var merge = wisp_runtime.merge;
    var keys = wisp_runtime.keys;
    var vals = wisp_runtime.vals;
    var isContainsVector = wisp_runtime.isContainsVector;
    var mapDictionary = wisp_runtime.mapDictionary;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isVector = wisp_runtime.isVector;
    var isBoolean = wisp_runtime.isBoolean;
    var subs = wisp_runtime.subs;
    var reFind = wisp_runtime.reFind;
    var isTrue = wisp_runtime.isTrue;
    var isFalse = wisp_runtime.isFalse;
    var isNil = wisp_runtime.isNil;
    var isRePattern = wisp_runtime.isRePattern;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var str = wisp_runtime.str;
    var char = wisp_runtime.char;
    var int = wisp_runtime.int;
    var isEqual = wisp_runtime.isEqual;
    var isStrictEqual = wisp_runtime.isStrictEqual;
    var wisp_string = require('./../../string');
    var split = wisp_string.split;
    var join = wisp_string.join;
    var upperCase = wisp_string.upperCase;
    var replace = wisp_string.replace;
    var triml = wisp_string.triml;
    var wisp_expander = require('./../../expander');
    var installMacro = wisp_expander.installMacro;
    var escodegen = require('escodegen');
    var generate = escodegen.generate;
}
var __uniqueChar__ = exports.__uniqueChar__ = '\xF8';
var toCamelJoin = exports.toCamelJoin = function toCamelJoin(prefix, key) {
        return '' + prefix + (!isEmpty(prefix) && !isEmpty(key) ? '' + upperCase((key || 0)[0]) + subs(key, 1) : key);
    };
var toPrivatePrefix = exports.toPrivatePrefix = function toPrivatePrefix(id) {
        return function () {
            var spaceDelimitedø1 = join(' ', split(id, /-/));
            var leftTrimmedø1 = triml(spaceDelimitedø1);
            var nø1 = count(id) - count(leftTrimmedø1);
            return nø1 > 0 ? '' + join('_', repeat(inc(nø1), '')) + subs(id, nø1) : id;
        }.call(this);
    };
var translateIdentifierWord = exports.translateIdentifierWord = function translateIdentifierWord(form) {
        var id = name(form);
        id = id === '*' ? 'multiply' : id === '/' ? 'divide' : id === '+' ? 'sum' : id === '-' ? 'subtract' : id === '=' ? 'equal?' : id === '==' ? 'strict-equal?' : id === '<=' ? 'not-greater-than' : id === '>=' ? 'not-less-than' : id === '>' ? 'greater-than' : id === '<' ? 'less-than' : id === '->' ? 'thread-first' : 'else' ? id : void 0;
        id = join('_', split(id, '*'));
        id = join('_', split(id, '.'));
        id = subs(id, 0, 2) === '->' ? subs(join('-to-', split(id, '->')), 1) : join('-to-', split(id, '->'));
        id = join(split(id, '!'));
        id = join('$', split(id, '%'));
        id = join('-equal-', split(id, '='));
        id = join('-plus-', split(id, '+'));
        id = join('-and-', split(id, '&'));
        id = last(id) === '?' ? '' + 'is-' + subs(id, 0, dec(count(id))) : id;
        id = toPrivatePrefix(id);
        id = reduce(toCamelJoin, '', split(id, '-'));
        return id;
    };
var translateIdentifier = exports.translateIdentifier = function translateIdentifier(form) {
        return function () {
            var nsø1 = namespace(form);
            return '' + (nsø1 && !isEqual(nsø1, 'js') ? '' + translateIdentifierWord(namespace(form)) + '.' : '') + join('.', map(translateIdentifierWord, split(name(form), '.')));
        }.call(this);
    };
var errorArgCount = exports.errorArgCount = function errorArgCount(callee, n) {
        return (function () {
            throw SyntaxError('' + 'Wrong number of arguments (' + n + ') passed to: ' + callee);
        })();
    };
var inheritLocation = exports.inheritLocation = function inheritLocation(body) {
        return function () {
            var startø1 = ((first(body) || 0)['loc'] || 0)['start'];
            var endø1 = ((last(body) || 0)['loc'] || 0)['end'];
            return !(isNil(startø1) || isNil(endø1)) ? {
                'start': startø1,
                'end': endø1
            } : void 0;
        }.call(this);
    };
var writeLocation = exports.writeLocation = function writeLocation(form, original) {
        return function () {
            var dataø1 = meta(form);
            var inheritedø1 = meta(original);
            var startø1 = (form || 0)['start'] || (dataø1 || 0)['start'] || (inheritedø1 || 0)['start'];
            var endø1 = (form || 0)['end'] || (dataø1 || 0)['end'] || (inheritedø1 || 0)['end'];
            return !isNil(startø1) ? {
                'loc': {
                    'start': {
                        'line': inc((startø1 || 0)['line']),
                        'column': (startø1 || 0)['column']
                    },
                    'end': {
                        'line': inc((endø1 || 0)['line']),
                        'column': (endø1 || 0)['column']
                    }
                }
            } : {};
        }.call(this);
    };
var __writers__ = exports.__writers__ = {};
var installWriter = exports.installWriter = function installWriter(op, writer) {
        return (__writers__ || 0)[op] = writer;
    };
var writeOp = exports.writeOp = function writeOp(op, form) {
        return function () {
            var writerø1 = (__writers__ || 0)[op];
            !writerø1 ? (function () {
                throw Error('' + 'Assert failed: ' + ('' + 'Unsupported operation: ' + op) + 'writer');
            })() : void 0;
            return conj(writeLocation((form || 0)['form'], (form || 0)['original-form']), writerø1(form));
        }.call(this);
    };
var __specials__ = exports.__specials__ = {};
var installSpecial = exports.installSpecial = function installSpecial(op, writer) {
        return (__specials__ || 0)[name(op)] = writer;
    };
var writeSpecial = exports.writeSpecial = function writeSpecial(writer, form) {
        return conj(writeLocation((form || 0)['form'], (form || 0)['original-form']), writer.apply(void 0, (form || 0)['params']));
    };
var writeNil = exports.writeNil = function writeNil(form) {
        return {
            'type': 'UnaryExpression',
            'operator': 'void',
            'argument': {
                'type': 'Literal',
                'value': 0
            },
            'prefix': true
        };
    };
installWriter('nil', writeNil);
var writeLiteral = exports.writeLiteral = function writeLiteral(form) {
        return {
            'type': 'Literal',
            'value': form
        };
    };
var writeList = exports.writeList = function writeList(form) {
        return {
            'type': 'CallExpression',
            'callee': write({
                'op': 'var',
                'form': symbol(void 0, 'list')
            }),
            'arguments': map(write, (form || 0)['items'])
        };
    };
installWriter('list', writeList);
var writeSymbol = exports.writeSymbol = function writeSymbol(form) {
        return {
            'type': 'CallExpression',
            'callee': write({
                'op': 'var',
                'form': symbol(void 0, 'symbol')
            }),
            'arguments': [
                writeConstant((form || 0)['namespace']),
                writeConstant((form || 0)['name'])
            ]
        };
    };
installWriter('symbol', writeSymbol);
var writeConstant = exports.writeConstant = function writeConstant(form) {
        return isNil(form) ? writeNil(form) : isKeyword(form) ? writeLiteral(namespace(form) ? '' + namespace(form) + '/' + name(form) : name(form)) : isNumber(form) ? writeNumber(form.valueOf()) : isString(form) ? writeString(form) : 'else' ? writeLiteral(form) : void 0;
    };
installWriter('constant', function ($1) {
    return writeConstant(($1 || 0)['form']);
});
var writeString = exports.writeString = function writeString(form) {
        return {
            'type': 'Literal',
            'value': '' + form
        };
    };
var writeNumber = exports.writeNumber = function writeNumber(form) {
        return form < 0 ? {
            'type': 'UnaryExpression',
            'operator': '-',
            'prefix': true,
            'argument': writeNumber(form * -1)
        } : writeLiteral(form);
    };
var writeKeyword = exports.writeKeyword = function writeKeyword(form) {
        return {
            'type': 'Literal',
            'value': (form || 0)['form']
        };
    };
installWriter('keyword', writeKeyword);
var toIdentifier = exports.toIdentifier = function toIdentifier(form) {
        return {
            'type': 'Identifier',
            'name': translateIdentifier(form)
        };
    };
var writeBindingVar = exports.writeBindingVar = function writeBindingVar(form) {
        return function () {
            var baseIdø1 = (form || 0)['id'];
            var resolvedIdø1 = (form || 0)['shadow'] ? symbol(void 0, '' + translateIdentifier(baseIdø1) + __uniqueChar__ + (form || 0)['depth']) : baseIdø1;
            return conj(toIdentifier(resolvedIdø1), writeLocation(baseIdø1));
        }.call(this);
    };
var writeVar = exports.writeVar = function writeVar(node) {
        return isEqual('binding', ((node || 0)['binding'] || 0)['type']) ? conj(writeBindingVar((node || 0)['binding']), writeLocation((node || 0)['form'])) : conj(writeLocation((node || 0)['form']), toIdentifier((node || 0)['form']));
    };
installWriter('var', writeVar);
installWriter('param', writeVar);
var writeInvoke = exports.writeInvoke = function writeInvoke(form) {
        return {
            'type': 'CallExpression',
            'callee': write((form || 0)['callee']),
            'arguments': map(write, (form || 0)['params'])
        };
    };
installWriter('invoke', writeInvoke);
var writeVector = exports.writeVector = function writeVector(form) {
        return {
            'type': 'ArrayExpression',
            'elements': map(write, (form || 0)['items'])
        };
    };
installWriter('vector', writeVector);
var writeDictionary = exports.writeDictionary = function writeDictionary(form) {
        return function () {
            var propertiesø1 = partition(2, interleave((form || 0)['keys'], (form || 0)['values']));
            return {
                'type': 'ObjectExpression',
                'properties': map(function (pair) {
                    return function () {
                        var keyø1 = first(pair);
                        var valueø1 = second(pair);
                        return {
                            'kind': 'init',
                            'type': 'Property',
                            'key': isEqual('symbol', (keyø1 || 0)['op']) ? writeConstant('' + (keyø1 || 0)['form']) : write(keyø1),
                            'value': write(valueø1)
                        };
                    }.call(this);
                }, propertiesø1)
            };
        }.call(this);
    };
installWriter('dictionary', writeDictionary);
var writeExport = exports.writeExport = function writeExport(form) {
        return write({
            'op': 'set!',
            'target': {
                'op': 'member-expression',
                'computed': false,
                'target': {
                    'op': 'var',
                    'form': withMeta(symbol(void 0, 'exports'), meta(((form || 0)['id'] || 0)['form']))
                },
                'property': (form || 0)['id'],
                'form': ((form || 0)['id'] || 0)['form']
            },
            'value': (form || 0)['init'],
            'form': ((form || 0)['id'] || 0)['form']
        });
    };
var writeDef = exports.writeDef = function writeDef(form) {
        return conj({
            'type': 'VariableDeclaration',
            'kind': 'var',
            'declarations': [conj({
                    'type': 'VariableDeclarator',
                    'id': write((form || 0)['id']),
                    'init': conj((form || 0)['export'] ? writeExport(form) : write((form || 0)['init']))
                }, writeLocation(((form || 0)['id'] || 0)['form']))]
        }, writeLocation((form || 0)['form'], (form || 0)['original-form']));
    };
installWriter('def', writeDef);
var writeBinding = exports.writeBinding = function writeBinding(form) {
        return function () {
            var idø1 = writeBindingVar(form);
            var initø1 = write((form || 0)['init']);
            return {
                'type': 'VariableDeclaration',
                'kind': 'var',
                'loc': inheritLocation([
                    idø1,
                    initø1
                ]),
                'declarations': [{
                        'type': 'VariableDeclarator',
                        'id': idø1,
                        'init': initø1
                    }]
            };
        }.call(this);
    };
installWriter('binding', writeBinding);
var writeThrow = exports.writeThrow = function writeThrow(form) {
        return toExpression(conj({
            'type': 'ThrowStatement',
            'argument': write((form || 0)['throw'])
        }, writeLocation((form || 0)['form'], (form || 0)['original-form'])));
    };
installWriter('throw', writeThrow);
var writeNew = exports.writeNew = function writeNew(form) {
        return {
            'type': 'NewExpression',
            'callee': write((form || 0)['constructor']),
            'arguments': map(write, (form || 0)['params'])
        };
    };
installWriter('new', writeNew);
var writeSet = exports.writeSet = function writeSet(form) {
        return {
            'type': 'AssignmentExpression',
            'operator': '=',
            'left': write((form || 0)['target']),
            'right': write((form || 0)['value'])
        };
    };
installWriter('set!', writeSet);
var writeAget = exports.writeAget = function writeAget(form) {
        return {
            'type': 'MemberExpression',
            'computed': (form || 0)['computed'],
            'object': write((form || 0)['target']),
            'property': write((form || 0)['property'])
        };
    };
installWriter('member-expression', writeAget);
var __statements__ = exports.__statements__ = {
        'EmptyStatement': true,
        'BlockStatement': true,
        'ExpressionStatement': true,
        'IfStatement': true,
        'LabeledStatement': true,
        'BreakStatement': true,
        'ContinueStatement': true,
        'SwitchStatement': true,
        'ReturnStatement': true,
        'ThrowStatement': true,
        'TryStatement': true,
        'WhileStatement': true,
        'DoWhileStatement': true,
        'ForStatement': true,
        'ForInStatement': true,
        'ForOfStatement': true,
        'LetStatement': true,
        'VariableDeclaration': true,
        'FunctionDeclaration': true
    };
var writeStatement = exports.writeStatement = function writeStatement(form) {
        return toStatement(write(form));
    };
var toStatement = exports.toStatement = function toStatement(node) {
        return (__statements__ || 0)[(node || 0)['type']] ? node : {
            'type': 'ExpressionStatement',
            'expression': node,
            'loc': (node || 0)['loc']
        };
    };
var toReturn = exports.toReturn = function toReturn(form) {
        return conj({
            'type': 'ReturnStatement',
            'argument': write(form)
        }, writeLocation((form || 0)['form'], (form || 0)['original-form']));
    };
var writeBody = exports.writeBody = function writeBody(form) {
        return function () {
            var statementsø1 = map(writeStatement, (form || 0)['statements'] || []);
            var resultø1 = (form || 0)['result'] ? toReturn((form || 0)['result']) : void 0;
            return resultø1 ? conj(statementsø1, resultø1) : statementsø1;
        }.call(this);
    };
var toBlock = exports.toBlock = function toBlock(body) {
        return isVector(body) ? {
            'type': 'BlockStatement',
            'body': body,
            'loc': inheritLocation(body)
        } : {
            'type': 'BlockStatement',
            'body': [body],
            'loc': (body || 0)['loc']
        };
    };
var toExpression = exports.toExpression = function toExpression() {
        var body = Array.prototype.slice.call(arguments, 0);
        return {
            'type': 'CallExpression',
            'arguments': [],
            'loc': inheritLocation(body),
            'callee': toSequence([{
                    'type': 'FunctionExpression',
                    'id': void 0,
                    'params': [],
                    'defaults': [],
                    'expression': false,
                    'generator': false,
                    'rest': void 0,
                    'body': toBlock(body)
                }])
        };
    };
var writeDo = exports.writeDo = function writeDo(form) {
        return (meta(first((form || 0)['form'])) || 0)['block'] ? toBlock(writeBody(conj(form, {
            'result': void 0,
            'statements': conj((form || 0)['statements'], (form || 0)['result'])
        }))) : toExpression.apply(void 0, writeBody(form));
    };
installWriter('do', writeDo);
var writeIf = exports.writeIf = function writeIf(form) {
        return {
            'type': 'ConditionalExpression',
            'test': write((form || 0)['test']),
            'consequent': write((form || 0)['consequent']),
            'alternate': write((form || 0)['alternate'])
        };
    };
installWriter('if', writeIf);
var writeTry = exports.writeTry = function writeTry(form) {
        return function () {
            var handlerø1 = (form || 0)['handler'];
            var finalizerø1 = (form || 0)['finalizer'];
            return toExpression(conj({
                'type': 'TryStatement',
                'guardedHandlers': [],
                'block': toBlock(writeBody((form || 0)['body'])),
                'handlers': handlerø1 ? [{
                        'type': 'CatchClause',
                        'param': write((handlerø1 || 0)['name']),
                        'body': toBlock(writeBody(handlerø1))
                    }] : [],
                'finalizer': finalizerø1 ? toBlock(writeBody(finalizerø1)) : !handlerø1 ? toBlock([]) : 'else' ? void 0 : void 0
            }, writeLocation((form || 0)['form'], (form || 0)['original-form'])));
        }.call(this);
    };
installWriter('try', writeTry);
var writeBindingValue = function writeBindingValue(form) {
    return write((form || 0)['init']);
};
var writeBindingParam = function writeBindingParam(form) {
    return writeVar({ 'form': (form || 0)['name'] });
};
var writeBinding = exports.writeBinding = function writeBinding(form) {
        return write({
            'op': 'def',
            'var': form,
            'init': (form || 0)['init'],
            'form': form
        });
    };
var writeLet = exports.writeLet = function writeLet(form) {
        return function () {
            var bodyø1 = conj(form, { 'statements': vec(concat((form || 0)['bindings'], (form || 0)['statements'])) });
            return toIife(toBlock(writeBody(bodyø1)));
        }.call(this);
    };
installWriter('let', writeLet);
var toRebind = exports.toRebind = function toRebind(form) {
        return function loop() {
            var recur = loop;
            var resultø1 = [];
            var bindingsø1 = (form || 0)['bindings'];
            do {
                recur = isEmpty(bindingsø1) ? resultø1 : (loop[0] = conj(resultø1, {
                    'type': 'AssignmentExpression',
                    'operator': '=',
                    'left': writeBindingVar(first(bindingsø1)),
                    'right': {
                        'type': 'MemberExpression',
                        'computed': true,
                        'object': {
                            'type': 'Identifier',
                            'name': 'loop'
                        },
                        'property': {
                            'type': 'Literal',
                            'value': count(resultø1)
                        }
                    }
                }), loop[1] = rest(bindingsø1), loop);
            } while (resultø1 = loop[0], bindingsø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var toSequence = exports.toSequence = function toSequence(expressions) {
        return {
            'type': 'SequenceExpression',
            'expressions': expressions
        };
    };
var toIife = exports.toIife = function toIife(body, id) {
        return {
            'type': 'CallExpression',
            'arguments': [{ 'type': 'ThisExpression' }],
            'callee': {
                'type': 'MemberExpression',
                'computed': false,
                'object': {
                    'type': 'FunctionExpression',
                    'id': id,
                    'params': [],
                    'defaults': [],
                    'expression': false,
                    'generator': false,
                    'rest': void 0,
                    'body': body
                },
                'property': {
                    'type': 'Identifier',
                    'name': 'call'
                }
            }
        };
    };
var toLoopInit = exports.toLoopInit = function toLoopInit() {
        return {
            'type': 'VariableDeclaration',
            'kind': 'var',
            'declarations': [{
                    'type': 'VariableDeclarator',
                    'id': {
                        'type': 'Identifier',
                        'name': 'recur'
                    },
                    'init': {
                        'type': 'Identifier',
                        'name': 'loop'
                    }
                }]
        };
    };
var toDoWhile = exports.toDoWhile = function toDoWhile(body, test) {
        return {
            'type': 'DoWhileStatement',
            'body': body,
            'test': test
        };
    };
var toSetRecur = exports.toSetRecur = function toSetRecur(form) {
        return {
            'type': 'AssignmentExpression',
            'operator': '=',
            'left': {
                'type': 'Identifier',
                'name': 'recur'
            },
            'right': write(form)
        };
    };
var toLoop = exports.toLoop = function toLoop(form) {
        return toSequence(conj(toRebind(form), {
            'type': 'BinaryExpression',
            'operator': '===',
            'left': {
                'type': 'Identifier',
                'name': 'recur'
            },
            'right': {
                'type': 'Identifier',
                'name': 'loop'
            }
        }));
    };
var writeLoop = exports.writeLoop = function writeLoop(form) {
        return function () {
            var statementsø1 = (form || 0)['statements'];
            var resultø1 = (form || 0)['result'];
            var bindingsø1 = (form || 0)['bindings'];
            var loopBodyø1 = conj(map(writeStatement, statementsø1), toStatement(toSetRecur(resultø1)));
            var bodyø1 = concat([toLoopInit()], map(write, bindingsø1), [toDoWhile(toBlock(vec(loopBodyø1)), toLoop(form))], [{
                        'type': 'ReturnStatement',
                        'argument': {
                            'type': 'Identifier',
                            'name': 'recur'
                        }
                    }]);
            return toIife(toBlock(vec(bodyø1)), symbol(void 0, 'loop'));
        }.call(this);
    };
installWriter('loop', writeLoop);
var toRecur = exports.toRecur = function toRecur(form) {
        return function loop() {
            var recur = loop;
            var resultø1 = [];
            var paramsø1 = (form || 0)['params'];
            do {
                recur = isEmpty(paramsø1) ? resultø1 : (loop[0] = conj(resultø1, {
                    'type': 'AssignmentExpression',
                    'operator': '=',
                    'right': write(first(paramsø1)),
                    'left': {
                        'type': 'MemberExpression',
                        'computed': true,
                        'object': {
                            'type': 'Identifier',
                            'name': 'loop'
                        },
                        'property': {
                            'type': 'Literal',
                            'value': count(resultø1)
                        }
                    }
                }), loop[1] = rest(paramsø1), loop);
            } while (resultø1 = loop[0], paramsø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var writeRecur = exports.writeRecur = function writeRecur(form) {
        return toSequence(conj(toRecur(form), {
            'type': 'Identifier',
            'name': 'loop'
        }));
    };
installWriter('recur', writeRecur);
var fallbackOverload = exports.fallbackOverload = function fallbackOverload() {
        return {
            'type': 'SwitchCase',
            'test': void 0,
            'consequent': [{
                    'type': 'ThrowStatement',
                    'argument': {
                        'type': 'CallExpression',
                        'callee': {
                            'type': 'Identifier',
                            'name': 'RangeError'
                        },
                        'arguments': [{
                                'type': 'Literal',
                                'value': 'Wrong number of arguments passed'
                            }]
                    }
                }]
        };
    };
var spliceBinding = exports.spliceBinding = function spliceBinding(form) {
        return {
            'op': 'def',
            'id': last((form || 0)['params']),
            'init': {
                'op': 'invoke',
                'callee': {
                    'op': 'var',
                    'form': symbol(void 0, 'Array.prototype.slice.call')
                },
                'params': [
                    {
                        'op': 'var',
                        'form': symbol(void 0, 'arguments')
                    },
                    {
                        'op': 'constant',
                        'form': (form || 0)['arity'],
                        'type': 'number'
                    }
                ]
            }
        };
    };
var writeOverloadingParams = exports.writeOverloadingParams = function writeOverloadingParams(params) {
        return reduce(function (forms, param) {
            return conj(forms, {
                'op': 'def',
                'id': param,
                'init': {
                    'op': 'member-expression',
                    'computed': true,
                    'target': {
                        'op': 'var',
                        'form': symbol(void 0, 'arguments')
                    },
                    'property': {
                        'op': 'constant',
                        'type': 'number',
                        'form': count(forms)
                    }
                }
            });
        }, [], params);
    };
var writeOverloadingFn = exports.writeOverloadingFn = function writeOverloadingFn(form) {
        return function () {
            var overloadsø1 = map(writeFnOverload, (form || 0)['methods']);
            return {
                'params': [],
                'body': toBlock({
                    'type': 'SwitchStatement',
                    'discriminant': {
                        'type': 'MemberExpression',
                        'computed': false,
                        'object': {
                            'type': 'Identifier',
                            'name': 'arguments'
                        },
                        'property': {
                            'type': 'Identifier',
                            'name': 'length'
                        }
                    },
                    'cases': (form || 0)['variadic'] ? overloadsø1 : conj(overloadsø1, fallbackOverload())
                })
            };
        }.call(this);
    };
var writeFnOverload = exports.writeFnOverload = function writeFnOverload(form) {
        return function () {
            var paramsø1 = (form || 0)['params'];
            var bindingsø1 = (form || 0)['variadic'] ? conj(writeOverloadingParams(butlast(paramsø1)), spliceBinding(form)) : writeOverloadingParams(paramsø1);
            var statementsø1 = vec(concat(bindingsø1, (form || 0)['statements']));
            return {
                'type': 'SwitchCase',
                'test': !(form || 0)['variadic'] ? {
                    'type': 'Literal',
                    'value': (form || 0)['arity']
                } : void 0,
                'consequent': writeBody(conj(form, { 'statements': statementsø1 }))
            };
        }.call(this);
    };
var writeSimpleFn = exports.writeSimpleFn = function writeSimpleFn(form) {
        return function () {
            var methodø1 = first((form || 0)['methods']);
            var paramsø1 = (methodø1 || 0)['variadic'] ? butlast((methodø1 || 0)['params']) : (methodø1 || 0)['params'];
            var bodyø1 = (methodø1 || 0)['variadic'] ? conj(methodø1, { 'statements': vec(cons(spliceBinding(methodø1), (methodø1 || 0)['statements'])) }) : methodø1;
            return {
                'params': map(writeVar, paramsø1),
                'body': toBlock(writeBody(bodyø1))
            };
        }.call(this);
    };
var resolve = exports.resolve = function resolve(from, to) {
        return function () {
            var requirerø1 = split(name(from), '.');
            var requirementø1 = split(name(to), '.');
            var isRelativeø1 = !(name(from) === name(to)) && first(requirerø1) === first(requirementø1);
            return isRelativeø1 ? function loop() {
                var recur = loop;
                var fromø2 = requirerø1;
                var toø2 = requirementø1;
                do {
                    recur = first(fromø2) === first(toø2) ? (loop[0] = rest(fromø2), loop[1] = rest(toø2), loop) : join('/', concat(['.'], repeat(dec(count(fromø2)), '..'), toø2));
                } while (fromø2 = loop[0], toø2 = loop[1], recur === loop);
                return recur;
            }.call(this) : join('/', requirementø1);
        }.call(this);
    };
var idToNs = exports.idToNs = function idToNs(id) {
        return symbol(void 0, join('*', split(name(id), '.')));
    };
var writeRequire = exports.writeRequire = function writeRequire(form, requirer) {
        return function () {
            var nsBindingø1 = {
                    'op': 'def',
                    'id': {
                        'op': 'var',
                        'type': 'identifier',
                        'form': idToNs((form || 0)['ns'])
                    },
                    'init': {
                        'op': 'invoke',
                        'callee': {
                            'op': 'var',
                            'type': 'identifier',
                            'form': symbol(void 0, 'require')
                        },
                        'params': [{
                                'op': 'constant',
                                'form': resolve(requirer, (form || 0)['ns'])
                            }]
                    }
                };
            var nsAliasø1 = (form || 0)['alias'] ? {
                    'op': 'def',
                    'id': {
                        'op': 'var',
                        'type': 'identifier',
                        'form': idToNs((form || 0)['alias'])
                    },
                    'init': (nsBindingø1 || 0)['id']
                } : void 0;
            var referencesø1 = reduce(function (references, form) {
                    return conj(references, {
                        'op': 'def',
                        'id': {
                            'op': 'var',
                            'type': 'identifier',
                            'form': (form || 0)['rename'] || (form || 0)['name']
                        },
                        'init': {
                            'op': 'member-expression',
                            'computed': false,
                            'target': (nsBindingø1 || 0)['id'],
                            'property': {
                                'op': 'var',
                                'type': 'identifier',
                                'form': (form || 0)['name']
                            }
                        }
                    });
                }, [], (form || 0)['refer']);
            return vec(cons(nsBindingø1, nsAliasø1 ? cons(nsAliasø1, referencesø1) : referencesø1));
        }.call(this);
    };
var writeNs = exports.writeNs = function writeNs(form) {
        return function () {
            var nodeø1 = (form || 0)['form'];
            var requirerø1 = (form || 0)['name'];
            var nsBindingø1 = {
                    'op': 'def',
                    'original-form': nodeø1,
                    'id': {
                        'op': 'var',
                        'type': 'identifier',
                        'original-form': first(nodeø1),
                        'form': symbol(void 0, '*ns*')
                    },
                    'init': {
                        'op': 'dictionary',
                        'form': nodeø1,
                        'keys': [
                            {
                                'op': 'var',
                                'type': 'identifier',
                                'original-form': nodeø1,
                                'form': symbol(void 0, 'id')
                            },
                            {
                                'op': 'var',
                                'type': 'identifier',
                                'original-form': nodeø1,
                                'form': symbol(void 0, 'doc')
                            }
                        ],
                        'values': [
                            {
                                'op': 'constant',
                                'type': 'identifier',
                                'original-form': (form || 0)['name'],
                                'form': name((form || 0)['name'])
                            },
                            {
                                'op': 'constant',
                                'original-form': nodeø1,
                                'form': (form || 0)['doc']
                            }
                        ]
                    }
                };
            var requirementsø1 = vec(concat.apply(void 0, map(function ($1) {
                    return writeRequire($1, requirerø1);
                }, (form || 0)['require'])));
            return toBlock(map(write, vec(cons(nsBindingø1, requirementsø1))));
        }.call(this);
    };
installWriter('ns', writeNs);
var writeFn = exports.writeFn = function writeFn(form) {
        return function () {
            var baseø1 = count((form || 0)['methods']) > 1 ? writeOverloadingFn(form) : writeSimpleFn(form);
            return conj(baseø1, {
                'type': 'FunctionExpression',
                'id': (form || 0)['id'] ? writeVar((form || 0)['id']) : void 0,
                'defaults': void 0,
                'rest': void 0,
                'generator': false,
                'expression': false
            });
        }.call(this);
    };
installWriter('fn', writeFn);
var write = exports.write = function write(form) {
        return function () {
            var opø1 = (form || 0)['op'];
            var writerø1 = isEqual('invoke', (form || 0)['op']) && isEqual('var', ((form || 0)['callee'] || 0)['op']) && (__specials__ || 0)[name(((form || 0)['callee'] || 0)['form'])];
            return writerø1 ? writeSpecial(writerø1, form) : writeOp((form || 0)['op'], form);
        }.call(this);
    };
var write_ = exports.write_ = function write_() {
        var forms = Array.prototype.slice.call(arguments, 0);
        return function () {
            var bodyø1 = map(writeStatement, forms);
            return {
                'type': 'Program',
                'body': bodyø1,
                'loc': inheritLocation(bodyø1)
            };
        }.call(this);
    };
var compile = exports.compile = function compile() {
        switch (arguments.length) {
        case 1:
            var form = arguments[0];
            return compile({}, form);
        default:
            var options = arguments[0];
            var forms = Array.prototype.slice.call(arguments, 1);
            return generate(write_.apply(void 0, forms), options);
        }
    };
var getMacro = exports.getMacro = function getMacro(target, property) {
        return list.apply(void 0, [symbol(void 0, 'aget')].concat([list.apply(void 0, [symbol(void 0, 'or')].concat([target], [0]))], [property]));
    };
installMacro('get', getMacro);
var installLogicalOperator = exports.installLogicalOperator = function installLogicalOperator(callee, operator, fallback) {
        var writeLogicalOperator = function writeLogicalOperator() {
            var operands = Array.prototype.slice.call(arguments, 0);
            return function () {
                var nø1 = count(operands);
                return isEqual(nø1, 0) ? writeConstant(fallback) : isEqual(nø1, 1) ? write(first(operands)) : 'else' ? reduce(function (left, right) {
                    return {
                        'type': 'LogicalExpression',
                        'operator': operator,
                        'left': left,
                        'right': write(right)
                    };
                }, write(first(operands)), rest(operands)) : void 0;
            }.call(this);
        };
        return installSpecial(callee, writeLogicalOperator);
    };
installLogicalOperator('or', '||', void 0);
installLogicalOperator('and', '&&', true);
var installUnaryOperator = exports.installUnaryOperator = function installUnaryOperator(callee, operator, isPrefix) {
        var writeUnaryOperator = function writeUnaryOperator() {
            var params = Array.prototype.slice.call(arguments, 0);
            return count(params) === 1 ? {
                'type': 'UnaryExpression',
                'operator': operator,
                'argument': write(first(params)),
                'prefix': isPrefix
            } : errorArgCount(callee, count(params));
        };
        return installSpecial(callee, writeUnaryOperator);
    };
installUnaryOperator('not', '!');
installUnaryOperator('bit-not', '~');
var installBinaryOperator = exports.installBinaryOperator = function installBinaryOperator(callee, operator) {
        var writeBinaryOperator = function writeBinaryOperator() {
            var params = Array.prototype.slice.call(arguments, 0);
            return count(params) < 2 ? errorArgCount(callee, count(params)) : reduce(function (left, right) {
                return {
                    'type': 'BinaryExpression',
                    'operator': operator,
                    'left': left,
                    'right': write(right)
                };
            }, write(first(params)), rest(params));
        };
        return installSpecial(callee, writeBinaryOperator);
    };
installBinaryOperator('bit-and', '&');
installBinaryOperator('bit-or', '|');
installBinaryOperator('bit-xor', '^');
installBinaryOperator('bit-shift-left', '<<');
installBinaryOperator('bit-shift-right', '>>');
installBinaryOperator('bit-shift-right-zero-fil', '>>>');
var installArithmeticOperator = exports.installArithmeticOperator = function installArithmeticOperator(callee, operator, isValid, fallback) {
        var writeBinaryOperator = function writeBinaryOperator(left, right) {
            return {
                'type': 'BinaryExpression',
                'operator': name(operator),
                'left': left,
                'right': write(right)
            };
        };
        var writeArithmeticOperator = function writeArithmeticOperator() {
            var params = Array.prototype.slice.call(arguments, 0);
            return function () {
                var nø1 = count(params);
                return isValid && !isValid(nø1) ? errorArgCount(name(callee), nø1) : nø1 == 0 ? writeLiteral(fallback) : nø1 == 1 ? reduce(writeBinaryOperator, writeLiteral(fallback), params) : 'else' ? reduce(writeBinaryOperator, write(first(params)), rest(params)) : void 0;
            }.call(this);
        };
        return installSpecial(callee, writeArithmeticOperator);
    };
installArithmeticOperator('+', '+', void 0, 0);
installArithmeticOperator('-', '-', function ($1) {
    return $1 >= 1;
}, 0);
installArithmeticOperator('*', '*', void 0, 1);
installArithmeticOperator(keyword('/'), keyword('/'), function ($1) {
    return $1 >= 1;
}, 1);
installArithmeticOperator('mod', keyword('%'), function ($1) {
    return $1 == 2;
}, 1);
var installComparisonOperator = exports.installComparisonOperator = function installComparisonOperator(callee, operator, fallback) {
        var writeComparisonOperator = function writeComparisonOperator() {
            switch (arguments.length) {
            case 0:
                return errorArgCount(callee, 0);
            case 1:
                var form = arguments[0];
                return toSequence([
                    write(form),
                    writeLiteral(fallback)
                ]);
            case 2:
                var left = arguments[0];
                var right = arguments[1];
                return {
                    'type': 'BinaryExpression',
                    'operator': operator,
                    'left': write(left),
                    'right': write(right)
                };
            default:
                var left = arguments[0];
                var right = arguments[1];
                var more = Array.prototype.slice.call(arguments, 2);
                return reduce(function (left, right) {
                    return {
                        'type': 'LogicalExpression',
                        'operator': '&&',
                        'left': left,
                        'right': {
                            'type': 'BinaryExpression',
                            'operator': operator,
                            'left': isEqual('LogicalExpression', (left || 0)['type']) ? ((left || 0)['right'] || 0)['right'] : (left || 0)['right'],
                            'right': write(right)
                        }
                    };
                }, writeComparisonOperator(left, right), more);
            }
        };
        return installSpecial(callee, writeComparisonOperator);
    };
installComparisonOperator('==', '==', true);
installComparisonOperator('>', '>', true);
installComparisonOperator('>=', '>=', true);
installComparisonOperator('<', '<', true);
installComparisonOperator('<=', '<=', true);
var isWriteIdentical = exports.isWriteIdentical = function isWriteIdentical() {
        var params = Array.prototype.slice.call(arguments, 0);
        return count(params) === 2 ? {
            'type': 'BinaryExpression',
            'operator': '===',
            'left': write(first(params)),
            'right': write(second(params))
        } : errorArgCount('identical?', count(params));
    };
installSpecial('identical?', isWriteIdentical);
var isWriteInstance = exports.isWriteInstance = function isWriteInstance() {
        var params = Array.prototype.slice.call(arguments, 0);
        return function () {
            var constructorø1 = first(params);
            var instanceø1 = second(params);
            return count(params) < 1 ? errorArgCount('instance?', count(params)) : {
                'type': 'BinaryExpression',
                'operator': 'instanceof',
                'left': instanceø1 ? write(instanceø1) : writeConstant(instanceø1),
                'right': write(constructorø1)
            };
        }.call(this);
    };
installSpecial('instance?', isWriteInstance);
var expandApply = exports.expandApply = function expandApply(f) {
        var params = Array.prototype.slice.call(arguments, 1);
        return function () {
            var prefixø1 = vec(butlast(params));
            return isEmpty(prefixø1) ? list.apply(void 0, [symbol(void 0, '.apply')].concat([f], [void 0], vec(params))) : list.apply(void 0, [symbol(void 0, '.apply')].concat([f], [void 0], [list.apply(void 0, [symbol(void 0, '.concat')].concat([prefixø1], [last(params)]))]));
        }.call(this);
    };
installMacro('apply', expandApply);
var expandPrint = exports.expandPrint = function expandPrint(_andForm) {
        var more = Array.prototype.slice.call(arguments, 1);
        'Prints the object(s) to the output for human consumption.';
        return function () {
            var opø1 = withMeta(symbol(void 0, 'console.log'), meta(_andForm));
            return list.apply(void 0, [opø1].concat(vec(more)));
        }.call(this);
    };
installMacro('print', withMeta(expandPrint, { 'implicit': ['&form'] }));
var expandStr = exports.expandStr = function expandStr() {
        var forms = Array.prototype.slice.call(arguments, 0);
        return list.apply(void 0, [symbol(void 0, '+')].concat([''], vec(forms)));
    };
installMacro('str', expandStr);
var expandDebug = exports.expandDebug = function expandDebug() {
        return symbol(void 0, 'debugger');
    };
installMacro('debugger!', expandDebug);
var expandAssert = exports.expandAssert = function expandAssert() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return expandAssert(x, '');
        case 2:
            var x = arguments[0];
            var message = arguments[1];
            return function () {
                var formø1 = prStr(x);
                return list.apply(void 0, [symbol(void 0, 'if')].concat([list.apply(void 0, [symbol(void 0, 'not')].concat([x]))], [list.apply(void 0, [symbol(void 0, 'throw')].concat([list.apply(void 0, [symbol(void 0, 'Error')].concat([list.apply(void 0, [symbol(void 0, 'str')].concat(['Assert failed: '], [message], [formø1]))]))]))]));
            }.call(this);
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
installMacro('assert', expandAssert);
var expandDefprotocol = exports.expandDefprotocol = function expandDefprotocol(_andEnv, id) {
        var forms = Array.prototype.slice.call(arguments, 2);
        return function () {
            var nsø1 = name(((_andEnv || 0)['ns'] || 0)['name']);
            var protocolNameø1 = name(id);
            var protocolDocø1 = isString(first(forms)) ? first(forms) : void 0;
            var protocolMethodsø1 = protocolDocø1 ? rest(forms) : forms;
            var protocolø1 = reduce(function (protocol, method) {
                    return function () {
                        var methodNameø1 = first(method);
                        var idø2 = idToNs('' + nsø1 + '$' + protocolNameø1 + '$' + name(methodNameø1));
                        return conj(protocol, {
                            'id': methodNameø1,
                            'fn': list.apply(void 0, [symbol(void 0, 'fn')].concat([idø2], [[symbol(void 0, 'self')].concat()], [list.apply(void 0, [symbol(void 0, 'def')].concat([symbol(void 0, 'f')], [list.apply(void 0, [symbol(void 0, 'cond')].concat([list.apply(void 0, [symbol(void 0, 'identical?')].concat([symbol(void 0, 'self')], [symbol(void 0, 'null')]))], [list.apply(void 0, [symbol(void 0, '.-nil')].concat([idø2]))], [list.apply(void 0, [symbol(void 0, 'identical?')].concat([symbol(void 0, 'self')], [void 0]))], [list.apply(void 0, [symbol(void 0, '.-nil')].concat([idø2]))], ['\uA789else'], [list.apply(void 0, [symbol(void 0, 'or')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([symbol(void 0, 'self')], [list.apply(void 0, [symbol(void 0, 'quote')].concat([idø2]))]))], [list.apply(void 0, [symbol(void 0, 'aget')].concat([idø2], [list.apply(void 0, [symbol(void 0, '.replace')].concat([list.apply(void 0, [symbol(void 0, '.replace')].concat([list.apply(void 0, [symbol(void 0, '.call')].concat([symbol(void 0, 'Object.prototype.toString')], [symbol(void 0, 'self')]))], ['[object '], ['']))], [/\]$/], ['']))]))], [list.apply(void 0, [symbol(void 0, '.-_')].concat([idø2]))]))]))]))], [list.apply(void 0, [symbol(void 0, '.apply')].concat([symbol(void 0, 'f')], [symbol(void 0, 'self')], [symbol(void 0, 'arguments')]))]))
                        });
                    }.call(this);
                }, [], protocolMethodsø1);
            var fnsø1 = map(function (form) {
                    return list.apply(void 0, [symbol(void 0, 'def')].concat([(form || 0)['id']], [list.apply(void 0, [symbol(void 0, 'aget')].concat([id], [list.apply(void 0, [symbol(void 0, 'quote')].concat([(form || 0)['id']]))]))]));
                }, protocolø1);
            var satisfyø1 = assoc({}, symbol(void 0, 'wisp_core$IProtocol$id'), '' + nsø1 + '/' + protocolNameø1);
            var bodyø1 = reduce(function (body, method) {
                    return assoc(body, (method || 0)['id'], (method || 0)['fn']);
                }, satisfyø1, protocolø1);
            return list.apply(void 0, [withMeta(symbol(void 0, 'do'), { 'block': true })].concat([list.apply(void 0, [symbol(void 0, 'def')].concat([id], [bodyø1]))], vec(fnsø1), [id]));
        }.call(this);
    };
installMacro('defprotocol', withMeta(expandDefprotocol, { 'implicit': ['&env'] }));
var expandDeftype = exports.expandDeftype = function expandDeftype(id, fields) {
        var forms = Array.prototype.slice.call(arguments, 2);
        return function () {
            var typeInitø1 = map(function (field) {
                    return list.apply(void 0, [symbol(void 0, 'set!')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([symbol(void 0, 'this')], [list.apply(void 0, [symbol(void 0, 'quote')].concat([field]))]))], [field]));
                }, fields);
            var constructorø1 = conj(typeInitø1, symbol(void 0, 'this'));
            var methodInitø1 = map(function (field) {
                    return list.apply(void 0, [symbol(void 0, 'def')].concat([field], [list.apply(void 0, [symbol(void 0, 'aget')].concat([symbol(void 0, 'this')], [list.apply(void 0, [symbol(void 0, 'quote')].concat([field]))]))]));
                }, fields);
            var makeMethodø1 = function (protocol, form) {
                return function () {
                    var methodNameø1 = first(form);
                    var paramsø1 = second(form);
                    var bodyø1 = rest(rest(form));
                    var fieldNameø1 = isEqual(name(protocol), 'Object') ? list.apply(void 0, [symbol(void 0, 'quote')].concat([methodNameø1])) : list.apply(void 0, [symbol(void 0, '.-name')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([protocol], [list.apply(void 0, [symbol(void 0, 'quote')].concat([methodNameø1]))]))]));
                    return list.apply(void 0, [symbol(void 0, 'set!')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([list.apply(void 0, [symbol(void 0, '.-prototype')].concat([id]))], [fieldNameø1]))], [list.apply(void 0, [symbol(void 0, 'fn')].concat([paramsø1], vec(methodInitø1), vec(bodyø1)))]));
                }.call(this);
            };
            var satisfyø1 = function (protocol) {
                return list.apply(void 0, [symbol(void 0, 'set!')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([list.apply(void 0, [symbol(void 0, '.-prototype')].concat([id]))], [list.apply(void 0, [symbol(void 0, '.-wisp_core$IProtocol$id')].concat([protocol]))]))], [true]));
            };
            var bodyø1 = reduce(function (type, form) {
                    return isList(form) ? conj(type, { 'body': conj((type || 0)['body'], makeMethodø1((type || 0)['protocol'], form)) }) : conj(type, {
                        'protocol': form,
                        'body': conj((type || 0)['body'], satisfyø1(form))
                    });
                }, {
                    'protocol': void 0,
                    'body': []
                }, forms);
            var methodsø1 = (bodyø1 || 0)['body'];
            return list.apply(void 0, [symbol(void 0, 'def')].concat([id], [list.apply(void 0, [symbol(void 0, 'do')].concat([list.apply(void 0, [symbol(void 0, 'defn-')].concat([id], [fields], vec(constructorø1)))], vec(methodsø1), [id]))]));
        }.call(this);
    };
installMacro('deftype', expandDeftype);
installMacro('defrecord', expandDeftype);
var expandExtendType = exports.expandExtendType = function expandExtendType(type) {
        var forms = Array.prototype.slice.call(arguments, 1);
        return function () {
            var isDefaultTypeø1 = isEqual(type, symbol(void 0, 'default'));
            var isNilTypeø1 = isNil(type);
            var typeNameø1 = isNil(type) ? symbol('nil') : isEqual(type, symbol(void 0, 'default')) ? symbol(void 0, '_') : isEqual(type, symbol(void 0, 'number')) ? symbol(void 0, 'Number') : isEqual(type, symbol(void 0, 'string')) ? symbol(void 0, 'String') : isEqual(type, symbol(void 0, 'boolean')) ? symbol(void 0, 'Boolean') : isEqual(type, symbol(void 0, 'vector')) ? symbol(void 0, 'Array') : isEqual(type, symbol(void 0, 'function')) ? symbol(void 0, 'Function') : isEqual(type, symbol(void 0, 're-pattern')) ? symbol(void 0, 'RegExp') : isEqual(namespace(type), 'js') ? type : 'else' ? void 0 : void 0;
            var satisfyø1 = function (protocol) {
                return typeNameø1 ? list.apply(void 0, [symbol(void 0, 'set!')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([protocol], [list.apply(void 0, [symbol(void 0, 'quote')].concat([symbol('' + 'wisp_core$IProtocol$' + name(typeNameø1))]))]))], [true])) : list.apply(void 0, [symbol(void 0, 'set!')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([list.apply(void 0, [symbol(void 0, '.-prototype')].concat([type]))], [list.apply(void 0, [symbol(void 0, '.-wisp_core$IProtocol$id')].concat([protocol]))]))], [true]));
            };
            var makeMethodø1 = function (protocol, form) {
                return function () {
                    var methodNameø1 = first(form);
                    var paramsø1 = second(form);
                    var bodyø1 = rest(rest(form));
                    var targetø1 = typeNameø1 ? list.apply(void 0, [symbol(void 0, 'aget')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([protocol], [list.apply(void 0, [symbol(void 0, 'quote')].concat([methodNameø1]))]))], [list.apply(void 0, [symbol(void 0, 'quote')].concat([typeNameø1]))])) : list.apply(void 0, [symbol(void 0, 'aget')].concat([list.apply(void 0, [symbol(void 0, '.-prototype')].concat([type]))], [list.apply(void 0, [symbol(void 0, '.-name')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([protocol], [list.apply(void 0, [symbol(void 0, 'quote')].concat([methodNameø1]))]))]))]));
                    return list.apply(void 0, [symbol(void 0, 'set!')].concat([targetø1], [list.apply(void 0, [symbol(void 0, 'fn')].concat([paramsø1], vec(bodyø1)))]));
                }.call(this);
            };
            var bodyø1 = reduce(function (body, form) {
                    return isList(form) ? conj(body, { 'methods': conj((body || 0)['methods'], makeMethodø1((body || 0)['protocol'], form)) }) : conj(body, {
                        'protocol': form,
                        'methods': conj((body || 0)['methods'], satisfyø1(form))
                    });
                }, {
                    'protocol': void 0,
                    'methods': []
                }, forms);
            var methodsø1 = (bodyø1 || 0)['methods'];
            return list.apply(void 0, [symbol(void 0, 'do')].concat(vec(methodsø1), [void 0]));
        }.call(this);
    };
installMacro('extend-type', expandExtendType);
var expandExtendProtocol = exports.expandExtendProtocol = function expandExtendProtocol(protocol) {
        var forms = Array.prototype.slice.call(arguments, 1);
        return function () {
            var specsø1 = reduce(function (specs, form) {
                    return isList(form) ? cons({
                        'type': (first(specs) || 0)['type'],
                        'methods': conj((first(specs) || 0)['methods'], form)
                    }, rest(specs)) : cons({
                        'type': form,
                        'methods': []
                    }, specs);
                }, void 0, forms);
            var bodyø1 = map(function (form) {
                    return list.apply(void 0, [symbol(void 0, 'extend-type')].concat([(form || 0)['type']], [protocol], vec((form || 0)['methods'])));
                }, specsø1);
            return list.apply(void 0, [symbol(void 0, 'do')].concat(vec(bodyø1), [void 0]));
        }.call(this);
    };
installMacro('extend-protocol', expandExtendProtocol);
var asetExpand = exports.asetExpand = function asetExpand() {
        switch (arguments.length) {
        case 3:
            var target = arguments[0];
            var field = arguments[1];
            var value = arguments[2];
            return list.apply(void 0, [symbol(void 0, 'set!')].concat([list.apply(void 0, [symbol(void 0, 'aget')].concat([target], [field]))], [value]));
        default:
            var target = arguments[0];
            var field = arguments[1];
            var subField = arguments[2];
            var subFieldsAndValue = Array.prototype.slice.call(arguments, 3);
            return function () {
                var resolvedTargetø1 = reduce(function (form, node) {
                        return list.apply(void 0, [symbol(void 0, 'aget')].concat([form], [node]));
                    }, list.apply(void 0, [symbol(void 0, 'aget')].concat([target], [field])), cons(subField, butlast(subFieldsAndValue)));
                var valueø1 = last(subFieldsAndValue);
                return list.apply(void 0, [symbol(void 0, 'set!')].concat([resolvedTargetø1], [valueø1]));
            }.call(this);
        }
    };
installMacro('aset', asetExpand);
var alengthExpand = exports.alengthExpand = function alengthExpand(array) {
        return list.apply(void 0, [symbol(void 0, '.-length')].concat([array]));
    };
installMacro('alength', alengthExpand);


},{"./../../ast":"wisp/ast","./../../expander":"wisp/expander","./../../reader":"wisp/reader","./../../runtime":"wisp/runtime","./../../sequence":"wisp/sequence","./../../string":"wisp/string","escodegen":9}],3:[function(require,module,exports){
{
    var _ns_ = {
            id: 'runner.main',
            doc: void 0
        };
    var wisp_compiler = require('wisp/compiler');
    var compile = wisp_compiler.compile;
}
var _wisp_runtime = exports._wisp_runtime = require('../runtime.js');
var _wisp_sequence = exports._wisp_sequence = require('../sequence.js');
var _wisp_string = exports._wisp_string = require('../string.js');
var fetchSource = exports.fetchSource = function fetchSource(src, callback) {
        return function () {
            var xhrø1 = new XMLHttpRequest();
            xhrø1.open('GET', src, true);
            xhrø1.addEventListener('load', function (ev) {
                return xhrø1.status >= 200 && xhrø1.status < 300 ? callback(xhrø1.responseText) : console.error(xhrø1.statusText);
            }, false);
            xhrø1.overrideMimeType ? xhrø1.overrideMimeType('text/plain') : void 0;
            xhrø1.setRequestHeader('If-Modified-Since', 'Fri, 01 Jan 1960 00:00:00 GMT');
            return xhrø1.send(null);
        }.call(this);
    };
var runWispCode = exports.runWispCode = function runWispCode(code, url) {
        return function () {
            var resultø1 = compile(code, { 'source-uri': url || 'inline' });
            var errorø1 = (resultø1 || 0)['error'];
            return errorø1 ? console.error(errorø1) : Function(eval((resultø1 || 0)['code']))();
        }.call(this);
    };
var fetchAndRunWispCode = exports.fetchAndRunWispCode = function fetchAndRunWispCode(url) {
        return fetchSource(url, function (code) {
            return runWispCode(code, url);
        });
    };
var __main__ = exports.__main__ = function __main__(ev) {
        [
            _wisp_runtime,
            _wisp_sequence,
            _wisp_string
        ].map(function (f) {
            return Object.keys(f).map(function (k) {
                return (window || 0)[k] = (f || 0)[k];
            });
        });
        return function () {
            var scriptsø1 = document.getElementsByTagName('script');
            return function loop() {
                var recur = loop;
                var xø1 = 0;
                do {
                    recur = xø1 < scriptsø1.length ? function () {
                        var scriptø1 = (scriptsø1 || 0)[xø1];
                        var sourceø1 = scriptø1.src;
                        var contentø1 = scriptø1.text;
                        var contentTypeø1 = scriptø1.type;
                        contentTypeø1 == 'application/wisp' ? (function () {
                            sourceø1 ? fetchAndRunWispCode(sourceø1) : void 0;
                            return contentø1 ? runWispCode(contentø1, sourceø1) : void 0;
                        })() : void 0;
                        return loop[0] = xø1 + 1, loop;
                    }.call(this) : void 0;
                } while (xø1 = loop[0], recur === loop);
                return recur;
            }.call(this);
        }.call(this);
    };
window.addEventListener('load', __main__, false);


},{"../runtime.js":"wisp/runtime","../sequence.js":"wisp/sequence","../string.js":"wisp/string","wisp/compiler":"wisp/compiler"}],4:[function(require,module,exports){
(function (process,__filename){
/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 1.0.1 Copyright (c) 2011-2016, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                if (callback) {
                    process.nextTick(function () {
                        callback.apply(null, deps);
                    });
                }
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

}).call(this,require('_process'),"/node_modules/amdefine/amdefine.js")
},{"_process":17,"path":16}],5:[function(require,module,exports){
(function (Buffer){
module.exports = encode;
function encode(input) {
  return new Buffer(input).toString('base64')
}
}).call(this,require("buffer").Buffer)
},{"buffer":8}],6:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],7:[function(require,module,exports){

},{}],8:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)
},{"base64-js":6,"buffer":8,"ieee754":15}],9:[function(require,module,exports){
(function (global){
/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012-2013 Michael Ficarra <escodegen.copyright@michael.ficarra.me>
  Copyright (C) 2012-2013 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2013 Irakli Gozalishvili <rfobic@gmail.com>
  Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
  Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
  Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*global exports:true, generateStatement:true, generateExpression:true, require:true, global:true*/
(function () {
    'use strict';

    var Syntax,
        Precedence,
        BinaryPrecedence,
        SourceNode,
        estraverse,
        esutils,
        isArray,
        base,
        indent,
        json,
        renumber,
        hexadecimal,
        quotes,
        escapeless,
        newline,
        space,
        parentheses,
        semicolons,
        safeConcatenation,
        directive,
        extra,
        parse,
        sourceMap,
        FORMAT_MINIFY,
        FORMAT_DEFAULTS;

    estraverse = require('estraverse');
    esutils = require('esutils');

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExportDeclaration: 'ExportDeclaration',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        GeneratorExpression: 'GeneratorExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    Precedence = {
        Sequence: 0,
        Yield: 1,
        Assignment: 1,
        Conditional: 2,
        ArrowFunction: 2,
        LogicalOR: 3,
        LogicalAND: 4,
        BitwiseOR: 5,
        BitwiseXOR: 6,
        BitwiseAND: 7,
        Equality: 8,
        Relational: 9,
        BitwiseSHIFT: 10,
        Additive: 11,
        Multiplicative: 12,
        Unary: 13,
        Postfix: 14,
        Call: 15,
        New: 16,
        Member: 17,
        Primary: 18
    };

    BinaryPrecedence = {
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        'is': Precedence.Equality,
        'isnt': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative
    };

    function getDefaultOptions() {
        // default options
        return {
            indent: null,
            base: null,
            parse: null,
            comment: false,
            format: {
                indent: {
                    style: '    ',
                    base: 0,
                    adjustMultilineComment: false
                },
                newline: '\n',
                space: ' ',
                json: false,
                renumber: false,
                hexadecimal: false,
                quotes: 'single',
                escapeless: false,
                compact: false,
                parentheses: true,
                semicolons: true,
                safeConcatenation: false
            },
            moz: {
                comprehensionExpressionStartsWithAssignment: false,
                starlessGenerator: false,
                parenthesizedComprehensionBlock: false
            },
            sourceMap: null,
            sourceMapRoot: null,
            sourceMapWithCode: false,
            directive: false,
            raw: true,
            verbatim: null
        };
    }

    function stringRepeat(str, num) {
        var result = '';

        for (num |= 0; num > 0; num >>>= 1, str += str) {
            if (num & 1) {
                result += str;
            }
        }

        return result;
    }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    function hasLineTerminator(str) {
        return (/[\r\n]/g).test(str);
    }

    function endsWithLineTerminator(str) {
        var len = str.length;
        return len && esutils.code.isLineTerminator(str.charCodeAt(len - 1));
    }

    function updateDeeply(target, override) {
        var key, val;

        function isHashObject(target) {
            return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
        }

        for (key in override) {
            if (override.hasOwnProperty(key)) {
                val = override[key];
                if (isHashObject(val)) {
                    if (isHashObject(target[key])) {
                        updateDeeply(target[key], val);
                    } else {
                        target[key] = updateDeeply({}, val);
                    }
                } else {
                    target[key] = val;
                }
            }
        }
        return target;
    }

    function generateNumber(value) {
        var result, point, temp, exponent, pos;

        if (value !== value) {
            throw new Error('Numeric literal whose value is NaN');
        }
        if (value < 0 || (value === 0 && 1 / value < 0)) {
            throw new Error('Numeric literal whose value is negative');
        }

        if (value === 1 / 0) {
            return json ? 'null' : renumber ? '1e400' : '1e+400';
        }

        result = '' + value;
        if (!renumber || result.length < 3) {
            return result;
        }

        point = result.indexOf('.');
        if (!json && result.charCodeAt(0) === 0x30  /* 0 */ && point === 1) {
            point = 0;
            result = result.slice(1);
        }
        temp = result;
        result = result.replace('e+', 'e');
        exponent = 0;
        if ((pos = temp.indexOf('e')) > 0) {
            exponent = +temp.slice(pos + 1);
            temp = temp.slice(0, pos);
        }
        if (point >= 0) {
            exponent -= temp.length - point - 1;
            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
        }
        pos = 0;
        while (temp.charCodeAt(temp.length + pos - 1) === 0x30  /* 0 */) {
            --pos;
        }
        if (pos !== 0) {
            exponent -= pos;
            temp = temp.slice(0, pos);
        }
        if (exponent !== 0) {
            temp += 'e' + exponent;
        }
        if ((temp.length < result.length ||
                    (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&
                +temp === value) {
            result = temp;
        }

        return result;
    }

    // Generate valid RegExp expression.
    // This function is based on https://github.com/Constellation/iv Engine

    function escapeRegExpCharacter(ch, previousIsBackslash) {
        // not handling '\' and handling \u2028 or \u2029 to unicode escape sequence
        if ((ch & ~1) === 0x2028) {
            return (previousIsBackslash ? 'u' : '\\u') + ((ch === 0x2028) ? '2028' : '2029');
        } else if (ch === 10 || ch === 13) {  // \n, \r
            return (previousIsBackslash ? '' : '\\') + ((ch === 10) ? 'n' : 'r');
        }
        return String.fromCharCode(ch);
    }

    function generateRegExp(reg) {
        var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;

        result = reg.toString();

        if (reg.source) {
            // extract flag from toString result
            match = result.match(/\/([^/]*)$/);
            if (!match) {
                return result;
            }

            flags = match[1];
            result = '';

            characterInBrack = false;
            previousIsBackslash = false;
            for (i = 0, iz = reg.source.length; i < iz; ++i) {
                ch = reg.source.charCodeAt(i);

                if (!previousIsBackslash) {
                    if (characterInBrack) {
                        if (ch === 93) {  // ]
                            characterInBrack = false;
                        }
                    } else {
                        if (ch === 47) {  // /
                            result += '\\';
                        } else if (ch === 91) {  // [
                            characterInBrack = true;
                        }
                    }
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    previousIsBackslash = ch === 92;  // \
                } else {
                    // if new RegExp("\\\n') is provided, create /\n/
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    // prevent like /\\[/]/
                    previousIsBackslash = false;
                }
            }

            return '/' + result + '/' + flags;
        }

        return result;
    }

    function escapeAllowedCharacter(code, next) {
        var hex, result = '\\';

        switch (code) {
        case 0x08  /* \b */:
            result += 'b';
            break;
        case 0x0C  /* \f */:
            result += 'f';
            break;
        case 0x09  /* \t */:
            result += 't';
            break;
        default:
            hex = code.toString(16).toUpperCase();
            if (json || code > 0xFF) {
                result += 'u' + '0000'.slice(hex.length) + hex;
            } else if (code === 0x0000 && !esutils.code.isDecimalDigit(next)) {
                result += '0';
            } else if (code === 0x000B  /* \v */) { // '\v'
                result += 'x0B';
            } else {
                result += 'x' + '00'.slice(hex.length) + hex;
            }
            break;
        }

        return result;
    }

    function escapeDisallowedCharacter(code) {
        var result = '\\';
        switch (code) {
        case 0x5C  /* \ */:
            result += '\\';
            break;
        case 0x0A  /* \n */:
            result += 'n';
            break;
        case 0x0D  /* \r */:
            result += 'r';
            break;
        case 0x2028:
            result += 'u2028';
            break;
        case 0x2029:
            result += 'u2029';
            break;
        default:
            throw new Error('Incorrectly classified character');
        }

        return result;
    }

    function escapeDirective(str) {
        var i, iz, code, quote;

        quote = quotes === 'double' ? '"' : '\'';
        for (i = 0, iz = str.length; i < iz; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27  /* ' */) {
                quote = '"';
                break;
            } else if (code === 0x22  /* " */) {
                quote = '\'';
                break;
            } else if (code === 0x5C  /* \ */) {
                ++i;
            }
        }

        return quote + str + quote;
    }

    function escapeString(str) {
        var result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;

        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27  /* ' */) {
                ++singleQuotes;
            } else if (code === 0x22  /* " */) {
                ++doubleQuotes;
            } else if (code === 0x2F  /* / */ && json) {
                result += '\\';
            } else if (esutils.code.isLineTerminator(code) || code === 0x5C  /* \ */) {
                result += escapeDisallowedCharacter(code);
                continue;
            } else if ((json && code < 0x20  /* SP */) || !(json || escapeless || (code >= 0x20  /* SP */ && code <= 0x7E  /* ~ */))) {
                result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
                continue;
            }
            result += String.fromCharCode(code);
        }

        single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
        quote = single ? '\'' : '"';

        if (!(single ? singleQuotes : doubleQuotes)) {
            return quote + result + quote;
        }

        str = result;
        result = quote;

        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if ((code === 0x27  /* ' */ && single) || (code === 0x22  /* " */ && !single)) {
                result += '\\';
            }
            result += String.fromCharCode(code);
        }

        return result + quote;
    }

    /**
     * flatten an array to a string, where the array can contain
     * either strings or nested arrays
     */
    function flattenToString(arr) {
        var i, iz, elem, result = '';
        for (i = 0, iz = arr.length; i < iz; ++i) {
            elem = arr[i];
            result += isArray(elem) ? flattenToString(elem) : elem;
        }
        return result;
    }

    /**
     * convert generated to a SourceNode when source maps are enabled.
     */
    function toSourceNodeWhenNeeded(generated, node) {
        if (!sourceMap) {
            // with no source maps, generated is either an
            // array or a string.  if an array, flatten it.
            // if a string, just return it
            if (isArray(generated)) {
                return flattenToString(generated);
            } else {
                return generated;
            }
        }
        if (node == null) {
            if (generated instanceof SourceNode) {
                return generated;
            } else {
                node = {};
            }
        }
        if (node.loc == null) {
            return new SourceNode(null, null, sourceMap, generated, node.name || null);
        }
        return new SourceNode(node.loc.start.line, node.loc.start.column, (sourceMap === true ? node.loc.source || null : sourceMap), generated, node.name || null);
    }

    function noEmptySpace() {
        return (space) ? space : ' ';
    }

    function join(left, right) {
        var leftSource = toSourceNodeWhenNeeded(left).toString(),
            rightSource = toSourceNodeWhenNeeded(right).toString(),
            leftCharCode = leftSource.charCodeAt(leftSource.length - 1),
            rightCharCode = rightSource.charCodeAt(0);

        if ((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode ||
        esutils.code.isIdentifierPart(leftCharCode) && esutils.code.isIdentifierPart(rightCharCode) ||
        leftCharCode === 0x2F  /* / */ && rightCharCode === 0x69  /* i */) { // infix word operators all start with `i`
            return [left, noEmptySpace(), right];
        } else if (esutils.code.isWhiteSpace(leftCharCode) || esutils.code.isLineTerminator(leftCharCode) ||
                esutils.code.isWhiteSpace(rightCharCode) || esutils.code.isLineTerminator(rightCharCode)) {
            return [left, right];
        }
        return [left, space, right];
    }

    function addIndent(stmt) {
        return [base, stmt];
    }

    function withIndent(fn) {
        var previousBase, result;
        previousBase = base;
        base += indent;
        result = fn.call(this, base);
        base = previousBase;
        return result;
    }

    function calculateSpaces(str) {
        var i;
        for (i = str.length - 1; i >= 0; --i) {
            if (esutils.code.isLineTerminator(str.charCodeAt(i))) {
                break;
            }
        }
        return (str.length - 1) - i;
    }

    function adjustMultilineComment(value, specialBase) {
        var array, i, len, line, j, spaces, previousBase, sn;

        array = value.split(/\r\n|[\r\n]/);
        spaces = Number.MAX_VALUE;

        // first line doesn't have indentation
        for (i = 1, len = array.length; i < len; ++i) {
            line = array[i];
            j = 0;
            while (j < line.length && esutils.code.isWhiteSpace(line.charCodeAt(j))) {
                ++j;
            }
            if (spaces > j) {
                spaces = j;
            }
        }

        if (typeof specialBase !== 'undefined') {
            // pattern like
            // {
            //   var t = 20;  /*
            //                 * this is comment
            //                 */
            // }
            previousBase = base;
            if (array[1][spaces] === '*') {
                specialBase += ' ';
            }
            base = specialBase;
        } else {
            if (spaces & 1) {
                // /*
                //  *
                //  */
                // If spaces are odd number, above pattern is considered.
                // We waste 1 space.
                --spaces;
            }
            previousBase = base;
        }

        for (i = 1, len = array.length; i < len; ++i) {
            sn = toSourceNodeWhenNeeded(addIndent(array[i].slice(spaces)));
            array[i] = sourceMap ? sn.join('') : sn;
        }

        base = previousBase;

        return array.join('\n');
    }

    function generateComment(comment, specialBase) {
        if (comment.type === 'Line') {
            if (endsWithLineTerminator(comment.value)) {
                return '//' + comment.value;
            } else {
                // Always use LineTerminator
                return '//' + comment.value + '\n';
            }
        }
        if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
            return adjustMultilineComment('/*' + comment.value + '*/', specialBase);
        }
        return '/*' + comment.value + '*/';
    }

    function addComments(stmt, result) {
        var i, len, comment, save, tailingToStatement, specialBase, fragment;

        if (stmt.leadingComments && stmt.leadingComments.length > 0) {
            save = result;

            comment = stmt.leadingComments[0];
            result = [];
            if (safeConcatenation && stmt.type === Syntax.Program && stmt.body.length === 0) {
                result.push('\n');
            }
            result.push(generateComment(comment));
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push('\n');
            }

            for (i = 1, len = stmt.leadingComments.length; i < len; ++i) {
                comment = stmt.leadingComments[i];
                fragment = [generateComment(comment)];
                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    fragment.push('\n');
                }
                result.push(addIndent(fragment));
            }

            result.push(addIndent(save));
        }

        if (stmt.trailingComments) {
            tailingToStatement = !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
            specialBase = stringRepeat(' ', calculateSpaces(toSourceNodeWhenNeeded([base, result, indent]).toString()));
            for (i = 0, len = stmt.trailingComments.length; i < len; ++i) {
                comment = stmt.trailingComments[i];
                if (tailingToStatement) {
                    // We assume target like following script
                    //
                    // var t = 20;  /**
                    //               * This is comment of t
                    //               */
                    if (i === 0) {
                        // first case
                        result = [result, indent];
                    } else {
                        result = [result, specialBase];
                    }
                    result.push(generateComment(comment, specialBase));
                } else {
                    result = [result, addIndent(generateComment(comment))];
                }
                if (i !== len - 1 && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                    result = [result, '\n'];
                }
            }
        }

        return result;
    }

    function parenthesize(text, current, should) {
        if (current < should) {
            return ['(', text, ')'];
        }
        return text;
    }

    function maybeBlock(stmt, semicolonOptional, functionBody) {
        var result, noLeadingComment;

        noLeadingComment = !extra.comment || !stmt.leadingComments;

        if (stmt.type === Syntax.BlockStatement && noLeadingComment) {
            return [space, generateStatement(stmt, { functionBody: functionBody })];
        }

        if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {
            return ';';
        }

        withIndent(function () {
            result = [newline, addIndent(generateStatement(stmt, { semicolonOptional: semicolonOptional, functionBody: functionBody }))];
        });

        return result;
    }

    function maybeBlockSuffix(stmt, result) {
        var ends = endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) {
            return [result, space];
        }
        if (ends) {
            return [result, base];
        }
        return [result, newline, base];
    }

    function generateVerbatimString(string) {
        var i, iz, result;
        result = string.split(/\r\n|\n/);
        for (i = 1, iz = result.length; i < iz; i++) {
            result[i] = newline + base + result[i];
        }
        return result;
    }

    function generateVerbatim(expr, option) {
        var verbatim, result, prec;
        verbatim = expr[extra.verbatim];

        if (typeof verbatim === 'string') {
            result = parenthesize(generateVerbatimString(verbatim), Precedence.Sequence, option.precedence);
        } else {
            // verbatim is object
            result = generateVerbatimString(verbatim.content);
            prec = (verbatim.precedence != null) ? verbatim.precedence : Precedence.Sequence;
            result = parenthesize(result, prec, option.precedence);
        }

        return toSourceNodeWhenNeeded(result, expr);
    }

    function generateIdentifier(node) {
        return toSourceNodeWhenNeeded(node.name, node);
    }

    function generatePattern(node, options) {
        var result;

        if (node.type === Syntax.Identifier) {
            result = generateIdentifier(node);
        } else {
            result = generateExpression(node, {
                precedence: options.precedence,
                allowIn: options.allowIn,
                allowCall: true
            });
        }

        return result;
    }

    function generateFunctionBody(node) {
        var result, i, len, expr, arrow;

        arrow = node.type === Syntax.ArrowFunctionExpression;

        if (arrow && node.params.length === 1 && node.params[0].type === Syntax.Identifier) {
            // arg => { } case
            result = [generateIdentifier(node.params[0])];
        } else {
            result = ['('];
            for (i = 0, len = node.params.length; i < len; ++i) {
                result.push(generatePattern(node.params[i], {
                    precedence: Precedence.Assignment,
                    allowIn: true
                }));
                if (i + 1 < len) {
                    result.push(',' + space);
                }
            }
            result.push(')');
        }

        if (arrow) {
            result.push(space);
            result.push('=>');
        }

        if (node.expression) {
            result.push(space);
            expr = generateExpression(node.body, {
                precedence: Precedence.Assignment,
                allowIn: true,
                allowCall: true
            });
            if (expr.toString().charAt(0) === '{') {
                expr = ['(', expr, ')'];
            }
            result.push(expr);
        } else {
            result.push(maybeBlock(node.body, false, true));
        }
        return result;
    }

    function generateIterationForStatement(operator, stmt, semicolonIsNotNeeded) {
        var result = ['for' + space + '('];
        withIndent(function () {
            if (stmt.left.type === Syntax.VariableDeclaration) {
                withIndent(function () {
                    result.push(stmt.left.kind + noEmptySpace());
                    result.push(generateStatement(stmt.left.declarations[0], {
                        allowIn: false
                    }));
                });
            } else {
                result.push(generateExpression(stmt.left, {
                    precedence: Precedence.Call,
                    allowIn: true,
                    allowCall: true
                }));
            }

            result = join(result, operator);
            result = [join(
                result,
                generateExpression(stmt.right, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                })
            ), ')'];
        });
        result.push(maybeBlock(stmt.body, semicolonIsNotNeeded));
        return result;
    }

    function generateLiteral(expr) {
        var raw;
        if (expr.hasOwnProperty('raw') && parse && extra.raw) {
            try {
                raw = parse(expr.raw).body[0].expression;
                if (raw.type === Syntax.Literal) {
                    if (raw.value === expr.value) {
                        return expr.raw;
                    }
                }
            } catch (e) {
                // not use raw property
            }
        }

        if (expr.value === null) {
            return 'null';
        }

        if (typeof expr.value === 'string') {
            return escapeString(expr.value);
        }

        if (typeof expr.value === 'number') {
            return generateNumber(expr.value);
        }

        if (typeof expr.value === 'boolean') {
            return expr.value ? 'true' : 'false';
        }

        return generateRegExp(expr.value);
    }

    function generateExpression(expr, option) {
        var result,
            precedence,
            type,
            currentPrecedence,
            i,
            len,
            fragment,
            multiline,
            leftCharCode,
            leftSource,
            rightCharCode,
            allowIn,
            allowCall,
            allowUnparenthesizedNew,
            property,
            isGenerator;

        precedence = option.precedence;
        allowIn = option.allowIn;
        allowCall = option.allowCall;
        type = expr.type || option.type;

        if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) {
            return generateVerbatim(expr, option);
        }

        switch (type) {
        case Syntax.SequenceExpression:
            result = [];
            allowIn |= (Precedence.Sequence < precedence);
            for (i = 0, len = expr.expressions.length; i < len; ++i) {
                result.push(generateExpression(expr.expressions[i], {
                    precedence: Precedence.Assignment,
                    allowIn: allowIn,
                    allowCall: true
                }));
                if (i + 1 < len) {
                    result.push(',' + space);
                }
            }
            result = parenthesize(result, Precedence.Sequence, precedence);
            break;

        case Syntax.AssignmentExpression:
            allowIn |= (Precedence.Assignment < precedence);
            result = parenthesize(
                [
                    generateExpression(expr.left, {
                        precedence: Precedence.Call,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space + expr.operator + space,
                    generateExpression(expr.right, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    })
                ],
                Precedence.Assignment,
                precedence
            );
            break;

        case Syntax.ArrowFunctionExpression:
            allowIn |= (Precedence.ArrowFunction < precedence);
            result = parenthesize(generateFunctionBody(expr), Precedence.ArrowFunction, precedence);
            break;

        case Syntax.ConditionalExpression:
            allowIn |= (Precedence.Conditional < precedence);
            result = parenthesize(
                [
                    generateExpression(expr.test, {
                        precedence: Precedence.LogicalOR,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space + '?' + space,
                    generateExpression(expr.consequent, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space + ':' + space,
                    generateExpression(expr.alternate, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    })
                ],
                Precedence.Conditional,
                precedence
            );
            break;

        case Syntax.LogicalExpression:
        case Syntax.BinaryExpression:
            currentPrecedence = BinaryPrecedence[expr.operator];

            allowIn |= (currentPrecedence < precedence);

            fragment = generateExpression(expr.left, {
                precedence: currentPrecedence,
                allowIn: allowIn,
                allowCall: true
            });

            leftSource = fragment.toString();

            if (leftSource.charCodeAt(leftSource.length - 1) === 0x2F /* / */ && esutils.code.isIdentifierPart(expr.operator.charCodeAt(0))) {
                result = [fragment, noEmptySpace(), expr.operator];
            } else {
                result = join(fragment, expr.operator);
            }

            fragment = generateExpression(expr.right, {
                precedence: currentPrecedence + 1,
                allowIn: allowIn,
                allowCall: true
            });

            if (expr.operator === '/' && fragment.toString().charAt(0) === '/' ||
            expr.operator.slice(-1) === '<' && fragment.toString().slice(0, 3) === '!--') {
                // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
                result.push(noEmptySpace());
                result.push(fragment);
            } else {
                result = join(result, fragment);
            }

            if (expr.operator === 'in' && !allowIn) {
                result = ['(', result, ')'];
            } else {
                result = parenthesize(result, currentPrecedence, precedence);
            }

            break;

        case Syntax.CallExpression:
            result = [generateExpression(expr.callee, {
                precedence: Precedence.Call,
                allowIn: true,
                allowCall: true,
                allowUnparenthesizedNew: false
            })];

            result.push('(');
            for (i = 0, len = expr['arguments'].length; i < len; ++i) {
                result.push(generateExpression(expr['arguments'][i], {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                }));
                if (i + 1 < len) {
                    result.push(',' + space);
                }
            }
            result.push(')');

            if (!allowCall) {
                result = ['(', result, ')'];
            } else {
                result = parenthesize(result, Precedence.Call, precedence);
            }
            break;

        case Syntax.NewExpression:
            len = expr['arguments'].length;
            allowUnparenthesizedNew = option.allowUnparenthesizedNew === undefined || option.allowUnparenthesizedNew;

            result = join(
                'new',
                generateExpression(expr.callee, {
                    precedence: Precedence.New,
                    allowIn: true,
                    allowCall: false,
                    allowUnparenthesizedNew: allowUnparenthesizedNew && !parentheses && len === 0
                })
            );

            if (!allowUnparenthesizedNew || parentheses || len > 0) {
                result.push('(');
                for (i = 0; i < len; ++i) {
                    result.push(generateExpression(expr['arguments'][i], {
                        precedence: Precedence.Assignment,
                        allowIn: true,
                        allowCall: true
                    }));
                    if (i + 1 < len) {
                        result.push(',' + space);
                    }
                }
                result.push(')');
            }

            result = parenthesize(result, Precedence.New, precedence);
            break;

        case Syntax.MemberExpression:
            result = [generateExpression(expr.object, {
                precedence: Precedence.Call,
                allowIn: true,
                allowCall: allowCall,
                allowUnparenthesizedNew: false
            })];

            if (expr.computed) {
                result.push('[');
                result.push(generateExpression(expr.property, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: allowCall
                }));
                result.push(']');
            } else {
                if (expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
                    fragment = toSourceNodeWhenNeeded(result).toString();
                    // When the following conditions are all true,
                    //   1. No floating point
                    //   2. Don't have exponents
                    //   3. The last character is a decimal digit
                    //   4. Not hexadecimal OR octal number literal
                    // we should add a floating point.
                    if (
                            fragment.indexOf('.') < 0 &&
                            !/[eExX]/.test(fragment) &&
                            esutils.code.isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) &&
                            !(fragment.length >= 2 && fragment.charCodeAt(0) === 48)  // '0'
                            ) {
                        result.push('.');
                    }
                }
                result.push('.');
                result.push(generateIdentifier(expr.property));
            }

            result = parenthesize(result, Precedence.Member, precedence);
            break;

        case Syntax.UnaryExpression:
            fragment = generateExpression(expr.argument, {
                precedence: Precedence.Unary,
                allowIn: true,
                allowCall: true
            });

            if (space === '') {
                result = join(expr.operator, fragment);
            } else {
                result = [expr.operator];
                if (expr.operator.length > 2) {
                    // delete, void, typeof
                    // get `typeof []`, not `typeof[]`
                    result = join(result, fragment);
                } else {
                    // Prevent inserting spaces between operator and argument if it is unnecessary
                    // like, `!cond`
                    leftSource = toSourceNodeWhenNeeded(result).toString();
                    leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
                    rightCharCode = fragment.toString().charCodeAt(0);

                    if (((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode) ||
                            (esutils.code.isIdentifierPart(leftCharCode) && esutils.code.isIdentifierPart(rightCharCode))) {
                        result.push(noEmptySpace());
                        result.push(fragment);
                    } else {
                        result.push(fragment);
                    }
                }
            }
            result = parenthesize(result, Precedence.Unary, precedence);
            break;

        case Syntax.YieldExpression:
            if (expr.delegate) {
                result = 'yield*';
            } else {
                result = 'yield';
            }
            if (expr.argument) {
                result = join(
                    result,
                    generateExpression(expr.argument, {
                        precedence: Precedence.Yield,
                        allowIn: true,
                        allowCall: true
                    })
                );
            }
            result = parenthesize(result, Precedence.Yield, precedence);
            break;

        case Syntax.UpdateExpression:
            if (expr.prefix) {
                result = parenthesize(
                    [
                        expr.operator,
                        generateExpression(expr.argument, {
                            precedence: Precedence.Unary,
                            allowIn: true,
                            allowCall: true
                        })
                    ],
                    Precedence.Unary,
                    precedence
                );
            } else {
                result = parenthesize(
                    [
                        generateExpression(expr.argument, {
                            precedence: Precedence.Postfix,
                            allowIn: true,
                            allowCall: true
                        }),
                        expr.operator
                    ],
                    Precedence.Postfix,
                    precedence
                );
            }
            break;

        case Syntax.FunctionExpression:
            isGenerator = expr.generator && !extra.moz.starlessGenerator;
            result = isGenerator ? 'function*' : 'function';

            if (expr.id) {
                result = [result, (isGenerator) ? space : noEmptySpace(),
                          generateIdentifier(expr.id),
                          generateFunctionBody(expr)];
            } else {
                result = [result + space, generateFunctionBody(expr)];
            }

            break;

        case Syntax.ArrayPattern:
        case Syntax.ArrayExpression:
            if (!expr.elements.length) {
                result = '[]';
                break;
            }
            multiline = expr.elements.length > 1;
            result = ['[', multiline ? newline : ''];
            withIndent(function (indent) {
                for (i = 0, len = expr.elements.length; i < len; ++i) {
                    if (!expr.elements[i]) {
                        if (multiline) {
                            result.push(indent);
                        }
                        if (i + 1 === len) {
                            result.push(',');
                        }
                    } else {
                        result.push(multiline ? indent : '');
                        result.push(generateExpression(expr.elements[i], {
                            precedence: Precedence.Assignment,
                            allowIn: true,
                            allowCall: true
                        }));
                    }
                    if (i + 1 < len) {
                        result.push(',' + (multiline ? newline : space));
                    }
                }
            });
            if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
            }
            result.push(multiline ? base : '');
            result.push(']');
            break;

        case Syntax.Property:
            if (expr.kind === 'get' || expr.kind === 'set') {
                result = [
                    expr.kind, noEmptySpace(),
                    generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    generateFunctionBody(expr.value)
                ];
            } else {
                if (expr.shorthand) {
                    result = generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    });
                } else if (expr.method) {
                    result = [];
                    if (expr.value.generator) {
                        result.push('*');
                    }
                    result.push(generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }));
                    result.push(generateFunctionBody(expr.value));
                } else {
                    result = [
                        generateExpression(expr.key, {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true
                        }),
                        ':' + space,
                        generateExpression(expr.value, {
                            precedence: Precedence.Assignment,
                            allowIn: true,
                            allowCall: true
                        })
                    ];
                }
            }
            break;

        case Syntax.ObjectExpression:
            if (!expr.properties.length) {
                result = '{}';
                break;
            }
            multiline = expr.properties.length > 1;

            withIndent(function () {
                fragment = generateExpression(expr.properties[0], {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true,
                    type: Syntax.Property
                });
            });

            if (!multiline) {
                // issues 4
                // Do not transform from
                //   dejavu.Class.declare({
                //       method2: function () {}
                //   });
                // to
                //   dejavu.Class.declare({method2: function () {
                //       }});
                if (!hasLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    result = [ '{', space, fragment, space, '}' ];
                    break;
                }
            }

            withIndent(function (indent) {
                result = [ '{', newline, indent, fragment ];

                if (multiline) {
                    result.push(',' + newline);
                    for (i = 1, len = expr.properties.length; i < len; ++i) {
                        result.push(indent);
                        result.push(generateExpression(expr.properties[i], {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true,
                            type: Syntax.Property
                        }));
                        if (i + 1 < len) {
                            result.push(',' + newline);
                        }
                    }
                }
            });

            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
            }
            result.push(base);
            result.push('}');
            break;

        case Syntax.ObjectPattern:
            if (!expr.properties.length) {
                result = '{}';
                break;
            }

            multiline = false;
            if (expr.properties.length === 1) {
                property = expr.properties[0];
                if (property.value.type !== Syntax.Identifier) {
                    multiline = true;
                }
            } else {
                for (i = 0, len = expr.properties.length; i < len; ++i) {
                    property = expr.properties[i];
                    if (!property.shorthand) {
                        multiline = true;
                        break;
                    }
                }
            }
            result = ['{', multiline ? newline : '' ];

            withIndent(function (indent) {
                for (i = 0, len = expr.properties.length; i < len; ++i) {
                    result.push(multiline ? indent : '');
                    result.push(generateExpression(expr.properties[i], {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }));
                    if (i + 1 < len) {
                        result.push(',' + (multiline ? newline : space));
                    }
                }
            });

            if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
            }
            result.push(multiline ? base : '');
            result.push('}');
            break;

        case Syntax.ThisExpression:
            result = 'this';
            break;

        case Syntax.Identifier:
            result = generateIdentifier(expr);
            break;

        case Syntax.Literal:
            result = generateLiteral(expr);
            break;

        case Syntax.GeneratorExpression:
        case Syntax.ComprehensionExpression:
            // GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
            // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=883468 position of expr.body can differ in Spidermonkey and ES6
            result = (type === Syntax.GeneratorExpression) ? ['('] : ['['];

            if (extra.moz.comprehensionExpressionStartsWithAssignment) {
                fragment = generateExpression(expr.body, {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                });

                result.push(fragment);
            }

            if (expr.blocks) {
                withIndent(function () {
                    for (i = 0, len = expr.blocks.length; i < len; ++i) {
                        fragment = generateExpression(expr.blocks[i], {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true
                        });

                        if (i > 0 || extra.moz.comprehensionExpressionStartsWithAssignment) {
                            result = join(result, fragment);
                        } else {
                            result.push(fragment);
                        }
                    }
                });
            }

            if (expr.filter) {
                result = join(result, 'if' + space);
                fragment = generateExpression(expr.filter, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                });
                if (extra.moz.parenthesizedComprehensionBlock) {
                    result = join(result, [ '(', fragment, ')' ]);
                } else {
                    result = join(result, fragment);
                }
            }

            if (!extra.moz.comprehensionExpressionStartsWithAssignment) {
                fragment = generateExpression(expr.body, {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                });

                result = join(result, fragment);
            }

            result.push((type === Syntax.GeneratorExpression) ? ')' : ']');
            break;

        case Syntax.ComprehensionBlock:
            if (expr.left.type === Syntax.VariableDeclaration) {
                fragment = [
                    expr.left.kind, noEmptySpace(),
                    generateStatement(expr.left.declarations[0], {
                        allowIn: false
                    })
                ];
            } else {
                fragment = generateExpression(expr.left, {
                    precedence: Precedence.Call,
                    allowIn: true,
                    allowCall: true
                });
            }

            fragment = join(fragment, expr.of ? 'of' : 'in');
            fragment = join(fragment, generateExpression(expr.right, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            }));

            if (extra.moz.parenthesizedComprehensionBlock) {
                result = [ 'for' + space + '(', fragment, ')' ];
            } else {
                result = join('for' + space, fragment);
            }
            break;

        default:
            throw new Error('Unknown expression type: ' + expr.type);
        }

        if (extra.comment) {
            result = addComments(expr,result);
        }
        return toSourceNodeWhenNeeded(result, expr);
    }

    function generateStatement(stmt, option) {
        var i,
            len,
            result,
            node,
            specifier,
            allowIn,
            functionBody,
            directiveContext,
            fragment,
            semicolon,
            isGenerator;

        allowIn = true;
        semicolon = ';';
        functionBody = false;
        directiveContext = false;
        if (option) {
            allowIn = option.allowIn === undefined || option.allowIn;
            if (!semicolons && option.semicolonOptional === true) {
                semicolon = '';
            }
            functionBody = option.functionBody;
            directiveContext = option.directiveContext;
        }

        switch (stmt.type) {
        case Syntax.BlockStatement:
            result = ['{', newline];

            withIndent(function () {
                for (i = 0, len = stmt.body.length; i < len; ++i) {
                    fragment = addIndent(generateStatement(stmt.body[i], {
                        semicolonOptional: i === len - 1,
                        directiveContext: functionBody
                    }));
                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                        result.push(newline);
                    }
                }
            });

            result.push(addIndent('}'));
            break;

        case Syntax.BreakStatement:
            if (stmt.label) {
                result = 'break ' + stmt.label.name + semicolon;
            } else {
                result = 'break' + semicolon;
            }
            break;

        case Syntax.ContinueStatement:
            if (stmt.label) {
                result = 'continue ' + stmt.label.name + semicolon;
            } else {
                result = 'continue' + semicolon;
            }
            break;

        case Syntax.DirectiveStatement:
            if (extra.raw && stmt.raw) {
                result = stmt.raw + semicolon;
            } else {
                result = escapeDirective(stmt.directive) + semicolon;
            }
            break;

        case Syntax.DoWhileStatement:
            // Because `do 42 while (cond)` is Syntax Error. We need semicolon.
            result = join('do', maybeBlock(stmt.body));
            result = maybeBlockSuffix(stmt.body, result);
            result = join(result, [
                'while' + space + '(',
                generateExpression(stmt.test, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                }),
                ')' + semicolon
            ]);
            break;

        case Syntax.CatchClause:
            withIndent(function () {
                var guard;

                result = [
                    'catch' + space + '(',
                    generateExpression(stmt.param, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];

                if (stmt.guard) {
                    guard = generateExpression(stmt.guard, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    });

                    result.splice(2, 0, ' if ', guard);
                }
            });
            result.push(maybeBlock(stmt.body));
            break;

        case Syntax.DebuggerStatement:
            result = 'debugger' + semicolon;
            break;

        case Syntax.EmptyStatement:
            result = ';';
            break;

        case Syntax.ExportDeclaration:
            result = 'export ';
            if (stmt.declaration) {
                // FunctionDeclaration or VariableDeclaration
                result = [result, generateStatement(stmt.declaration, { semicolonOptional: semicolon === '' })];
                break;
            }
            break;

        case Syntax.ExpressionStatement:
            result = [generateExpression(stmt.expression, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            })];
            // 12.4 '{', 'function' is not allowed in this position.
            // wrap expression with parentheses
            fragment = toSourceNodeWhenNeeded(result).toString();
            if (fragment.charAt(0) === '{' ||  // ObjectExpression
                    (fragment.slice(0, 8) === 'function' && '* ('.indexOf(fragment.charAt(8)) >= 0) ||  // function or generator
                    (directive && directiveContext && stmt.expression.type === Syntax.Literal && typeof stmt.expression.value === 'string')) {
                result = ['(', result, ')' + semicolon];
            } else {
                result.push(semicolon);
            }
            break;

        case Syntax.ImportDeclaration:
            // ES6: 15.2.1 valid import declarations:
            //     - import ImportClause FromClause ;
            //     - import ModuleSpecifier ;
            // If no ImportClause is present,
            // this should be `import ModuleSpecifier` so skip `from`
            //
            // ModuleSpecifier is StringLiteral.
            if (stmt.specifiers.length === 0) {
                // import ModuleSpecifier ;
                result = [
                    'import',
                    space,
                    generateLiteral(stmt.source)
                ];
            } else {
                // import ImportClause FromClause ;
                if (stmt.kind === 'default') {
                    // import ... from "...";
                    result = [
                        'import',
                        noEmptySpace(),
                        stmt.specifiers[0].id.name,
                        noEmptySpace()
                    ];
                } else {
                    // stmt.kind === 'named'
                    result = [
                        'import',
                        space,
                        '{',
                    ];

                    if (stmt.specifiers.length === 1) {
                        // import { ... } from "...";
                        specifier = stmt.specifiers[0];
                        result.push(space + specifier.id.name);
                        if (specifier.name) {
                            result.push(noEmptySpace() + 'as' + noEmptySpace() + specifier.name.name);
                        }
                        result.push(space + '}' + space);
                    } else {
                        // import {
                        //    ...,
                        //    ...,
                        // } from "...";
                        withIndent(function (indent) {
                            var i, iz;
                            result.push(newline);
                            for (i = 0, iz = stmt.specifiers.length; i < iz; ++i) {
                                specifier = stmt.specifiers[i];
                                result.push(indent + specifier.id.name);
                                if (specifier.name) {
                                    result.push(noEmptySpace() + 'as' + noEmptySpace() + specifier.name.name);
                                }

                                if (i + 1 < iz) {
                                    result.push(',' + newline);
                                }
                            }
                        });
                        if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                            result.push(newline);
                        }
                        result.push(base + '}' + space);
                    }
                }

                result.push('from' + space);
                result.push(generateLiteral(stmt.source));
            }
            result.push(semicolon);
            break;

        case Syntax.VariableDeclarator:
            if (stmt.init) {
                result = [
                    generateExpression(stmt.id, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space,
                    '=',
                    space,
                    generateExpression(stmt.init, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    })
                ];
            } else {
                result = generatePattern(stmt.id, {
                    precedence: Precedence.Assignment,
                    allowIn: allowIn
                });
            }
            break;

        case Syntax.VariableDeclaration:
            result = [stmt.kind];
            // special path for
            // var x = function () {
            // };
            if (stmt.declarations.length === 1 && stmt.declarations[0].init &&
                    stmt.declarations[0].init.type === Syntax.FunctionExpression) {
                result.push(noEmptySpace());
                result.push(generateStatement(stmt.declarations[0], {
                    allowIn: allowIn
                }));
            } else {
                // VariableDeclarator is typed as Statement,
                // but joined with comma (not LineTerminator).
                // So if comment is attached to target node, we should specialize.
                withIndent(function () {
                    node = stmt.declarations[0];
                    if (extra.comment && node.leadingComments) {
                        result.push('\n');
                        result.push(addIndent(generateStatement(node, {
                            allowIn: allowIn
                        })));
                    } else {
                        result.push(noEmptySpace());
                        result.push(generateStatement(node, {
                            allowIn: allowIn
                        }));
                    }

                    for (i = 1, len = stmt.declarations.length; i < len; ++i) {
                        node = stmt.declarations[i];
                        if (extra.comment && node.leadingComments) {
                            result.push(',' + newline);
                            result.push(addIndent(generateStatement(node, {
                                allowIn: allowIn
                            })));
                        } else {
                            result.push(',' + space);
                            result.push(generateStatement(node, {
                                allowIn: allowIn
                            }));
                        }
                    }
                });
            }
            result.push(semicolon);
            break;

        case Syntax.ThrowStatement:
            result = [join(
                'throw',
                generateExpression(stmt.argument, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                })
            ), semicolon];
            break;

        case Syntax.TryStatement:
            result = ['try', maybeBlock(stmt.block)];
            result = maybeBlockSuffix(stmt.block, result);

            if (stmt.handlers) {
                // old interface
                for (i = 0, len = stmt.handlers.length; i < len; ++i) {
                    result = join(result, generateStatement(stmt.handlers[i]));
                    if (stmt.finalizer || i + 1 !== len) {
                        result = maybeBlockSuffix(stmt.handlers[i].body, result);
                    }
                }
            } else {
                stmt.guardedHandlers = stmt.guardedHandlers || [];

                for (i = 0, len = stmt.guardedHandlers.length; i < len; ++i) {
                    result = join(result, generateStatement(stmt.guardedHandlers[i]));
                    if (stmt.finalizer || i + 1 !== len) {
                        result = maybeBlockSuffix(stmt.guardedHandlers[i].body, result);
                    }
                }

                // new interface
                if (stmt.handler) {
                    if (isArray(stmt.handler)) {
                        for (i = 0, len = stmt.handler.length; i < len; ++i) {
                            result = join(result, generateStatement(stmt.handler[i]));
                            if (stmt.finalizer || i + 1 !== len) {
                                result = maybeBlockSuffix(stmt.handler[i].body, result);
                            }
                        }
                    } else {
                        result = join(result, generateStatement(stmt.handler));
                        if (stmt.finalizer) {
                            result = maybeBlockSuffix(stmt.handler.body, result);
                        }
                    }
                }
            }
            if (stmt.finalizer) {
                result = join(result, ['finally', maybeBlock(stmt.finalizer)]);
            }
            break;

        case Syntax.SwitchStatement:
            withIndent(function () {
                result = [
                    'switch' + space + '(',
                    generateExpression(stmt.discriminant, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')' + space + '{' + newline
                ];
            });
            if (stmt.cases) {
                for (i = 0, len = stmt.cases.length; i < len; ++i) {
                    fragment = addIndent(generateStatement(stmt.cases[i], {semicolonOptional: i === len - 1}));
                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                        result.push(newline);
                    }
                }
            }
            result.push(addIndent('}'));
            break;

        case Syntax.SwitchCase:
            withIndent(function () {
                if (stmt.test) {
                    result = [
                        join('case', generateExpression(stmt.test, {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true
                        })),
                        ':'
                    ];
                } else {
                    result = ['default:'];
                }

                i = 0;
                len = stmt.consequent.length;
                if (len && stmt.consequent[0].type === Syntax.BlockStatement) {
                    fragment = maybeBlock(stmt.consequent[0]);
                    result.push(fragment);
                    i = 1;
                }

                if (i !== len && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                    result.push(newline);
                }

                for (; i < len; ++i) {
                    fragment = addIndent(generateStatement(stmt.consequent[i], {semicolonOptional: i === len - 1 && semicolon === ''}));
                    result.push(fragment);
                    if (i + 1 !== len && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                        result.push(newline);
                    }
                }
            });
            break;

        case Syntax.IfStatement:
            withIndent(function () {
                result = [
                    'if' + space + '(',
                    generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            if (stmt.alternate) {
                result.push(maybeBlock(stmt.consequent));
                result = maybeBlockSuffix(stmt.consequent, result);
                if (stmt.alternate.type === Syntax.IfStatement) {
                    result = join(result, ['else ', generateStatement(stmt.alternate, {semicolonOptional: semicolon === ''})]);
                } else {
                    result = join(result, join('else', maybeBlock(stmt.alternate, semicolon === '')));
                }
            } else {
                result.push(maybeBlock(stmt.consequent, semicolon === ''));
            }
            break;

        case Syntax.ForStatement:
            withIndent(function () {
                result = ['for' + space + '('];
                if (stmt.init) {
                    if (stmt.init.type === Syntax.VariableDeclaration) {
                        result.push(generateStatement(stmt.init, {allowIn: false}));
                    } else {
                        result.push(generateExpression(stmt.init, {
                            precedence: Precedence.Sequence,
                            allowIn: false,
                            allowCall: true
                        }));
                        result.push(';');
                    }
                } else {
                    result.push(';');
                }

                if (stmt.test) {
                    result.push(space);
                    result.push(generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }));
                    result.push(';');
                } else {
                    result.push(';');
                }

                if (stmt.update) {
                    result.push(space);
                    result.push(generateExpression(stmt.update, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }));
                    result.push(')');
                } else {
                    result.push(')');
                }
            });

            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        case Syntax.ForInStatement:
            result = generateIterationForStatement('in', stmt, semicolon === '');
            break;

        case Syntax.ForOfStatement:
            result = generateIterationForStatement('of', stmt, semicolon === '');
            break;

        case Syntax.LabeledStatement:
            result = [stmt.label.name + ':', maybeBlock(stmt.body, semicolon === '')];
            break;

        case Syntax.Program:
            len = stmt.body.length;
            result = [safeConcatenation && len > 0 ? '\n' : ''];
            for (i = 0; i < len; ++i) {
                fragment = addIndent(
                    generateStatement(stmt.body[i], {
                        semicolonOptional: !safeConcatenation && i === len - 1,
                        directiveContext: true
                    })
                );
                result.push(fragment);
                if (i + 1 < len && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    result.push(newline);
                }
            }
            break;

        case Syntax.FunctionDeclaration:
            isGenerator = stmt.generator && !extra.moz.starlessGenerator;
            result = [
                (isGenerator ? 'function*' : 'function'),
                (isGenerator ? space : noEmptySpace()),
                generateIdentifier(stmt.id),
                generateFunctionBody(stmt)
            ];
            break;

        case Syntax.ReturnStatement:
            if (stmt.argument) {
                result = [join(
                    'return',
                    generateExpression(stmt.argument, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    })
                ), semicolon];
            } else {
                result = ['return' + semicolon];
            }
            break;

        case Syntax.WhileStatement:
            withIndent(function () {
                result = [
                    'while' + space + '(',
                    generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        case Syntax.WithStatement:
            withIndent(function () {
                result = [
                    'with' + space + '(',
                    generateExpression(stmt.object, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        default:
            throw new Error('Unknown statement type: ' + stmt.type);
        }

        // Attach comments

        if (extra.comment) {
            result = addComments(stmt, result);
        }

        fragment = toSourceNodeWhenNeeded(result).toString();
        if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' &&  fragment.charAt(fragment.length - 1) === '\n') {
            result = sourceMap ? toSourceNodeWhenNeeded(result).replaceRight(/\s+$/, '') : fragment.replace(/\s+$/, '');
        }

        return toSourceNodeWhenNeeded(result, stmt);
    }

    function generate(node, options) {
        var defaultOptions = getDefaultOptions(), result, pair;

        if (options != null) {
            // Obsolete options
            //
            //   `options.indent`
            //   `options.base`
            //
            // Instead of them, we can use `option.format.indent`.
            if (typeof options.indent === 'string') {
                defaultOptions.format.indent.style = options.indent;
            }
            if (typeof options.base === 'number') {
                defaultOptions.format.indent.base = options.base;
            }
            options = updateDeeply(defaultOptions, options);
            indent = options.format.indent.style;
            if (typeof options.base === 'string') {
                base = options.base;
            } else {
                base = stringRepeat(indent, options.format.indent.base);
            }
        } else {
            options = defaultOptions;
            indent = options.format.indent.style;
            base = stringRepeat(indent, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;
        newline = options.format.newline;
        space = options.format.space;
        if (options.format.compact) {
            newline = space = indent = base = '';
        }
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        safeConcatenation = options.format.safeConcatenation;
        directive = options.directive;
        parse = json ? null : options.parse;
        sourceMap = options.sourceMap;
        extra = options;

        if (sourceMap) {
            if (!exports.browser) {
                // We assume environment is node.js
                // And prevent from including source-map by browserify
                SourceNode = require('source-map').SourceNode;
            } else {
                SourceNode = global.sourceMap.SourceNode;
            }
        }

        switch (node.type) {
        case Syntax.BlockStatement:
        case Syntax.BreakStatement:
        case Syntax.CatchClause:
        case Syntax.ContinueStatement:
        case Syntax.DirectiveStatement:
        case Syntax.DoWhileStatement:
        case Syntax.DebuggerStatement:
        case Syntax.EmptyStatement:
        case Syntax.ExpressionStatement:
        case Syntax.ForStatement:
        case Syntax.ForInStatement:
        case Syntax.ForOfStatement:
        case Syntax.FunctionDeclaration:
        case Syntax.IfStatement:
        case Syntax.LabeledStatement:
        case Syntax.Program:
        case Syntax.ReturnStatement:
        case Syntax.SwitchStatement:
        case Syntax.SwitchCase:
        case Syntax.ThrowStatement:
        case Syntax.TryStatement:
        case Syntax.VariableDeclaration:
        case Syntax.VariableDeclarator:
        case Syntax.WhileStatement:
        case Syntax.WithStatement:
            result = generateStatement(node);
            break;

        case Syntax.AssignmentExpression:
        case Syntax.ArrayExpression:
        case Syntax.ArrayPattern:
        case Syntax.BinaryExpression:
        case Syntax.CallExpression:
        case Syntax.ConditionalExpression:
        case Syntax.FunctionExpression:
        case Syntax.Identifier:
        case Syntax.Literal:
        case Syntax.LogicalExpression:
        case Syntax.MemberExpression:
        case Syntax.NewExpression:
        case Syntax.ObjectExpression:
        case Syntax.ObjectPattern:
        case Syntax.Property:
        case Syntax.SequenceExpression:
        case Syntax.ThisExpression:
        case Syntax.UnaryExpression:
        case Syntax.UpdateExpression:
        case Syntax.YieldExpression:

            result = generateExpression(node, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            });
            break;

        default:
            throw new Error('Unknown node type: ' + node.type);
        }

        if (!sourceMap) {
            pair = {code: result.toString(), map: null};
            return options.sourceMapWithCode ? pair : pair.code;
        }


        pair = result.toStringWithSourceMap({
            file: options.file,
            sourceRoot: options.sourceMapRoot
        });

        if (options.sourceContent) {
            pair.map.setSourceContent(options.sourceMap,
                                      options.sourceContent);
        }

        if (options.sourceMapWithCode) {
            return pair;
        }

        return pair.map.toString();
    }

    FORMAT_MINIFY = {
        indent: {
            style: '',
            base: 0
        },
        renumber: true,
        hexadecimal: true,
        quotes: 'auto',
        escapeless: true,
        compact: true,
        parentheses: false,
        semicolons: false
    };

    FORMAT_DEFAULTS = getDefaultOptions().format;

    exports.version = require('./package.json').version;
    exports.generate = generate;
    exports.attachComments = estraverse.attachComments;
    exports.Precedence = updateDeeply({}, Precedence);
    exports.browser = false;
    exports.FORMAT_MINIFY = FORMAT_MINIFY;
    exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
}());
/* vim: set sw=4 ts=4 et tw=80 : */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./package.json":10,"estraverse":11,"esutils":14,"source-map":18}],10:[function(require,module,exports){
module.exports={
  "_from": "git://github.com/Constellation/escodegen.git#41fbbe5058849b5e082542c5cfce76c2d67792e6",
  "_id": "escodegen@1.3.4-dev",
  "_inBundle": false,
  "_integrity": "",
  "_location": "/escodegen",
  "_phantomChildren": {},
  "_requested": {
    "type": "git",
    "raw": "escodegen@git://github.com/Constellation/escodegen.git#41fbbe5058849b5e082542c5cfce76c2d67792e6",
    "name": "escodegen",
    "escapedName": "escodegen",
    "rawSpec": "git://github.com/Constellation/escodegen.git#41fbbe5058849b5e082542c5cfce76c2d67792e6",
    "saveSpec": "git://github.com/Constellation/escodegen.git#41fbbe5058849b5e082542c5cfce76c2d67792e6",
    "fetchSpec": "git://github.com/Constellation/escodegen.git",
    "gitCommittish": "41fbbe5058849b5e082542c5cfce76c2d67792e6"
  },
  "_requiredBy": [
    "/",
    "/wisp"
  ],
  "_resolved": "git://github.com/Constellation/escodegen.git#41fbbe5058849b5e082542c5cfce76c2d67792e6",
  "_spec": "escodegen@git://github.com/Constellation/escodegen.git#41fbbe5058849b5e082542c5cfce76c2d67792e6",
  "_where": "/home/chrism/dev/wisp",
  "bin": {
    "esgenerate": "./bin/esgenerate.js",
    "escodegen": "./bin/escodegen.js"
  },
  "bugs": {
    "url": "https://github.com/Constellation/escodegen/issues"
  },
  "bundleDependencies": false,
  "dependencies": {
    "esprima": "~1.1.1",
    "estraverse": "~1.5.0",
    "esutils": "~1.0.0",
    "source-map": "~0.1.33"
  },
  "deprecated": false,
  "description": "ECMAScript code generator",
  "devDependencies": {
    "bluebird": "~1.2.0",
    "bower-registry-client": "~0.2.0",
    "chai": "~1.7.2",
    "commonjs-everywhere": "~0.9.6",
    "esprima-moz": "*",
    "gulp": "~3.5.0",
    "gulp-eslint": "~0.1.2",
    "gulp-jshint": "~1.4.0",
    "gulp-mocha": "~0.4.1",
    "jshint-stylish": "~0.1.5",
    "semver": "*"
  },
  "engines": {
    "node": ">=0.10.0"
  },
  "homepage": "http://github.com/Constellation/escodegen",
  "licenses": [
    {
      "type": "BSD",
      "url": "http://github.com/Constellation/escodegen/raw/master/LICENSE.BSD"
    }
  ],
  "main": "escodegen.js",
  "maintainers": [
    {
      "name": "Yusuke Suzuki",
      "email": "utatane.tea@gmail.com",
      "url": "http://github.com/Constellation"
    }
  ],
  "name": "escodegen",
  "optionalDependencies": {
    "source-map": "~0.1.33"
  },
  "repository": {
    "type": "git",
    "url": "git+ssh://git@github.com/Constellation/escodegen.git"
  },
  "scripts": {
    "build": "cjsify -a path: tools/entry-point.js > escodegen.browser.js",
    "build-min": "cjsify -ma path: tools/entry-point.js > escodegen.browser.min.js",
    "lint": "gulp lint",
    "release": "node tools/release.js",
    "test": "gulp travis",
    "unit-test": "gulp test"
  },
  "version": "1.3.4-dev"
}

},{}],11:[function(require,module,exports){
/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*jslint vars:false, bitwise:true*/
/*jshint indent:4*/
/*global exports:true, define:true*/
(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // and plain browser loading,
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.estraverse = {}));
    }
}(this, function (exports) {
    'use strict';

    var Syntax,
        isArray,
        VisitorOption,
        VisitorKeys,
        BREAK,
        SKIP;

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    function ignoreJSHintError() { }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                val = obj[key];
                if (typeof val === 'object' && val !== null) {
                    ret[key] = deepCopy(val);
                } else {
                    ret[key] = val;
                }
            }
        }
        return ret;
    }

    function shallowCopy(obj) {
        var ret = {}, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    ignoreJSHintError(shallowCopy);

    // based on LLVM libc++ upper_bound / lower_bound
    // MIT License

    function upperBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                len = diff;
            } else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

    function lowerBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                i = current + 1;
                len -= diff + 1;
            } else {
                len = diff;
            }
        }
        return i;
    }
    ignoreJSHintError(lowerBound);

    VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        ArrayExpression: ['elements'],
        ArrayPattern: ['elements'],
        ArrowFunctionExpression: ['params', 'defaults', 'rest', 'body'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ClassBody: ['body'],
        ClassDeclaration: ['id', 'body', 'superClass'],
        ClassExpression: ['id', 'body', 'superClass'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        ForOfStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'defaults', 'rest', 'body'],
        FunctionExpression: ['id', 'params', 'defaults', 'rest', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        MethodDefinition: ['key', 'value'],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handlers', 'handler', 'guardedHandlers', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body'],
        YieldExpression: ['argument']
    };

    // unique id
    BREAK = {};
    SKIP = {};

    VisitorOption = {
        Break: BREAK,
        Skip: SKIP
    };

    function Reference(parent, key) {
        this.parent = parent;
        this.key = key;
    }

    Reference.prototype.replace = function replace(node) {
        this.parent[this.key] = node;
    };

    function Element(node, path, wrap, ref) {
        this.node = node;
        this.path = path;
        this.wrap = wrap;
        this.ref = ref;
    }

    function Controller() { }

    // API:
    // return property path array from root to current node
    Controller.prototype.path = function path() {
        var i, iz, j, jz, result, element;

        function addToPath(result, path) {
            if (isArray(path)) {
                for (j = 0, jz = path.length; j < jz; ++j) {
                    result.push(path[j]);
                }
            } else {
                result.push(path);
            }
        }

        // root node
        if (!this.__current.path) {
            return null;
        }

        // first node is sentinel, second node is root element
        result = [];
        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
            element = this.__leavelist[i];
            addToPath(result, element.path);
        }
        addToPath(result, this.__current.path);
        return result;
    };

    // API:
    // return array of parent elements
    Controller.prototype.parents = function parents() {
        var i, iz, result;

        // first node is sentinel
        result = [];
        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
            result.push(this.__leavelist[i].node);
        }

        return result;
    };

    // API:
    // return current node
    Controller.prototype.current = function current() {
        return this.__current.node;
    };

    Controller.prototype.__execute = function __execute(callback, element) {
        var previous, result;

        result = undefined;

        previous  = this.__current;
        this.__current = element;
        this.__state = null;
        if (callback) {
            result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        }
        this.__current = previous;

        return result;
    };

    // API:
    // notify control skip / break
    Controller.prototype.notify = function notify(flag) {
        this.__state = flag;
    };

    // API:
    // skip child nodes of current node
    Controller.prototype.skip = function () {
        this.notify(SKIP);
    };

    // API:
    // break traversals
    Controller.prototype['break'] = function () {
        this.notify(BREAK);
    };

    Controller.prototype.__initialize = function(root, visitor) {
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
        this.__current = null;
        this.__state = null;
    };

    Controller.prototype.traverse = function traverse(root, visitor) {
        var worklist,
            leavelist,
            element,
            node,
            nodeType,
            ret,
            key,
            current,
            current2,
            candidates,
            candidate,
            sentinel;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        worklist.push(new Element(root, null, null, null));
        leavelist.push(new Element(null, null, null, null));

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                ret = this.__execute(visitor.leave, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }
                continue;
            }

            if (element.node) {

                ret = this.__execute(visitor.enter, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }

                worklist.push(sentinel);
                leavelist.push(element);

                if (this.__state === SKIP || ret === SKIP) {
                    continue;
                }

                node = element.node;
                nodeType = element.wrap || node.type;
                candidates = VisitorKeys[nodeType];

                current = candidates.length;
                while ((current -= 1) >= 0) {
                    key = candidates[current];
                    candidate = node[key];
                    if (!candidate) {
                        continue;
                    }

                    if (!isArray(candidate)) {
                        worklist.push(new Element(candidate, key, null, null));
                        continue;
                    }

                    current2 = candidate.length;
                    while ((current2 -= 1) >= 0) {
                        if (!candidate[current2]) {
                            continue;
                        }
                        if ((nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === candidates[current]) {
                            element = new Element(candidate[current2], [key, current2], 'Property', null);
                        } else {
                            element = new Element(candidate[current2], [key, current2], null, null);
                        }
                        worklist.push(element);
                    }
                }
            }
        }
    };

    Controller.prototype.replace = function replace(root, visitor) {
        var worklist,
            leavelist,
            node,
            nodeType,
            target,
            element,
            current,
            current2,
            candidates,
            candidate,
            sentinel,
            outer,
            key;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        outer = {
            root: root
        };
        element = new Element(root, null, null, new Reference(outer, 'root'));
        worklist.push(element);
        leavelist.push(element);

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                target = this.__execute(visitor.leave, element);

                // node may be replaced with null,
                // so distinguish between undefined and null in this place
                if (target !== undefined && target !== BREAK && target !== SKIP) {
                    // replace
                    element.ref.replace(target);
                }

                if (this.__state === BREAK || target === BREAK) {
                    return outer.root;
                }
                continue;
            }

            target = this.__execute(visitor.enter, element);

            // node may be replaced with null,
            // so distinguish between undefined and null in this place
            if (target !== undefined && target !== BREAK && target !== SKIP) {
                // replace
                element.ref.replace(target);
                element.node = target;
            }

            if (this.__state === BREAK || target === BREAK) {
                return outer.root;
            }

            // node may be null
            node = element.node;
            if (!node) {
                continue;
            }

            worklist.push(sentinel);
            leavelist.push(element);

            if (this.__state === SKIP || target === SKIP) {
                continue;
            }

            nodeType = element.wrap || node.type;
            candidates = VisitorKeys[nodeType];

            current = candidates.length;
            while ((current -= 1) >= 0) {
                key = candidates[current];
                candidate = node[key];
                if (!candidate) {
                    continue;
                }

                if (!isArray(candidate)) {
                    worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                    continue;
                }

                current2 = candidate.length;
                while ((current2 -= 1) >= 0) {
                    if (!candidate[current2]) {
                        continue;
                    }
                    if (nodeType === Syntax.ObjectExpression && 'properties' === candidates[current]) {
                        element = new Element(candidate[current2], [key, current2], 'Property', new Reference(candidate, current2));
                    } else {
                        element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));
                    }
                    worklist.push(element);
                }
            }
        }

        return outer.root;
    };

    function traverse(root, visitor) {
        var controller = new Controller();
        return controller.traverse(root, visitor);
    }

    function replace(root, visitor) {
        var controller = new Controller();
        return controller.replace(root, visitor);
    }

    function extendCommentRange(comment, tokens) {
        var target;

        target = upperBound(tokens, function search(token) {
            return token.range[0] > comment.range[0];
        });

        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }

        target -= 1;
        if (target >= 0) {
            comment.extendedRange[0] = tokens[target].range[1];
        }

        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        // At first, we should calculate extended comment ranges.
        var comments = [], comment, len, i, cursor;

        if (!tree.range) {
            throw new Error('attachComments needs range information');
        }

        // tokens array is empty, we attach comments to tree as 'leadingComments'
        if (!tokens.length) {
            if (providedComments.length) {
                for (i = 0, len = providedComments.length; i < len; i += 1) {
                    comment = deepCopy(providedComments[i]);
                    comment.extendedRange = [0, tree.range[0]];
                    comments.push(comment);
                }
                tree.leadingComments = comments;
            }
            return tree;
        }

        for (i = 0, len = providedComments.length; i < len; i += 1) {
            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }

        // This is based on John Freeman's implementation.
        cursor = 0;
        traverse(tree, {
            enter: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) {
                        break;
                    }

                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) {
                            node.leadingComments = [];
                        }
                        node.leadingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        cursor = 0;
        traverse(tree, {
            leave: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) {
                        break;
                    }

                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) {
                            node.trailingComments = [];
                        }
                        node.trailingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        return tree;
    }

    exports.version = '1.5.1-dev';
    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.Controller = Controller;
}));
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],12:[function(require,module,exports){
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    var Regex;

    // See also tools/generate-unicode-regex.py.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
    };

    function isDecimalDigit(ch) {
        return (ch >= 48 && ch <= 57);   // 0..9
    }

    function isHexDigit(ch) {
        return isDecimalDigit(ch) || (97 <= ch && ch <= 102) || (65 <= ch && ch <= 70);
    }

    function isOctalDigit(ch) {
        return (ch >= 48 && ch <= 55);   // 0..7
    }

    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122) ||        // a..z
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
    }

    function isIdentifierPart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122) ||        // a..z
            (ch >= 48 && ch <= 57) ||         // 0..9
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
    }

    module.exports = {
        isDecimalDigit: isDecimalDigit,
        isHexDigit: isHexDigit,
        isOctalDigit: isOctalDigit,
        isWhiteSpace: isWhiteSpace,
        isLineTerminator: isLineTerminator,
        isIdentifierStart: isIdentifierStart,
        isIdentifierPart: isIdentifierPart
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],13:[function(require,module,exports){
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    var code = require('./code');

    function isStrictModeReservedWordES6(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isKeywordES5(id, strict) {
        // yield should not be treated as keyword under non-strict mode.
        if (!strict && id === 'yield') {
            return false;
        }
        return isKeywordES6(id, strict);
    }

    function isKeywordES6(id, strict) {
        if (strict && isStrictModeReservedWordES6(id)) {
            return true;
        }

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    function isIdentifierName(id) {
        var i, iz, ch;

        if (id.length === 0) {
            return false;
        }

        ch = id.charCodeAt(0);
        if (!code.isIdentifierStart(ch) || ch === 92) {  // \ (backslash)
            return false;
        }

        for (i = 1, iz = id.length; i < iz; ++i) {
            ch = id.charCodeAt(i);
            if (!code.isIdentifierPart(ch) || ch === 92) {  // \ (backslash)
                return false;
            }
        }
        return true;
    }

    module.exports = {
        isKeywordES5: isKeywordES5,
        isKeywordES6: isKeywordES6,
        isRestrictedWord: isRestrictedWord,
        isIdentifierName: isIdentifierName
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{"./code":12}],14:[function(require,module,exports){
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


(function () {
    'use strict';

    exports.code = require('./code');
    exports.keyword = require('./keyword');
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{"./code":12,"./keyword":13}],15:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],16:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
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

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
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
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

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
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":17}],17:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],18:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./source-map/source-node').SourceNode;

},{"./source-map/source-map-consumer":24,"./source-map/source-map-generator":25,"./source-map/source-node":26}],19:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet();
    for (var i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var isDuplicate = this.has(aStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set[util.toSetString(aStr)] = idx;
    }
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                util.toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[util.toSetString(aStr)];
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error('No element indexed by ' + aIdx);
  };

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };

  exports.ArraySet = ArraySet;

});

},{"./util":27,"amdefine":4}],20:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64 = require('./base64');

  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
  // length quantities we use in the source map spec, the first bit is the sign,
  // the next four bits are the actual value, and the 6th bit is the
  // continuation bit. The continuation bit tells us whether there are more
  // digits in this value following this digit.
  //
  //   Continuation
  //   |    Sign
  //   |    |
  //   V    V
  //   101011

  var VLQ_BASE_SHIFT = 5;

  // binary: 100000
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

  // binary: 011111
  var VLQ_BASE_MASK = VLQ_BASE - 1;

  // binary: 100000
  var VLQ_CONTINUATION_BIT = VLQ_BASE;

  /**
   * Converts from a two-complement value to a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */
  function toVLQSigned(aValue) {
    return aValue < 0
      ? ((-aValue) << 1) + 1
      : (aValue << 1) + 0;
  }

  /**
   * Converts to a two-complement value from a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative
      ? -shifted
      : shifted;
  }

  /**
   * Returns the base 64 VLQ encoded value.
   */
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;

    var vlq = toVLQSigned(aValue);

    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        // There are still more digits in this value, so we must make sure the
        // continuation bit is marked.
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);

    return encoded;
  };

  /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string via the out parameter.
   */
  exports.decode = function base64VLQ_decode(aStr, aOutParam) {
    var i = 0;
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (i >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charAt(i++));
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    aOutParam.value = fromVLQSigned(result);
    aOutParam.rest = aStr.slice(i);
  };

});

},{"./base64":21,"amdefine":4}],21:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var charToIntMap = {};
  var intToCharMap = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    .split('')
    .forEach(function (ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function base64_encode(aNumber) {
    if (aNumber in intToCharMap) {
      return intToCharMap[aNumber];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 digit to an integer.
   */
  exports.decode = function base64_decode(aChar) {
    if (aChar in charToIntMap) {
      return charToIntMap[aChar];
    }
    throw new TypeError("Not a valid base 64 digit: " + aChar);
  };

});

},{"amdefine":4}],22:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the index of
    //      the next closest element that is less than that element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element which is less than the one we are searching for, so we
    //      return -1.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      // Found the element we are looking for.
      return mid;
    }
    else if (cmp > 0) {
      // aHaystack[mid] is greater than our needle.
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
      }
      // We did not find an exact match, return the next closest one
      // (termination case 2).
      return mid;
    }
    else {
      // aHaystack[mid] is less than our needle.
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
      }
      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (2) or (3) and return the appropriate thing.
      return aLow < 0 ? -1 : aLow;
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the index of next lowest value checked if there is no exact hit. This is
   * because mappings between original and generated line/col pairs are single
   * points, and there is an implicit region between each of them, so a miss
   * just means that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare) {
    if (aHaystack.length === 0) {
      return -1;
    }
    return recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
  };

});

},{"amdefine":4}],23:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * Determine whether mappingB is after mappingA with respect to generated
   * position.
   */
  function generatedPositionAfter(mappingA, mappingB) {
    // Optimized for most common case
    var lineA = mappingA.generatedLine;
    var lineB = mappingB.generatedLine;
    var columnA = mappingA.generatedColumn;
    var columnB = mappingB.generatedColumn;
    return lineB > lineA || lineB == lineA && columnB >= columnA ||
           util.compareByGeneratedPositions(mappingA, mappingB) <= 0;
  }

  /**
   * A data structure to provide a sorted view of accumulated mappings in a
   * performance conscious manner. It trades a neglibable overhead in general
   * case for a large speedup in case of mappings being added in order.
   */
  function MappingList() {
    this._array = [];
    this._sorted = true;
    // Serves as infimum
    this._last = {generatedLine: -1, generatedColumn: 0};
  }

  /**
   * Iterate through internal items. This method takes the same arguments that
   * `Array.prototype.forEach` takes.
   *
   * NOTE: The order of the mappings is NOT guaranteed.
   */
  MappingList.prototype.unsortedForEach =
    function MappingList_forEach(aCallback, aThisArg) {
      this._array.forEach(aCallback, aThisArg);
    };

  /**
   * Add the given source mapping.
   *
   * @param Object aMapping
   */
  MappingList.prototype.add = function MappingList_add(aMapping) {
    var mapping;
    if (generatedPositionAfter(this._last, aMapping)) {
      this._last = aMapping;
      this._array.push(aMapping);
    } else {
      this._sorted = false;
      this._array.push(aMapping);
    }
  };

  /**
   * Returns the flat, sorted array of mappings. The mappings are sorted by
   * generated position.
   *
   * WARNING: This method returns internal data without copying, for
   * performance. The return value must NOT be mutated, and should be treated as
   * an immutable borrow. If you want to take ownership, you must make your own
   * copy.
   */
  MappingList.prototype.toArray = function MappingList_toArray() {
    if (!this._sorted) {
      this._array.sort(util.compareByGeneratedPositions);
      this._sorted = true;
    }
    return this._array;
  };

  exports.MappingList = MappingList;

});

},{"./util":27,"amdefine":4}],24:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - sourcesContent: Optional. An array of contents of the original source files.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: Optional. The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
    // requires the array) to play nice here.
    var names = util.getArg(sourceMap, 'names', []);
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file', null);

    // Once again, Sass deviates from the spec and supplies the version as a
    // string rather than a number, so we use loose equality checking here.
    if (version != this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    sources = sources.map(util.normalize);

    // Pass `true` below to allow duplicate names and sources. While source maps
    // are intended to be compressed and deduplicated, the TypeScript compiler
    // sometimes generates source maps with duplicates in them. See Github issue
    // #72 and bugzil.la/889492.
    this._names = ArraySet.fromArray(names, true);
    this._sources = ArraySet.fromArray(sources, true);

    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this.file = file;
  }

  /**
   * Create a SourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns SourceMapConsumer
   */
  SourceMapConsumer.fromSourceMap =
    function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);

      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                              smc.sourceRoot);
      smc.file = aSourceMap._file;

      smc.__generatedMappings = aSourceMap._mappings.toArray().slice();
      smc.__originalMappings = aSourceMap._mappings.toArray().slice()
        .sort(util.compareByOriginalPositions);

      return smc;
    };

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
      }, this);
    }
  });

  // `__generatedMappings` and `__originalMappings` are arrays that hold the
  // parsed mapping coordinates from the source map's "mappings" attribute. They
  // are lazily instantiated, accessed via the `_generatedMappings` and
  // `_originalMappings` getters respectively, and we only parse the mappings
  // and create these arrays once queried for a source location. We jump through
  // these hoops because there can be many thousands of mappings, and parsing
  // them is expensive, so we only want to do it if we must.
  //
  // Each object in the arrays is of the form:
  //
  //     {
  //       generatedLine: The line number in the generated code,
  //       generatedColumn: The column number in the generated code,
  //       source: The path to the original source file that generated this
  //               chunk of code,
  //       originalLine: The line number in the original source that
  //                     corresponds to this chunk of generated code,
  //       originalColumn: The column number in the original source that
  //                       corresponds to this chunk of generated code,
  //       name: The name of the original symbol which generated this chunk of
  //             code.
  //     }
  //
  // All properties except for `generatedLine` and `generatedColumn` can be
  // `null`.
  //
  // `_generatedMappings` is ordered by the generated positions.
  //
  // `_originalMappings` is ordered by the original positions.

  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
    get: function () {
      if (!this.__generatedMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__generatedMappings;
    }
  });

  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
    get: function () {
      if (!this.__originalMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__originalMappings;
    }
  });

  SourceMapConsumer.prototype._nextCharIsMappingSeparator =
    function SourceMapConsumer_nextCharIsMappingSeparator(aStr) {
      var c = aStr.charAt(0);
      return c === ";" || c === ",";
    };

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var str = aStr;
      var temp = {};
      var mapping;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          base64VLQ.decode(str, temp);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
            // Original source.
            base64VLQ.decode(str, temp);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            base64VLQ.decode(str, temp);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            base64VLQ.decode(str, temp);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
              // Original name.
              base64VLQ.decode(str, temp);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this.__generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this.__originalMappings.push(mapping);
          }
        }
      }

      this.__generatedMappings.sort(util.compareByGeneratedPositions);
      this.__originalMappings.sort(util.compareByOriginalPositions);
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  SourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator) {
      // To return the position we are searching for, we must first find the
      // mapping for the given position and then return the opposite position it
      // points to. Because the mappings are sorted, we can use binary search to
      // find the best mapping.

      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got '
                            + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '
                            + aNeedle[aColumnName]);
      }

      return binarySearch.search(aNeedle, aMappings, aComparator);
    };

  /**
   * Compute the last column for each generated mapping. The last column is
   * inclusive.
   */
  SourceMapConsumer.prototype.computeColumnSpans =
    function SourceMapConsumer_computeColumnSpans() {
      for (var index = 0; index < this._generatedMappings.length; ++index) {
        var mapping = this._generatedMappings[index];

        // Mappings do not contain a field for the last generated columnt. We
        // can come up with an optimistic estimate, however, by assuming that
        // mappings are contiguous (i.e. given two consecutive mappings, the
        // first mapping ends where the second one starts).
        if (index + 1 < this._generatedMappings.length) {
          var nextMapping = this._generatedMappings[index + 1];

          if (mapping.generatedLine === nextMapping.generatedLine) {
            mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
            continue;
          }
        }

        // The last mapping for each line spans the entire line.
        mapping.lastGeneratedColumn = Infinity;
      }
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var index = this._findMapping(needle,
                                    this._generatedMappings,
                                    "generatedLine",
                                    "generatedColumn",
                                    util.compareByGeneratedPositions);

      if (index >= 0) {
        var mapping = this._generatedMappings[index];

        if (mapping.generatedLine === needle.generatedLine) {
          var source = util.getArg(mapping, 'source', null);
          if (source != null && this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
          return {
            source: source,
            line: util.getArg(mapping, 'originalLine', null),
            column: util.getArg(mapping, 'originalColumn', null),
            name: util.getArg(mapping, 'name', null)
          };
        }
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */
  SourceMapConsumer.prototype.sourceContentFor =
    function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }

      if (this.sourceRoot != null) {
        aSource = util.relative(this.sourceRoot, aSource);
      }

      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }

      var url;
      if (this.sourceRoot != null
          && (url = util.urlParse(this.sourceRoot))) {
        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
        // many users. We can help them out when they expect file:// URIs to
        // behave like it would if they were running a local HTTP server. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file"
            && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
        }

        if ((!url.path || url.path == "/")
            && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }

      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);

      if (index >= 0) {
        var mapping = this._originalMappings[index];

        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }

      return {
        line: null,
        column: null,
        lastColumn: null
      };
    };

  /**
   * Returns all generated line and column information for the original source
   * and line provided. The only argument is an object with the following
   * properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *
   * and an array of objects is returned, each with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.allGeneratedPositionsFor =
    function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
      // When there is no exact match, SourceMapConsumer.prototype._findMapping
      // returns the index of the closest mapping less than the needle. By
      // setting needle.originalColumn to Infinity, we thus find the last
      // mapping for the given line, provided such a mapping exists.
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: Infinity
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var mappings = [];

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);
      if (index >= 0) {
        var mapping = this._originalMappings[index];

        while (mapping && mapping.originalLine === needle.originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[--index];
        }
      }

      return mappings.reverse();
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  SourceMapConsumer.prototype.eachMapping =
    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

      var mappings;
      switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
      }

      var sourceRoot = this.sourceRoot;
      mappings.map(function (mapping) {
        var source = mapping.source;
        if (source != null && sourceRoot != null) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };

  exports.SourceMapConsumer = SourceMapConsumer;

});

},{"./array-set":19,"./base64-vlq":20,"./binary-search":22,"./util":27,"amdefine":4}],25:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64VLQ = require('./base64-vlq');
  var util = require('./util');
  var ArraySet = require('./array-set').ArraySet;
  var MappingList = require('./mapping-list').MappingList;

  /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. You may pass an object with the following
   * properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: A root for all relative URLs in this source map.
   */
  function SourceMapGenerator(aArgs) {
    if (!aArgs) {
      aArgs = {};
    }
    this._file = util.getArg(aArgs, 'file', null);
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
    this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = new MappingList();
    this._sourcesContents = null;
  }

  SourceMapGenerator.prototype._version = 3;

  /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */
  SourceMapGenerator.fromSourceMap =
    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function (mapping) {
        var newMapping = {
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }
        };

        if (mapping.source != null) {
          newMapping.source = mapping.source;
          if (sourceRoot != null) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }

          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };

          if (mapping.name != null) {
            newMapping.name = mapping.name;
          }
        }

        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  SourceMapGenerator.prototype.addMapping =
    function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);

      if (!this._skipValidation) {
        this._validateMapping(generated, original, source, name);
      }

      if (source != null && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name != null && !this._names.has(name)) {
        this._names.add(name);
      }

      this._mappings.add({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };

  /**
   * Set the source content for a source file.
   */
  SourceMapGenerator.prototype.setSourceContent =
    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot != null) {
        source = util.relative(this._sourceRoot, source);
      }

      if (aSourceContent != null) {
        // Add the source content to the _sourcesContents map.
        // Create a new _sourcesContents map if the property is null.
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else if (this._sourcesContents) {
        // Remove the source file from the _sourcesContents map.
        // If the _sourcesContents map is empty, set the property to null.
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };

  /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   * @param aSourceMapPath Optional. The dirname of the path to the source map
   *        to be applied. If relative, it is relative to the SourceMapConsumer.
   *        This parameter is needed when the two source maps aren't in the same
   *        directory, and the source map to be applied contains relative source
   *        paths. If so, those relative source paths need to be rewritten
   *        relative to the SourceMapGenerator.
   */
  SourceMapGenerator.prototype.applySourceMap =
    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
      var sourceFile = aSourceFile;
      // If aSourceFile is omitted, we will use the file property of the SourceMap
      if (aSourceFile == null) {
        if (aSourceMapConsumer.file == null) {
          throw new Error(
            'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
            'or the source map\'s "file" property. Both were omitted.'
          );
        }
        sourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      // Make "sourceFile" relative if an absolute Url is passed.
      if (sourceRoot != null) {
        sourceFile = util.relative(sourceRoot, sourceFile);
      }
      // Applying the SourceMap can add and remove items from the sources and
      // the names array.
      var newSources = new ArraySet();
      var newNames = new ArraySet();

      // Find mappings for the "sourceFile"
      this._mappings.unsortedForEach(function (mapping) {
        if (mapping.source === sourceFile && mapping.originalLine != null) {
          // Check if it can be mapped by the source map, then update the mapping.
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source != null) {
            // Copy mapping
            mapping.source = original.source;
            if (aSourceMapPath != null) {
              mapping.source = util.join(aSourceMapPath, mapping.source)
            }
            if (sourceRoot != null) {
              mapping.source = util.relative(sourceRoot, mapping.source);
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name != null) {
              mapping.name = original.name;
            }
          }
        }

        var source = mapping.source;
        if (source != null && !newSources.has(source)) {
          newSources.add(source);
        }

        var name = mapping.name;
        if (name != null && !newNames.has(name)) {
          newNames.add(name);
        }

      }, this);
      this._sources = newSources;
      this._names = newNames;

      // Copy sourcesContents of applied map.
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aSourceMapPath != null) {
            sourceFile = util.join(aSourceMapPath, sourceFile);
          }
          if (sourceRoot != null) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  SourceMapGenerator.prototype._validateMapping =
    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
          && aGenerated.line > 0 && aGenerated.column >= 0
          && !aOriginal && !aSource && !aName) {
        // Case 1.
        return;
      }
      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
               && aGenerated.line > 0 && aGenerated.column >= 0
               && aOriginal.line > 0 && aOriginal.column >= 0
               && aSource) {
        // Cases 2 and 3.
        return;
      }
      else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          original: aOriginal,
          name: aName
        }));
      }
    };

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  SourceMapGenerator.prototype._serializeMappings =
    function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;

      var mappings = this._mappings.toArray();

      for (var i = 0, len = mappings.length; i < len; i++) {
        mapping = mappings[i];

        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generatedColumn
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source != null) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.originalLine - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;

          result += base64VLQ.encode(mapping.originalColumn
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;

          if (mapping.name != null) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }

      return result;
    };

  SourceMapGenerator.prototype._generateSourcesContent =
    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function (source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot != null) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                    key)
          ? this._sourcesContents[key]
          : null;
      }, this);
    };

  /**
   * Externalize the source map.
   */
  SourceMapGenerator.prototype.toJSON =
    function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._file != null) {
        map.file = this._file;
      }
      if (this._sourceRoot != null) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }

      return map;
    };

  /**
   * Render the source map being generated to a string.
   */
  SourceMapGenerator.prototype.toString =
    function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});

},{"./array-set":19,"./base64-vlq":20,"./mapping-list":23,"./util":27,"amdefine":4}],26:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
  var util = require('./util');

  // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
  // operating systems these days (capturing the result).
  var REGEX_NEWLINE = /(\r?\n)/;

  // Newline character code for charCodeAt() comparisons
  var NEWLINE_CODE = 10;

  // Private symbol for identifying `SourceNode`s when multiple versions of
  // the source-map library are loaded. This MUST NOT CHANGE across
  // versions!
  var isSourceNode = "$$$isSourceNode$$$";

  /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   * @param aName The original identifier.
   */
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine == null ? null : aLine;
    this.column = aColumn == null ? null : aColumn;
    this.source = aSource == null ? null : aSource;
    this.name = aName == null ? null : aName;
    this[isSourceNode] = true;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   * @param aRelativePath Optional. The path that relative sources in the
   *        SourceMapConsumer should be relative to.
   */
  SourceNode.fromStringWithSourceMap =
    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
      // The SourceNode we want to fill with the generated code
      // and the SourceMap
      var node = new SourceNode();

      // All even indices of this array are one line of the generated code,
      // while all odd indices are the newlines between two adjacent lines
      // (since `REGEX_NEWLINE` captures its match).
      // Processed fragments are removed from this array, by calling `shiftNextLine`.
      var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
      var shiftNextLine = function() {
        var lineContents = remainingLines.shift();
        // The last line of a file might not have a newline.
        var newLine = remainingLines.shift() || "";
        return lineContents + newLine;
      };

      // We need to remember the position of "remainingLines"
      var lastGeneratedLine = 1, lastGeneratedColumn = 0;

      // The generate SourceNodes we need a code range.
      // To extract it current and last mapping is used.
      // Here we store the last mapping.
      var lastMapping = null;

      aSourceMapConsumer.eachMapping(function (mapping) {
        if (lastMapping !== null) {
          // We add the code from "lastMapping" to "mapping":
          // First check if there is a new line in between.
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            // Associate first line with "lastMapping"
            addMappingWithCode(lastMapping, shiftNextLine());
            lastGeneratedLine++;
            lastGeneratedColumn = 0;
            // The remaining code is added without mapping
          } else {
            // There is no new line in between.
            // Associate the code between "lastGeneratedColumn" and
            // "mapping.generatedColumn" with "lastMapping"
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn -
                                          lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                                lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
            // No more remaining code, continue
            lastMapping = mapping;
            return;
          }
        }
        // We add the generated code until the first mapping
        // to the SourceNode without any mapping.
        // Each line is added as separate string.
        while (lastGeneratedLine < mapping.generatedLine) {
          node.add(shiftNextLine());
          lastGeneratedLine++;
        }
        if (lastGeneratedColumn < mapping.generatedColumn) {
          var nextLine = remainingLines[0];
          node.add(nextLine.substr(0, mapping.generatedColumn));
          remainingLines[0] = nextLine.substr(mapping.generatedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
        }
        lastMapping = mapping;
      }, this);
      // We have processed all mappings.
      if (remainingLines.length > 0) {
        if (lastMapping) {
          // Associate the remaining code in the current line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
        }
        // and add the remaining lines without any mapping
        node.add(remainingLines.join(""));
      }

      // Copy sourcesContent into SourceNode
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aRelativePath != null) {
            sourceFile = util.join(aRelativePath, sourceFile);
          }
          node.setSourceContent(sourceFile, content);
        }
      });

      return node;

      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          var source = aRelativePath
            ? util.join(aRelativePath, mapping.source)
            : mapping.source;
          node.add(new SourceNode(mapping.originalLine,
                                  mapping.originalColumn,
                                  source,
                                  code,
                                  mapping.name));
        }
      }
    };

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function (chunk) {
        this.add(chunk);
      }, this);
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length-1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length; i < len; i++) {
      chunk = this.children[i];
      if (chunk[isSourceNode]) {
        chunk.walk(aFn);
      }
      else {
        if (chunk !== '') {
          aFn(chunk, { source: this.source,
                       line: this.line,
                       column: this.column,
                       name: this.name });
        }
      }
    }
  };

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len-1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild[isSourceNode]) {
      lastChild.replaceRight(aPattern, aReplacement);
    }
    else if (typeof lastChild === 'string') {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    }
    else {
      this.children.push(''.replace(aPattern, aReplacement));
    }
    return this;
  };

  /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */
  SourceNode.prototype.setSourceContent =
    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };

  /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walkSourceContents =
    function SourceNode_walkSourceContents(aFn) {
      for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i][isSourceNode]) {
          this.children[i].walkSourceContents(aFn);
        }
      }

      var sources = Object.keys(this.sourceContents);
      for (var i = 0, len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function (chunk) {
      str += chunk;
    });
    return str;
  };

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function (chunk, original) {
      generated.code += chunk;
      if (original.source !== null
          && original.line !== null
          && original.column !== null) {
        if(lastOriginalSource !== original.source
           || lastOriginalLine !== original.line
           || lastOriginalColumn !== original.column
           || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      for (var idx = 0, length = chunk.length; idx < length; idx++) {
        if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
          generated.line++;
          generated.column = 0;
          // Mappings end at eol
          if (idx + 1 === length) {
            lastOriginalSource = null;
            sourceMappingActive = false;
          } else if (sourceMappingActive) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
        } else {
          generated.column++;
        }
      }
    });
    this.walkSourceContents(function (sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });

    return { code: generated.code, map: map };
  };

  exports.SourceNode = SourceNode;

});

},{"./source-map-generator":25,"./util":27,"amdefine":4}],27:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
  var dataUrlRegexp = /^data:.+\,.+$/;

  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5]
    };
  }
  exports.urlParse = urlParse;

  function urlGenerate(aParsedUrl) {
    var url = '';
    if (aParsedUrl.scheme) {
      url += aParsedUrl.scheme + ':';
    }
    url += '//';
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + '@';
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;

  /**
   * Normalizes a path, or the path portion of a URL:
   *
   * - Replaces consequtive slashes with one slash.
   * - Removes unnecessary '.' parts.
   * - Removes unnecessary '<dir>/..' parts.
   *
   * Based on code in the Node.js 'path' core module.
   *
   * @param aPath The path or url to normalize.
   */
  function normalize(aPath) {
    var path = aPath;
    var url = urlParse(aPath);
    if (url) {
      if (!url.path) {
        return aPath;
      }
      path = url.path;
    }
    var isAbsolute = (path.charAt(0) === '/');

    var parts = path.split(/\/+/);
    for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
      part = parts[i];
      if (part === '.') {
        parts.splice(i, 1);
      } else if (part === '..') {
        up++;
      } else if (up > 0) {
        if (part === '') {
          // The first part is blank if the path is absolute. Trying to go
          // above the root is a no-op. Therefore we can remove all '..' parts
          // directly after the root.
          parts.splice(i + 1, up);
          up = 0;
        } else {
          parts.splice(i, 2);
          up--;
        }
      }
    }
    path = parts.join('/');

    if (path === '') {
      path = isAbsolute ? '/' : '.';
    }

    if (url) {
      url.path = path;
      return urlGenerate(url);
    }
    return path;
  }
  exports.normalize = normalize;

  /**
   * Joins two paths/URLs.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be joined with the root.
   *
   * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
   *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
   *   first.
   * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
   *   is updated with the result and aRoot is returned. Otherwise the result
   *   is returned.
   *   - If aPath is absolute, the result is aPath.
   *   - Otherwise the two paths are joined with a slash.
   * - Joining for example 'http://' and 'www.example.com' is also supported.
   */
  function join(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    if (aPath === "") {
      aPath = ".";
    }
    var aPathUrl = urlParse(aPath);
    var aRootUrl = urlParse(aRoot);
    if (aRootUrl) {
      aRoot = aRootUrl.path || '/';
    }

    // `join(foo, '//www.example.org')`
    if (aPathUrl && !aPathUrl.scheme) {
      if (aRootUrl) {
        aPathUrl.scheme = aRootUrl.scheme;
      }
      return urlGenerate(aPathUrl);
    }

    if (aPathUrl || aPath.match(dataUrlRegexp)) {
      return aPath;
    }

    // `join('http://', 'www.example.com')`
    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
      aRootUrl.host = aPath;
      return urlGenerate(aRootUrl);
    }

    var joined = aPath.charAt(0) === '/'
      ? aPath
      : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

    if (aRootUrl) {
      aRootUrl.path = joined;
      return urlGenerate(aRootUrl);
    }
    return joined;
  }
  exports.join = join;

  /**
   * Make a path relative to a URL or another path.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be made relative to aRoot.
   */
  function relative(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }

    aRoot = aRoot.replace(/\/$/, '');

    // XXX: It is possible to remove this block, and the tests still pass!
    var url = urlParse(aRoot);
    if (aPath.charAt(0) == "/" && url && url.path == "/") {
      return aPath.slice(1);
    }

    return aPath.indexOf(aRoot + '/') === 0
      ? aPath.substr(aRoot.length + 1)
      : aPath;
  }
  exports.relative = relative;

  /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  function toSetString(aStr) {
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  function strcmp(aStr1, aStr2) {
    var s1 = aStr1 || "";
    var s2 = aStr2 || "";
    return (s1 > s2) - (s1 < s2);
  }

  /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp;

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp || onlyCompareOriginal) {
      return cmp;
    }

    cmp = strcmp(mappingA.name, mappingB.name);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    return mappingA.generatedColumn - mappingB.generatedColumn;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings where the generated positions are
   * compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
    var cmp;

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp || onlyCompareGenerated) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositions = compareByGeneratedPositions;

});

},{"amdefine":4}],28:[function(require,module,exports){
var indexOf = function (xs, item) {
    if (xs.indexOf) return xs.indexOf(item);
    else for (var i = 0; i < xs.length; i++) {
        if (xs[i] === item) return i;
    }
    return -1;
};
var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    if (context) {
        forEach(Object_keys(ctx), function (key) {
            context[key] = ctx[key];
        });
    }

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.isContext = function (context) {
    return context instanceof Context;
};

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{}],"wisp/analyzer":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.analyzer',
            doc: void 0
        };
    var wisp_ast = require('./ast');
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var isSymbol = wisp_ast.isSymbol;
    var isKeyword = wisp_ast.isKeyword;
    var isQuote = wisp_ast.isQuote;
    var symbol = wisp_ast.symbol;
    var namespace = wisp_ast.namespace;
    var name = wisp_ast.name;
    var prStr = wisp_ast.prStr;
    var isUnquote = wisp_ast.isUnquote;
    var isUnquoteSplicing = wisp_ast.isUnquoteSplicing;
    var wisp_sequence = require('./sequence');
    var isList = wisp_sequence.isList;
    var list = wisp_sequence.list;
    var conj = wisp_sequence.conj;
    var partition = wisp_sequence.partition;
    var seq = wisp_sequence.seq;
    var isEmpty = wisp_sequence.isEmpty;
    var map = wisp_sequence.map;
    var vec = wisp_sequence.vec;
    var isEvery = wisp_sequence.isEvery;
    var concat = wisp_sequence.concat;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var last = wisp_sequence.last;
    var butlast = wisp_sequence.butlast;
    var interleave = wisp_sequence.interleave;
    var cons = wisp_sequence.cons;
    var count = wisp_sequence.count;
    var some = wisp_sequence.some;
    var assoc = wisp_sequence.assoc;
    var reduce = wisp_sequence.reduce;
    var filter = wisp_sequence.filter;
    var isSeq = wisp_sequence.isSeq;
    var wisp_runtime = require('./runtime');
    var isNil = wisp_runtime.isNil;
    var isDictionary = wisp_runtime.isDictionary;
    var isVector = wisp_runtime.isVector;
    var keys = wisp_runtime.keys;
    var vals = wisp_runtime.vals;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isBoolean = wisp_runtime.isBoolean;
    var isDate = wisp_runtime.isDate;
    var isRePattern = wisp_runtime.isRePattern;
    var isEven = wisp_runtime.isEven;
    var isEqual = wisp_runtime.isEqual;
    var max = wisp_runtime.max;
    var dec = wisp_runtime.dec;
    var dictionary = wisp_runtime.dictionary;
    var subs = wisp_runtime.subs;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var wisp_expander = require('./expander');
    var macroexpand = wisp_expander.macroexpand;
    var wisp_string = require('./string');
    var split = wisp_string.split;
    var join = wisp_string.join;
}
var syntaxError = exports.syntaxError = function syntaxError(message, form) {
        return function () {
            var metadataø1 = meta(form);
            var lineø1 = ((metadataø1 || 0)['start'] || 0)['line'];
            var uriø1 = (metadataø1 || 0)['uri'];
            var columnø1 = ((metadataø1 || 0)['start'] || 0)['column'];
            var errorø1 = SyntaxError('' + message + '\n' + 'Form: ' + prStr(form) + '\n' + 'URI: ' + uriø1 + '\n' + 'Line: ' + lineø1 + '\n' + 'Column: ' + columnø1);
            errorø1.lineNumber = lineø1;
            errorø1.line = lineø1;
            errorø1.columnNumber = columnø1;
            errorø1.column = columnø1;
            errorø1.fileName = uriø1;
            errorø1.uri = uriø1;
            return (function () {
                throw errorø1;
            })();
        }.call(this);
    };
var analyzeKeyword = exports.analyzeKeyword = function analyzeKeyword(env, form) {
        return {
            'op': 'constant',
            'form': form
        };
    };
var __specials__ = exports.__specials__ = {};
var installSpecial = exports.installSpecial = function installSpecial(op, analyzer) {
        return (__specials__ || 0)[name(op)] = analyzer;
    };
var analyzeSpecial = exports.analyzeSpecial = function analyzeSpecial(analyzer, env, form) {
        return function () {
            var metadataø1 = meta(form);
            var astø1 = analyzer(env, form);
            return conj({
                'start': (metadataø1 || 0)['start'],
                'end': (metadataø1 || 0)['end']
            }, astø1);
        }.call(this);
    };
var analyzeIf = exports.analyzeIf = function analyzeIf(env, form) {
        return function () {
            var formsø1 = rest(form);
            var testø1 = analyze(env, first(formsø1));
            var consequentø1 = analyze(env, second(formsø1));
            var alternateø1 = analyze(env, third(formsø1));
            count(formsø1) < 2 ? syntaxError('Malformed if expression, too few operands', form) : void 0;
            return {
                'op': 'if',
                'form': form,
                'test': testø1,
                'consequent': consequentø1,
                'alternate': alternateø1
            };
        }.call(this);
    };
installSpecial('if', analyzeIf);
var analyzeThrow = exports.analyzeThrow = function analyzeThrow(env, form) {
        return function () {
            var expressionø1 = analyze(env, second(form));
            return {
                'op': 'throw',
                'form': form,
                'throw': expressionø1
            };
        }.call(this);
    };
installSpecial('throw', analyzeThrow);
var analyzeTry = exports.analyzeTry = function analyzeTry(env, form) {
        return function () {
            var formsø1 = vec(rest(form));
            var tailø1 = last(formsø1);
            var finalizerFormø1 = isList(tailø1) && isEqual(symbol(void 0, 'finally'), first(tailø1)) ? rest(tailø1) : void 0;
            var finalizerø1 = finalizerFormø1 ? analyzeBlock(env, finalizerFormø1) : void 0;
            var bodyFormø1 = finalizerø1 ? butlast(formsø1) : formsø1;
            var tailø2 = last(bodyFormø1);
            var handlerFormø1 = isList(tailø2) && isEqual(symbol(void 0, 'catch'), first(tailø2)) ? rest(tailø2) : void 0;
            var handlerø1 = handlerFormø1 ? conj({ 'name': analyze(env, first(handlerFormø1)) }, analyzeBlock(env, rest(handlerFormø1))) : void 0;
            var bodyø1 = handlerFormø1 ? analyzeBlock(subEnv(env), butlast(bodyFormø1)) : analyzeBlock(subEnv(env), bodyFormø1);
            return {
                'op': 'try',
                'form': form,
                'body': bodyø1,
                'handler': handlerø1,
                'finalizer': finalizerø1
            };
        }.call(this);
    };
installSpecial('try', analyzeTry);
var analyzeSet = exports.analyzeSet = function analyzeSet(env, form) {
        return function () {
            var bodyø1 = rest(form);
            var leftø1 = first(bodyø1);
            var rightø1 = second(bodyø1);
            var targetø1 = isSymbol(leftø1) ? analyzeSymbol(env, leftø1) : isList(leftø1) ? analyzeList(env, leftø1) : 'else' ? leftø1 : void 0;
            var valueø1 = analyze(env, rightø1);
            return {
                'op': 'set!',
                'target': targetø1,
                'value': valueø1,
                'form': form
            };
        }.call(this);
    };
installSpecial('set!', analyzeSet);
var analyzeNew = exports.analyzeNew = function analyzeNew(env, form) {
        return function () {
            var bodyø1 = rest(form);
            var constructorø1 = analyze(env, first(bodyø1));
            var paramsø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, rest(bodyø1)));
            return {
                'op': 'new',
                'constructor': constructorø1,
                'form': form,
                'params': paramsø1
            };
        }.call(this);
    };
installSpecial('new', analyzeNew);
var analyzeAget = exports.analyzeAget = function analyzeAget(env, form) {
        return function () {
            var bodyø1 = rest(form);
            var targetø1 = analyze(env, first(bodyø1));
            var attributeø1 = second(bodyø1);
            var fieldø1 = isQuote(attributeø1) && isSymbol(second(attributeø1)) && second(attributeø1);
            return isNil(attributeø1) ? syntaxError('Malformed aget expression expected (aget object member)', form) : {
                'op': 'member-expression',
                'computed': !fieldø1,
                'form': form,
                'target': targetø1,
                'property': fieldø1 ? conj(analyzeSpecial(analyzeIdentifier, env, fieldø1), { 'binding': void 0 }) : analyze(env, attributeø1)
            };
        }.call(this);
    };
installSpecial('aget', analyzeAget);
var parseDef = exports.parseDef = function parseDef() {
        switch (arguments.length) {
        case 1:
            var id = arguments[0];
            return { 'id': id };
        case 2:
            var id = arguments[0];
            var init = arguments[1];
            return {
                'id': id,
                'init': init
            };
        case 3:
            var id = arguments[0];
            var doc = arguments[1];
            var init = arguments[2];
            return {
                'id': id,
                'doc': doc,
                'init': init
            };
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
var analyzeDef = exports.analyzeDef = function analyzeDef(env, form) {
        return function () {
            var paramsø1 = parseDef.apply(void 0, vec(rest(form)));
            var idø1 = (paramsø1 || 0)['id'];
            var metadataø1 = meta(idø1);
            var bindingø1 = analyzeSpecial(analyzeDeclaration, env, idø1);
            var initø1 = analyze(env, (paramsø1 || 0)['init']);
            var docø1 = (paramsø1 || 0)['doc'] || (metadataø1 || 0)['doc'];
            return {
                'op': 'def',
                'doc': docø1,
                'id': bindingø1,
                'init': initø1,
                'export': (env || 0)['top'] && !(metadataø1 || 0)['private'],
                'form': form
            };
        }.call(this);
    };
installSpecial('def', analyzeDef);
var analyzeDo = exports.analyzeDo = function analyzeDo(env, form) {
        return function () {
            var expressionsø1 = rest(form);
            var bodyø1 = analyzeBlock(env, expressionsø1);
            return conj(bodyø1, {
                'op': 'do',
                'form': form
            });
        }.call(this);
    };
installSpecial('do', analyzeDo);
var analyzeSymbol = exports.analyzeSymbol = function analyzeSymbol(env, form) {
        return function () {
            var formsø1 = split(name(form), '.');
            var metadataø1 = meta(form);
            var startø1 = (metadataø1 || 0)['start'];
            var endø1 = (metadataø1 || 0)['end'];
            var expansionø1 = count(formsø1) > 1 ? list(symbol(void 0, 'aget'), withMeta(symbol(first(formsø1)), conj(metadataø1, {
                    'start': startø1,
                    'end': {
                        'line': (endø1 || 0)['line'],
                        'column': 1 + (startø1 || 0)['column'] + count(first(formsø1))
                    }
                })), list(symbol(void 0, 'quote'), withMeta(symbol(join('.', rest(formsø1))), conj(metadataø1, {
                    'end': endø1,
                    'start': {
                        'line': (startø1 || 0)['line'],
                        'column': 1 + (startø1 || 0)['column'] + count(first(formsø1))
                    }
                })))) : void 0;
            return expansionø1 ? analyze(env, withMeta(expansionø1, meta(form))) : analyzeSpecial(analyzeIdentifier, env, form);
        }.call(this);
    };
var analyzeIdentifier = exports.analyzeIdentifier = function analyzeIdentifier(env, form) {
        return {
            'op': 'var',
            'type': 'identifier',
            'form': form,
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end'],
            'binding': resolveBinding(env, form)
        };
    };
var unresolvedBinding = exports.unresolvedBinding = function unresolvedBinding(env, form) {
        return {
            'op': 'unresolved-binding',
            'type': 'unresolved-binding',
            'identifier': {
                'type': 'identifier',
                'form': symbol(namespace(form), name(form))
            },
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end']
        };
    };
var resolveBinding = exports.resolveBinding = function resolveBinding(env, form) {
        return ((env || 0)['locals'] || 0)[name(form)] || ((env || 0)['enclosed'] || 0)[name(form)] || unresolvedBinding(env, form);
    };
var analyzeShadow = exports.analyzeShadow = function analyzeShadow(env, id) {
        return function () {
            var bindingø1 = resolveBinding(env, id);
            return {
                'depth': inc((bindingø1 || 0)['depth'] || 0),
                'shadow': bindingø1
            };
        }.call(this);
    };
var analyzeBinding = exports.analyzeBinding = function analyzeBinding(env, form) {
        return function () {
            var idø1 = first(form);
            var bodyø1 = second(form);
            return conj(analyzeShadow(env, idø1), {
                'op': 'binding',
                'type': 'binding',
                'id': idø1,
                'init': analyze(env, bodyø1),
                'form': form
            });
        }.call(this);
    };
var analyzeDeclaration = exports.analyzeDeclaration = function analyzeDeclaration(env, form) {
        !!(namespace(form) || 1 < count(split('.', '' + form))) ? (function () {
            throw Error('' + 'Assert failed: ' + '' + '(not (or (namespace form) (< 1 (count (split "." (str form))))))');
        })() : void 0;
        return conj(analyzeShadow(env, form), {
            'op': 'var',
            'type': 'identifier',
            'depth': 0,
            'id': form,
            'form': form
        });
    };
var analyzeParam = exports.analyzeParam = function analyzeParam(env, form) {
        return conj(analyzeShadow(env, form), {
            'op': 'param',
            'type': 'parameter',
            'id': form,
            'form': form,
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end']
        });
    };
var withBinding = exports.withBinding = function withBinding(env, form) {
        return conj(env, {
            'locals': assoc((env || 0)['locals'], name((form || 0)['id']), form),
            'bindings': conj((env || 0)['bindings'], form)
        });
    };
var withParam = exports.withParam = function withParam(env, form) {
        return conj(withBinding(env, form), { 'params': conj((env || 0)['params'], form) });
    };
var subEnv = exports.subEnv = function subEnv(env) {
        return {
            'enclosed': conj({}, (env || 0)['enclosed'], (env || 0)['locals']),
            'locals': {},
            'bindings': [],
            'params': (env || 0)['params'] || []
        };
    };
var analyzeLet_ = exports.analyzeLet_ = function analyzeLet_(env, form, isLoop) {
        return function () {
            var expressionsø1 = rest(form);
            var bindingsø1 = first(expressionsø1);
            var bodyø1 = rest(expressionsø1);
            var isValidBindingsø1 = isVector(bindingsø1) && isEven(count(bindingsø1));
            var _ø1 = !isValidBindingsø1 ? (function () {
                    throw Error('' + 'Assert failed: ' + 'bindings must be vector of even number of elements' + 'valid-bindings?');
                })() : void 0;
            var scopeø1 = reduce(function ($1, $2) {
                    return withBinding($1, analyzeBinding($1, $2));
                }, subEnv(env), partition(2, bindingsø1));
            var bindingsø2 = (scopeø1 || 0)['bindings'];
            var expressionsø2 = analyzeBlock(isLoop ? conj(scopeø1, { 'params': bindingsø2 }) : scopeø1, bodyø1);
            return {
                'op': 'let',
                'form': form,
                'start': (meta(form) || 0)['start'],
                'end': (meta(form) || 0)['end'],
                'bindings': bindingsø2,
                'statements': (expressionsø2 || 0)['statements'],
                'result': (expressionsø2 || 0)['result']
            };
        }.call(this);
    };
var analyzeLet = exports.analyzeLet = function analyzeLet(env, form) {
        return analyzeLet_(env, form, false);
    };
installSpecial('let', analyzeLet);
var analyzeLoop = exports.analyzeLoop = function analyzeLoop(env, form) {
        return conj(analyzeLet_(env, form, true), { 'op': 'loop' });
    };
installSpecial('loop', analyzeLoop);
var analyzeRecur = exports.analyzeRecur = function analyzeRecur(env, form) {
        return function () {
            var paramsø1 = (env || 0)['params'];
            var formsø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, rest(form)));
            return isEqual(count(paramsø1), count(formsø1)) ? {
                'op': 'recur',
                'form': form,
                'params': formsø1
            } : syntaxError('Recurs with wrong number of arguments', form);
        }.call(this);
    };
installSpecial('recur', analyzeRecur);
var analyzeQuotedList = exports.analyzeQuotedList = function analyzeQuotedList(form) {
        return {
            'op': 'list',
            'items': map(analyzeQuoted, vec(form)),
            'form': form,
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end']
        };
    };
var analyzeQuotedVector = exports.analyzeQuotedVector = function analyzeQuotedVector(form) {
        return {
            'op': 'vector',
            'items': map(analyzeQuoted, form),
            'form': form,
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end']
        };
    };
var analyzeQuotedDictionary = exports.analyzeQuotedDictionary = function analyzeQuotedDictionary(form) {
        return function () {
            var namesø1 = vec(map(analyzeQuoted, keys(form)));
            var valuesø1 = vec(map(analyzeQuoted, vals(form)));
            return {
                'op': 'dictionary',
                'form': form,
                'keys': namesø1,
                'values': valuesø1,
                'start': (meta(form) || 0)['start'],
                'end': (meta(form) || 0)['end']
            };
        }.call(this);
    };
var analyzeQuotedSymbol = exports.analyzeQuotedSymbol = function analyzeQuotedSymbol(form) {
        return {
            'op': 'symbol',
            'name': name(form),
            'namespace': namespace(form),
            'form': form
        };
    };
var analyzeQuotedKeyword = exports.analyzeQuotedKeyword = function analyzeQuotedKeyword(form) {
        return {
            'op': 'keyword',
            'name': name(form),
            'namespace': namespace(form),
            'form': form
        };
    };
var analyzeQuoted = exports.analyzeQuoted = function analyzeQuoted(form) {
        return isSymbol(form) ? analyzeQuotedSymbol(form) : isKeyword(form) ? analyzeQuotedKeyword(form) : isList(form) ? analyzeQuotedList(form) : isVector(form) ? analyzeQuotedVector(form) : isDictionary(form) ? analyzeQuotedDictionary(form) : 'else' ? {
            'op': 'constant',
            'form': form
        } : void 0;
    };
var analyzeQuote = exports.analyzeQuote = function analyzeQuote(env, form) {
        return analyzeQuoted(second(form));
    };
installSpecial('quote', analyzeQuote);
var analyzeStatement = exports.analyzeStatement = function analyzeStatement(env, form) {
        return function () {
            var statementsø1 = (env || 0)['statements'] || [];
            var bindingsø1 = (env || 0)['bindings'] || [];
            var statementø1 = analyze(conj(env, { 'statements': void 0 }), form);
            var opø1 = (statementø1 || 0)['op'];
            var defsø1 = isEqual(opø1, 'def') ? [(statementø1 || 0)['var']] : 'else' ? void 0 : void 0;
            return conj(env, {
                'statements': conj(statementsø1, statementø1),
                'bindings': concat(bindingsø1, defsø1)
            });
        }.call(this);
    };
var analyzeBlock = exports.analyzeBlock = function analyzeBlock(env, form) {
        return function () {
            var bodyø1 = count(form) > 1 ? reduce(analyzeStatement, env, butlast(form)) : void 0;
            var resultø1 = analyze(bodyø1 || env, last(form));
            return {
                'statements': (bodyø1 || 0)['statements'],
                'result': resultø1
            };
        }.call(this);
    };
var analyzeFnMethod = exports.analyzeFnMethod = function analyzeFnMethod(env, form) {
        return function () {
            var signatureø1 = isList(form) && isVector(first(form)) ? first(form) : syntaxError('Malformed fn overload form', form);
            var bodyø1 = rest(form);
            var variadicø1 = some(function ($1) {
                    return isEqual(symbol(void 0, '&'), $1);
                }, signatureø1);
            var paramsø1 = variadicø1 ? filter(function ($1) {
                    return !isEqual(symbol(void 0, '&'), $1);
                }, signatureø1) : signatureø1;
            var arityø1 = variadicø1 ? dec(count(paramsø1)) : count(paramsø1);
            var scopeø1 = reduce(function ($1, $2) {
                    return withParam($1, analyzeParam($1, $2));
                }, conj(env, { 'params': [] }), paramsø1);
            return conj(analyzeBlock(scopeø1, bodyø1), {
                'op': 'overload',
                'variadic': variadicø1,
                'arity': arityø1,
                'params': (scopeø1 || 0)['params'],
                'form': form
            });
        }.call(this);
    };
var analyzeFn = exports.analyzeFn = function analyzeFn(env, form) {
        return function () {
            var formsø1 = rest(form);
            var formsø2 = isSymbol(first(formsø1)) ? formsø1 : cons(void 0, formsø1);
            var idø1 = first(formsø2);
            var bindingø1 = idø1 ? analyzeSpecial(analyzeDeclaration, env, idø1) : void 0;
            var bodyø1 = rest(formsø2);
            var overloadsø1 = isVector(first(bodyø1)) ? list(bodyø1) : isList(first(bodyø1)) && isVector(first(first(bodyø1))) ? bodyø1 : 'else' ? syntaxError('' + 'Malformed fn expression, ' + 'parameter declaration (' + prStr(first(bodyø1)) + ') must be a vector', form) : void 0;
            var scopeø1 = bindingø1 ? withBinding(subEnv(env), bindingø1) : subEnv(env);
            var methodsø1 = map(function ($1) {
                    return analyzeFnMethod(scopeø1, $1);
                }, vec(overloadsø1));
            var arityø1 = max.apply(void 0, map(function ($1) {
                    return ($1 || 0)['arity'];
                }, methodsø1));
            var variadicø1 = some(function ($1) {
                    return ($1 || 0)['variadic'];
                }, methodsø1);
            return {
                'op': 'fn',
                'type': 'function',
                'id': bindingø1,
                'variadic': variadicø1,
                'methods': methodsø1,
                'form': form
            };
        }.call(this);
    };
installSpecial('fn', analyzeFn);
var parseReferences = exports.parseReferences = function parseReferences(forms) {
        return reduce(function (references, form) {
            return isSeq(form) ? assoc(references, name(first(form)), vec(rest(form))) : references;
        }, {}, forms);
    };
var parseRequire = exports.parseRequire = function parseRequire(form) {
        return function () {
            var requirementø1 = isSymbol(form) ? [form] : vec(form);
            var idø1 = first(requirementø1);
            var paramsø1 = dictionary.apply(void 0, rest(requirementø1));
            var renamesø1 = (paramsø1 || 0)['\uA789rename'];
            var namesø1 = (paramsø1 || 0)['\uA789refer'];
            var aliasø1 = (paramsø1 || 0)['\uA789as'];
            var referencesø1 = !isEmpty(namesø1) ? reduce(function (refers, reference) {
                    return conj(refers, {
                        'op': 'refer',
                        'form': reference,
                        'name': reference,
                        'rename': (renamesø1 || 0)[reference] || (renamesø1 || 0)[name(reference)],
                        'ns': idø1
                    });
                }, [], namesø1) : void 0;
            return {
                'op': 'require',
                'alias': aliasø1,
                'ns': idø1,
                'refer': referencesø1,
                'form': form
            };
        }.call(this);
    };
var analyzeNs = exports.analyzeNs = function analyzeNs(env, form) {
        return function () {
            var formsø1 = rest(form);
            var nameø1 = first(formsø1);
            var bodyø1 = rest(formsø1);
            var docø1 = isString(first(bodyø1)) ? first(bodyø1) : void 0;
            var referencesø1 = parseReferences(docø1 ? rest(bodyø1) : bodyø1);
            var requirementsø1 = (referencesø1 || 0)['require'] ? map(parseRequire, (referencesø1 || 0)['require']) : void 0;
            return {
                'op': 'ns',
                'name': nameø1,
                'doc': docø1,
                'require': requirementsø1 ? vec(requirementsø1) : void 0,
                'form': form
            };
        }.call(this);
    };
installSpecial('ns', analyzeNs);
var analyzeList = exports.analyzeList = function analyzeList(env, form) {
        return function () {
            var expansionø1 = macroexpand(form, env);
            var operatorø1 = first(form);
            var analyzerø1 = isSymbol(operatorø1) && (__specials__ || 0)[name(operatorø1)];
            return !(expansionø1 === form) ? analyze(env, expansionø1) : analyzerø1 ? analyzeSpecial(analyzerø1, env, expansionø1) : 'else' ? analyzeInvoke(env, expansionø1) : void 0;
        }.call(this);
    };
var analyzeVector = exports.analyzeVector = function analyzeVector(env, form) {
        return function () {
            var itemsø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, form));
            return {
                'op': 'vector',
                'form': form,
                'items': itemsø1
            };
        }.call(this);
    };
var analyzeDictionary = exports.analyzeDictionary = function analyzeDictionary(env, form) {
        return function () {
            var namesø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, keys(form)));
            var valuesø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, vals(form)));
            return {
                'op': 'dictionary',
                'keys': namesø1,
                'values': valuesø1,
                'form': form
            };
        }.call(this);
    };
var analyzeInvoke = exports.analyzeInvoke = function analyzeInvoke(env, form) {
        return function () {
            var calleeø1 = analyze(env, first(form));
            var paramsø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, rest(form)));
            return {
                'op': 'invoke',
                'callee': calleeø1,
                'params': paramsø1,
                'form': form
            };
        }.call(this);
    };
var analyzeConstant = exports.analyzeConstant = function analyzeConstant(env, form) {
        return {
            'op': 'constant',
            'form': form
        };
    };
var analyze = exports.analyze = function analyze() {
        switch (arguments.length) {
        case 1:
            var form = arguments[0];
            return analyze({
                'locals': {},
                'bindings': [],
                'top': true
            }, form);
        case 2:
            var env = arguments[0];
            var form = arguments[1];
            return isNil(form) ? analyzeConstant(env, form) : isSymbol(form) ? analyzeSymbol(env, form) : isList(form) ? isEmpty(form) ? analyzeQuoted(form) : analyzeList(env, form) : isDictionary(form) ? analyzeDictionary(env, form) : isVector(form) ? analyzeVector(env, form) : isKeyword(form) ? analyzeKeyword(env, form) : 'else' ? analyzeConstant(env, form) : void 0;
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };


},{"./ast":"wisp/ast","./expander":"wisp/expander","./runtime":"wisp/runtime","./sequence":"wisp/sequence","./string":"wisp/string"}],"wisp/ast":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.ast',
            doc: void 0
        };
    var wisp_sequence = require('./sequence');
    var isList = wisp_sequence.isList;
    var isSequential = wisp_sequence.isSequential;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var count = wisp_sequence.count;
    var last = wisp_sequence.last;
    var map = wisp_sequence.map;
    var vec = wisp_sequence.vec;
    var repeat = wisp_sequence.repeat;
    var wisp_string = require('./string');
    var split = wisp_string.split;
    var join = wisp_string.join;
    var wisp_runtime = require('./runtime');
    var isNil = wisp_runtime.isNil;
    var isVector = wisp_runtime.isVector;
    var isNumber = wisp_runtime.isNumber;
    var isString = wisp_runtime.isString;
    var isBoolean = wisp_runtime.isBoolean;
    var isObject = wisp_runtime.isObject;
    var isDate = wisp_runtime.isDate;
    var isRePattern = wisp_runtime.isRePattern;
    var isDictionary = wisp_runtime.isDictionary;
    var str = wisp_runtime.str;
    var inc = wisp_runtime.inc;
    var subs = wisp_runtime.subs;
    var isEqual = wisp_runtime.isEqual;
}
var withMeta = exports.withMeta = function withMeta(value, metadata) {
        Object.defineProperty(value, 'metadata', {
            'value': metadata,
            'configurable': true
        });
        return value;
    };
var meta = exports.meta = function meta(value) {
        return isNil(value) ? void 0 : value.metadata;
    };
var __nsSeparator__ = exports.__nsSeparator__ = '\u2044';
var Symbol = function Symbol(namespace, name) {
    this.namespace = namespace;
    this.name = name;
    return this;
};
Symbol.type = 'wisp.symbol';
Symbol.prototype.type = Symbol.type;
Symbol.prototype.toString = function () {
    return function () {
        var prefixø1 = '' + '\uFEFF' + '\'';
        var nsø1 = namespace(this);
        return nsø1 ? '' + prefixø1 + nsø1 + '/' + name(this) : '' + prefixø1 + name(this);
    }.call(this);
};
var symbol = exports.symbol = function symbol(ns, id) {
        return isSymbol(ns) ? ns : isKeyword(ns) ? new Symbol(namespace(ns), name(ns)) : isNil(id) ? new Symbol(void 0, ns) : 'else' ? new Symbol(ns, id) : void 0;
    };
var isSymbol = exports.isSymbol = function isSymbol(x) {
        return isString(x) && '\uFEFF' === x[0] && '\'' === x[1] || x && Symbol.type === x.type;
    };
var isKeyword = exports.isKeyword = function isKeyword(x) {
        return isString(x) && count(x) > 1 && first(x) === '\uA789';
    };
var keyword = exports.keyword = function keyword(ns, id) {
        return isKeyword(ns) ? ns : isSymbol(ns) ? '' + '\uA789' + name(ns) : isNil(id) ? '' + '\uA789' + ns : isNil(ns) ? '' + '\uA789' + id : 'else' ? '' + '\uA789' + ns + __nsSeparator__ + id : void 0;
    };
var keywordName = function keywordName(value) {
    return last(split(subs(value, 1), __nsSeparator__));
};
var symbolName = function symbolName(value) {
    return value.name || last(split(subs(value, 2), __nsSeparator__));
};
var name = exports.name = function name(value) {
        return isSymbol(value) ? symbolName(value) : isKeyword(value) ? keywordName(value) : isString(value) ? value : 'else' ? (function () {
            throw new TypeError('' + 'Doesn\'t support name: ' + value);
        })() : void 0;
    };
var keywordNamespace = function keywordNamespace(x) {
    return function () {
        var partsø1 = split(subs(x, 1), __nsSeparator__);
        return count(partsø1) > 1 ? partsø1[0] : void 0;
    }.call(this);
};
var symbolNamespace = function symbolNamespace(x) {
    return function () {
        var partsø1 = isString(x) ? split(subs(x, 1), __nsSeparator__) : [
                x.namespace,
                x.name
            ];
        return count(partsø1) > 1 ? partsø1[0] : void 0;
    }.call(this);
};
var namespace = exports.namespace = function namespace(x) {
        return isSymbol(x) ? symbolNamespace(x) : isKeyword(x) ? keywordNamespace(x) : 'else' ? (function () {
            throw new TypeError('' + 'Doesn\'t supports namespace: ' + x);
        })() : void 0;
    };
var gensym = exports.gensym = function gensym(prefix) {
        return symbol('' + (isNil(prefix) ? 'G__' : prefix) + (gensym.base = gensym.base + 1));
    };
gensym.base = 0;
var isUnquote = exports.isUnquote = function isUnquote(form) {
        return isList(form) && isEqual(first(form), symbol(void 0, 'unquote'));
    };
var isUnquoteSplicing = exports.isUnquoteSplicing = function isUnquoteSplicing(form) {
        return isList(form) && isEqual(first(form), symbol(void 0, 'unquote-splicing'));
    };
var isQuote = exports.isQuote = function isQuote(form) {
        return isList(form) && isEqual(first(form), symbol(void 0, 'quote'));
    };
var isSyntaxQuote = exports.isSyntaxQuote = function isSyntaxQuote(form) {
        return isList(form) && isEqual(first(form), symbol(void 0, 'syntax-quote'));
    };
var normalize = function normalize(n, len) {
    return function loop() {
        var recur = loop;
        var nsø1 = '' + n;
        do {
            recur = count(nsø1) < len ? (loop[0] = '' + '0' + nsø1, loop) : nsø1;
        } while (nsø1 = loop[0], recur === loop);
        return recur;
    }.call(this);
};
var quoteString = exports.quoteString = function quoteString(s) {
        s = join('\\"', split(s, '"'));
        s = join('\\\\', split(s, '\\'));
        s = join('\\b', split(s, '\b'));
        s = join('\\f', split(s, '\f'));
        s = join('\\n', split(s, '\n'));
        s = join('\\r', split(s, '\r'));
        s = join('\\t', split(s, '\t'));
        return '' + '"' + s + '"';
    };
var prStr = exports.prStr = function prStr(x, offset) {
        return function () {
            var offsetø2 = offset || 0;
            return isNil(x) ? 'nil' : isKeyword(x) ? namespace(x) ? '' + ':' + namespace(x) + '/' + name(x) : '' + ':' + name(x) : isSymbol(x) ? namespace(x) ? '' + namespace(x) + '/' + name(x) : name(x) : isString(x) ? quoteString(x) : isDate(x) ? '' + '#inst "' + x.getUTCFullYear() + '-' + normalize(inc(x.getUTCMonth()), 2) + '-' + normalize(x.getUTCDate(), 2) + 'T' + normalize(x.getUTCHours(), 2) + ':' + normalize(x.getUTCMinutes(), 2) + ':' + normalize(x.getUTCSeconds(), 2) + '.' + normalize(x.getUTCMilliseconds(), 3) + '-' + '00:00"' : isVector(x) ? '' + '[' + join('' + '\n ' + join(repeat(inc(offsetø2), ' ')), map(function ($1) {
                return prStr($1, inc(offsetø2));
            }, vec(x))) + ']' : isDictionary(x) ? '' + '{' + join('' + ',\n' + join(repeat(inc(offsetø2), ' ')), map(function (pair) {
                return function () {
                    var indentø1 = join(repeat(offsetø2, ' '));
                    var keyø1 = prStr(first(pair), inc(offsetø2));
                    var valueø1 = prStr(second(pair), 2 + offsetø2 + count(keyø1));
                    return '' + keyø1 + ' ' + valueø1;
                }.call(this);
            }, x)) + '}' : isSequential(x) ? '' + '(' + join(' ', map(function ($1) {
                return prStr($1, inc(offsetø2));
            }, vec(x))) + ')' : isRePattern(x) ? '' + '#"' + join('\\/', split(x.source, '/')) + '"' : 'else' ? '' + x : void 0;
        }.call(this);
    };


},{"./runtime":"wisp/runtime","./sequence":"wisp/sequence","./string":"wisp/string"}],"wisp/backend/javascript/writer":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.backend.javascript.writer',
            doc: 'Compiler backend for for writing JS output'
        };
    var wisp_ast = require('./../../ast');
    var name = wisp_ast.name;
    var namespace = wisp_ast.namespace;
    var symbol = wisp_ast.symbol;
    var isSymbol = wisp_ast.isSymbol;
    var isKeyword = wisp_ast.isKeyword;
    var wisp_sequence = require('./../../sequence');
    var list = wisp_sequence.list;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var isList = wisp_sequence.isList;
    var vec = wisp_sequence.vec;
    var map = wisp_sequence.map;
    var count = wisp_sequence.count;
    var last = wisp_sequence.last;
    var reduce = wisp_sequence.reduce;
    var isEmpty = wisp_sequence.isEmpty;
    var wisp_runtime = require('./../../runtime');
    var isTrue = wisp_runtime.isTrue;
    var isNil = wisp_runtime.isNil;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isVector = wisp_runtime.isVector;
    var isDictionary = wisp_runtime.isDictionary;
    var isBoolean = wisp_runtime.isBoolean;
    var isRePattern = wisp_runtime.isRePattern;
    var reFind = wisp_runtime.reFind;
    var dec = wisp_runtime.dec;
    var subs = wisp_runtime.subs;
    var isEqual = wisp_runtime.isEqual;
    var wisp_string = require('./../../string');
    var replace = wisp_string.replace;
    var join = wisp_string.join;
    var split = wisp_string.split;
    var upperCase = wisp_string.upperCase;
}
var writeReference = exports.writeReference = function writeReference(form) {
        'Translates references from clojure convention to JS:\n\n  **macros**      __macros__\n  list->vector    listToVector\n  set!            set\n  foo_bar         foo_bar\n  number?         isNumber\n  create-server   createServer';
        return function () {
            var idø1 = name(form);
            idø1 = idø1 === '*' ? 'multiply' : idø1 === '/' ? 'divide' : idø1 === '+' ? 'sum' : idø1 === '-' ? 'subtract' : idø1 === '=' ? 'equal?' : idø1 === '==' ? 'strict-equal?' : idø1 === '<=' ? 'not-greater-than' : idø1 === '>=' ? 'not-less-than' : idø1 === '>' ? 'greater-than' : idø1 === '<' ? 'less-than' : idø1 === '->' ? 'thread-first' : 'else' ? idø1 : void 0;
            idø1 = join('_', split(idø1, '*'));
            idø1 = join('-to-', split(idø1, '->'));
            idø1 = join(split(idø1, '!'));
            idø1 = join('$', split(idø1, '%'));
            idø1 = join('-plus-', split(idø1, '+'));
            idø1 = join('-and-', split(idø1, '&'));
            idø1 = last(idø1) === '?' ? '' + 'is-' + subs(idø1, 0, dec(count(idø1))) : idø1;
            idø1 = reduce(function (result, key) {
                return '' + result + (!isEmpty(result) && !isEmpty(key) ? '' + upperCase((key || 0)[0]) + subs(key, 1) : key);
            }, '', split(idø1, '-'));
            return idø1;
        }.call(this);
    };
var writeKeywordReference = exports.writeKeywordReference = function writeKeywordReference(form) {
        return '' + '"' + name(form) + '"';
    };
var writeKeyword = exports.writeKeyword = function writeKeyword(form) {
        return '' + '"' + '\uA789' + name(form) + '"';
    };
var writeSymbol = exports.writeSymbol = function writeSymbol(form) {
        return write(list(symbol(void 0, 'symbol'), namespace(form), name(form)));
    };
var writeNil = exports.writeNil = function writeNil(form) {
        return 'void(0)';
    };
var writeNumber = exports.writeNumber = function writeNumber(form) {
        return form;
    };
var writeBoolean = exports.writeBoolean = function writeBoolean(form) {
        return isTrue(form) ? 'true' : 'false';
    };
var writeString = exports.writeString = function writeString(form) {
        form = replace(form, RegExp('\\\\', 'g'), '\\\\');
        form = replace(form, RegExp('\n', 'g'), '\\n');
        form = replace(form, RegExp('\r', 'g'), '\\r');
        form = replace(form, RegExp('\t', 'g'), '\\t');
        form = replace(form, RegExp('"', 'g'), '\\"');
        return '' + '"' + form + '"';
    };
var writeTemplate = exports.writeTemplate = function writeTemplate() {
        var form = Array.prototype.slice.call(arguments, 0);
        return function () {
            var indentPatternø1 = /\n *$/;
            var lineBreakPatterø1 = RegExp('\n', 'g');
            var getIndentationø1 = function (code) {
                return reFind(indentPatternø1, code) || '\n';
            };
            return function loop() {
                var recur = loop;
                var codeø1 = '';
                var partsø1 = split(first(form), '~{}');
                var valuesø1 = rest(form);
                do {
                    recur = count(partsø1) > 1 ? (loop[0] = '' + codeø1 + first(partsø1) + replace('' + '' + first(valuesø1), lineBreakPatterø1, getIndentationø1(first(partsø1))), loop[1] = rest(partsø1), loop[2] = rest(valuesø1), loop) : '' + codeø1 + first(partsø1);
                } while (codeø1 = loop[0], partsø1 = loop[1], valuesø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }.call(this);
    };
var writeGroup = exports.writeGroup = function writeGroup() {
        var forms = Array.prototype.slice.call(arguments, 0);
        return join(', ', forms);
    };
var writeInvoke = exports.writeInvoke = function writeInvoke(callee) {
        var params = Array.prototype.slice.call(arguments, 1);
        return writeTemplate('~{}(~{})', callee, writeGroup.apply(void 0, params));
    };
var writeError = exports.writeError = function writeError(message) {
        return function () {
            return (function () {
                throw Error(message);
            })();
        };
    };
var writeVector = exports.writeVector = writeError('Vectors are not supported');
var writeDictionary = exports.writeDictionary = writeError('Dictionaries are not supported');
var escapePattern = function escapePattern(pattern) {
    pattern = join('/', split(pattern, '\\/'));
    pattern = join('\\/', split(pattern, '/'));
    return pattern;
};
var writeRePattern = exports.writeRePattern = function writeRePattern(form) {
        return function () {
            var flagsø1 = '' + (form.multiline ? 'm' : '') + (form.ignoreCase ? 'i' : '') + (form.sticky ? 'y' : '');
            var patternø1 = form.source;
            return '' + '/' + escapePattern(patternø1) + '/' + flagsø1;
        }.call(this);
    };
var compileComment = exports.compileComment = function compileComment(form) {
        return compileTemplate(list('//~{}\n', first(form)));
    };
var writeDef = exports.writeDef = function writeDef(form) {
        return function () {
            var idø1 = first(form);
            var isExportø1 = (meta(form) || {} || 0)['top'] && !(meta(idø1) || {} || 0)['private'];
            var attributeø1 = symbol(namespace(idø1), '' + '-' + name(idø1));
            return isExportø1 ? compileTemplate(list('var ~{};\n~{}', compile(cons(symbol(void 0, 'set!'), form)), compile(list.apply(void 0, [symbol(void 0, 'set!')].concat([list.apply(void 0, [symbol(void 0, '.')].concat([symbol(void 0, 'exports')], [attributeø1]))], [idø1]))))) : compileTemplate(list('var ~{}', compile(cons(symbol(void 0, 'set!'), form))));
        }.call(this);
    };
var isWriteInstance = exports.isWriteInstance = function isWriteInstance(form) {
        return writeTemplate('~{} instanceof ~{}', write(second(form)), write(first(form)));
    };
var write = exports.write = function write(form) {
        return isNil(form) ? writeNil(form) : isSymbol(form) ? writeReference(form) : isKeyword(form) ? writeKeywordReference(form) : isString(form) ? writeString(form) : isNumber(form) ? writeNumber(form) : isBoolean(form) ? writeBoolean(form) : isRePattern(form) ? writePattern(form) : isVector(form) ? writeVector(form) : isDictionary(form) ? writeDictionary() : isList(form) ? writeInvoke.apply(void 0, map(write, vec(form))) : 'else' ? writeError('Unsupported form') : void 0;
    };


},{"./../../ast":"wisp/ast","./../../runtime":"wisp/runtime","./../../sequence":"wisp/sequence","./../../string":"wisp/string"}],"wisp/compiler":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.compiler',
            doc: void 0
        };
    var wisp_analyzer = require('./analyzer');
    var analyze = wisp_analyzer.analyze;
    var wisp_reader = require('./reader');
    var read_ = wisp_reader.read_;
    var read = wisp_reader.read;
    var pushBackReader = wisp_reader.pushBackReader;
    var wisp_string = require('./string');
    var replace = wisp_string.replace;
    var wisp_sequence = require('./sequence');
    var map = wisp_sequence.map;
    var reduce = wisp_sequence.reduce;
    var conj = wisp_sequence.conj;
    var cons = wisp_sequence.cons;
    var vec = wisp_sequence.vec;
    var first = wisp_sequence.first;
    var rest = wisp_sequence.rest;
    var isEmpty = wisp_sequence.isEmpty;
    var count = wisp_sequence.count;
    var wisp_runtime = require('./runtime');
    var isError = wisp_runtime.isError;
    var isEqual = wisp_runtime.isEqual;
    var wisp_ast = require('./ast');
    var name = wisp_ast.name;
    var symbol = wisp_ast.symbol;
    var prStr = wisp_ast.prStr;
    var wisp_backend_escodegen_generator = require('./backend/escodegen/generator');
    var generateJs = wisp_backend_escodegen_generator.generate;
    var base64Encode = require('base64-encode');
    var btoa = base64Encode;
}
var generate = exports.generate = generateJs;
var readForm = exports.readForm = function readForm(reader, eof) {
        return (function () {
            try {
                return read(reader, false, eof, false);
            } catch (error) {
                return error;
            }
        })();
    };
var readForms = exports.readForms = function readForms(source, uri) {
        return function () {
            var readerø1 = pushBackReader(source, uri);
            var eofø1 = {};
            return function loop() {
                var recur = loop;
                var formsø1 = [];
                var formø1 = readForm(readerø1, eofø1);
                do {
                    recur = isError(formø1) ? {
                        'forms': formsø1,
                        'error': formø1
                    } : formø1 === eofø1 ? { 'forms': formsø1 } : 'else' ? (loop[0] = conj(formsø1, formø1), loop[1] = readForm(readerø1, eofø1), loop) : void 0;
                } while (formsø1 = loop[0], formø1 = loop[1], recur === loop);
                return recur;
            }.call(this);
        }.call(this);
    };
var analyzeForm = exports.analyzeForm = function analyzeForm(env, form) {
        return (function () {
            try {
                return analyze(env, form);
            } catch (error) {
                return error;
            }
        })();
    };
var analyzeForms = exports.analyzeForms = function analyzeForms(forms) {
        return function loop() {
            var recur = loop;
            var nodesø1 = [];
            var formsø2 = forms;
            var envø1 = {
                    'locals': {},
                    'bindings': [],
                    'top': true,
                    'ns': { 'name': symbol(void 0, 'user.wisp') }
                };
            do {
                recur = function () {
                    var nodeø1 = analyzeForm(envø1, first(formsø2));
                    var nsø1 = isEqual((nodeø1 || 0)['op'], 'ns') ? nodeø1 : (envø1 || 0)['ns'];
                    return isError(nodeø1) ? {
                        'ast': nodesø1,
                        'error': nodeø1
                    } : count(formsø2) <= 1 ? { 'ast': conj(nodesø1, nodeø1) } : 'else' ? (loop[0] = conj(nodesø1, nodeø1), loop[1] = rest(formsø2), loop[2] = conj(envø1, { 'ns': nsø1 }), loop) : void 0;
                }.call(this);
            } while (nodesø1 = loop[0], formsø2 = loop[1], envø1 = loop[2], recur === loop);
            return recur;
        }.call(this);
    };
var compile = exports.compile = function compile() {
        switch (arguments.length) {
        case 1:
            var source = arguments[0];
            return compile(source, {});
        case 2:
            var source = arguments[0];
            var options = arguments[1];
            return function () {
                var sourceUriø1 = (options || 0)['source-uri'] || name('anonymous.wisp');
                var formsø1 = readForms(source, sourceUriø1);
                var astø1 = (formsø1 || 0)['error'] ? formsø1 : analyzeForms((formsø1 || 0)['forms']);
                var outputø1 = (astø1 || 0)['error'] ? astø1 : (function () {
                        try {
                            return generate.apply(void 0, vec(cons(conj(options, {
                                'source': source,
                                'source-uri': sourceUriø1
                            }), (astø1 || 0)['ast'])));
                        } catch (error) {
                            return { 'error': error };
                        }
                    })();
                var expansionø1 = 'expansion' === (options || 0)['print'] ? reduce(function (result, item) {
                        return '' + result + prStr(item.form) + '\n';
                    }, '', astø1.ast) : void 0;
                var resultø1 = {
                        'source-uri': sourceUriø1,
                        'ast': (astø1 || 0)['ast'],
                        'forms': (formsø1 || 0)['forms'],
                        'expansion': expansionø1
                    };
                return conj(options, outputø1, resultø1);
            }.call(this);
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
var evaluate = exports.evaluate = function evaluate(source) {
        return function () {
            var outputø1 = compile(source);
            return (outputø1 || 0)['error'] ? (function () {
                throw (outputø1 || 0)['error'];
            })() : eval((outputø1 || 0)['code']);
        }.call(this);
    };


},{"./analyzer":"wisp/analyzer","./ast":"wisp/ast","./backend/escodegen/generator":1,"./reader":"wisp/reader","./runtime":"wisp/runtime","./sequence":"wisp/sequence","./string":"wisp/string","base64-encode":5}],"wisp/expander":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.expander',
            doc: 'wisp syntax and macro expander module'
        };
    var wisp_ast = require('./ast');
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var isSymbol = wisp_ast.isSymbol;
    var isKeyword = wisp_ast.isKeyword;
    var isQuote = wisp_ast.isQuote;
    var symbol = wisp_ast.symbol;
    var namespace = wisp_ast.namespace;
    var name = wisp_ast.name;
    var isUnquote = wisp_ast.isUnquote;
    var isUnquoteSplicing = wisp_ast.isUnquoteSplicing;
    var wisp_sequence = require('./sequence');
    var isList = wisp_sequence.isList;
    var list = wisp_sequence.list;
    var conj = wisp_sequence.conj;
    var partition = wisp_sequence.partition;
    var seq = wisp_sequence.seq;
    var isEmpty = wisp_sequence.isEmpty;
    var map = wisp_sequence.map;
    var vec = wisp_sequence.vec;
    var isEvery = wisp_sequence.isEvery;
    var concat = wisp_sequence.concat;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var last = wisp_sequence.last;
    var butlast = wisp_sequence.butlast;
    var interleave = wisp_sequence.interleave;
    var cons = wisp_sequence.cons;
    var count = wisp_sequence.count;
    var some = wisp_sequence.some;
    var assoc = wisp_sequence.assoc;
    var reduce = wisp_sequence.reduce;
    var filter = wisp_sequence.filter;
    var isSeq = wisp_sequence.isSeq;
    var lazySeq = wisp_sequence.lazySeq;
    var wisp_runtime = require('./runtime');
    var isNil = wisp_runtime.isNil;
    var isDictionary = wisp_runtime.isDictionary;
    var isVector = wisp_runtime.isVector;
    var keys = wisp_runtime.keys;
    var vals = wisp_runtime.vals;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isBoolean = wisp_runtime.isBoolean;
    var isDate = wisp_runtime.isDate;
    var isRePattern = wisp_runtime.isRePattern;
    var isEven = wisp_runtime.isEven;
    var isEqual = wisp_runtime.isEqual;
    var max = wisp_runtime.max;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var dictionary = wisp_runtime.dictionary;
    var subs = wisp_runtime.subs;
    var wisp_string = require('./string');
    var split = wisp_string.split;
}
var __macros__ = exports.__macros__ = {};
var expand = function expand(expander, form, env) {
    return function () {
        var metadataø1 = meta(form) || {};
        var parmasø1 = rest(form);
        var implicitø1 = map(function ($1) {
                return isEqual('&form', $1) ? form : isEqual('&env', $1) ? env : 'else' ? $1 : void 0;
            }, (meta(expander) || 0)['implicit'] || []);
        var paramsø1 = vec(concat(implicitø1, vec(rest(form))));
        var expansionø1 = expander.apply(void 0, paramsø1);
        return expansionø1 ? withMeta(expansionø1, conj(metadataø1, meta(expansionø1))) : expansionø1;
    }.call(this);
};
var installMacro = exports.installMacro = function installMacro(op, expander) {
        return (__macros__ || 0)[name(op)] = expander;
    };
var macro = function macro(op) {
    return isSymbol(op) && (__macros__ || 0)[name(op)];
};
var isMethodSyntax = exports.isMethodSyntax = function isMethodSyntax(op) {
        return function () {
            var idø1 = isSymbol(op) && name(op);
            return idø1 && '.' === first(idø1) && !('-' === second(idø1)) && !('.' === idø1);
        }.call(this);
    };
var isFieldSyntax = exports.isFieldSyntax = function isFieldSyntax(op) {
        return function () {
            var idø1 = isSymbol(op) && name(op);
            return idø1 && '.' === first(idø1) && '-' === second(idø1);
        }.call(this);
    };
var isNewSyntax = exports.isNewSyntax = function isNewSyntax(op) {
        return function () {
            var idø1 = isSymbol(op) && name(op);
            return idø1 && '.' === last(idø1) && !('.' === idø1);
        }.call(this);
    };
var methodSyntax = exports.methodSyntax = function methodSyntax(op, target) {
        var params = Array.prototype.slice.call(arguments, 2);
        return function () {
            var opMetaø1 = meta(op);
            var formStartø1 = (opMetaø1 || 0)['start'];
            var targetMetaø1 = meta(target);
            var memberø1 = withMeta(symbol(subs(name(op), 1)), conj(opMetaø1, {
                    'start': {
                        'line': (formStartø1 || 0)['line'],
                        'column': inc((formStartø1 || 0)['column'])
                    }
                }));
            var agetø1 = withMeta(symbol(void 0, 'aget'), conj(opMetaø1, {
                    'end': {
                        'line': (formStartø1 || 0)['line'],
                        'column': inc((formStartø1 || 0)['column'])
                    }
                }));
            var methodø1 = withMeta(list.apply(void 0, [agetø1].concat([target], [list.apply(void 0, [symbol(void 0, 'quote')].concat([memberø1]))])), conj(opMetaø1, { 'end': (meta(target) || 0)['end'] }));
            return isNil(target) ? (function () {
                throw Error('Malformed method expression, expecting (.method object ...)');
            })() : list.apply(void 0, [methodø1].concat(vec(params)));
        }.call(this);
    };
var fieldSyntax = exports.fieldSyntax = function fieldSyntax(field, target) {
        var more = Array.prototype.slice.call(arguments, 2);
        return function () {
            var metadataø1 = meta(field);
            var startø1 = (metadataø1 || 0)['start'];
            var endø1 = (metadataø1 || 0)['end'];
            var memberø1 = withMeta(symbol(subs(name(field), 2)), conj(metadataø1, {
                    'start': {
                        'line': (startø1 || 0)['line'],
                        'column': (startø1 || 0)['column'] + 2
                    }
                }));
            return isNil(target) || count(more) ? (function () {
                throw Error('Malformed member expression, expecting (.-member target)');
            })() : list.apply(void 0, [symbol(void 0, 'aget')].concat([target], [list.apply(void 0, [symbol(void 0, 'quote')].concat([memberø1]))]));
        }.call(this);
    };
var newSyntax = exports.newSyntax = function newSyntax(op) {
        var params = Array.prototype.slice.call(arguments, 1);
        return function () {
            var idø1 = name(op);
            var idMetaø1 = (idø1 || 0)['meta'];
            var renameø1 = subs(idø1, 0, dec(count(idø1)));
            var constructorø1 = withMeta(symbol(renameø1), conj(idMetaø1, {
                    'end': {
                        'line': ((idMetaø1 || 0)['end'] || 0)['line'],
                        'column': dec(((idMetaø1 || 0)['end'] || 0)['column'])
                    }
                }));
            var operatorø1 = withMeta(symbol(void 0, 'new'), conj(idMetaø1, {
                    'start': {
                        'line': ((idMetaø1 || 0)['end'] || 0)['line'],
                        'column': dec(((idMetaø1 || 0)['end'] || 0)['column'])
                    }
                }));
            return list.apply(void 0, [symbol(void 0, 'new')].concat([constructorø1], vec(params)));
        }.call(this);
    };
var keywordInvoke = exports.keywordInvoke = function keywordInvoke(keyword, target) {
        return list.apply(void 0, [symbol(void 0, 'get')].concat([target], [keyword]));
    };
var desugar = function desugar(expander, form) {
    return function () {
        var desugaredø1 = expander.apply(void 0, vec(form));
        var metadataø1 = conj({}, meta(form), meta(desugaredø1));
        return withMeta(desugaredø1, metadataø1);
    }.call(this);
};
var macroexpand1 = exports.macroexpand1 = function macroexpand1(form, env) {
        return function () {
            var opø1 = isList(form) && first(form);
            var expanderø1 = macro(opø1);
            return expanderø1 ? expand(expanderø1, form, env) : isKeyword(opø1) ? desugar(keywordInvoke, form) : isFieldSyntax(opø1) ? desugar(fieldSyntax, form) : isMethodSyntax(opø1) ? desugar(methodSyntax, form) : isNewSyntax(opø1) ? desugar(newSyntax, form) : 'else' ? form : void 0;
        }.call(this);
    };
var macroexpand = exports.macroexpand = function macroexpand(form, env) {
        return function loop() {
            var recur = loop;
            var originalø1 = form;
            var expandedø1 = macroexpand1(form, env);
            do {
                recur = originalø1 === expandedø1 ? originalø1 : (loop[0] = expandedø1, loop[1] = macroexpand1(expandedø1, env), loop);
            } while (originalø1 = loop[0], expandedø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var syntaxQuote = exports.syntaxQuote = function syntaxQuote(form) {
        return isSymbol(form) ? list(symbol(void 0, 'quote'), form) : isKeyword(form) ? list(symbol(void 0, 'quote'), form) : isNumber(form) || isString(form) || isBoolean(form) || isNil(form) || isRePattern(form) ? form : isUnquote(form) ? second(form) : isUnquoteSplicing(form) ? readerError('Illegal use of `~@` expression, can only be present in a list') : isEmpty(form) ? form : isDictionary(form) ? list(symbol(void 0, 'apply'), symbol(void 0, 'dictionary'), cons(symbol(void 0, '.concat'), sequenceExpand(concat.apply(void 0, seq(form))))) : isVector(form) ? cons(symbol(void 0, '.concat'), sequenceExpand(form)) : isList(form) ? isEmpty(form) ? cons(symbol(void 0, 'list'), void 0) : list(symbol(void 0, 'apply'), symbol(void 0, 'list'), cons(symbol(void 0, '.concat'), sequenceExpand(form))) : 'else' ? readerError('Unknown Collection type') : void 0;
    };
var syntaxQuoteExpand = exports.syntaxQuoteExpand = syntaxQuote;
var unquoteSplicingExpand = exports.unquoteSplicingExpand = function unquoteSplicingExpand(form) {
        return isVector(form) ? form : list(symbol(void 0, 'vec'), form);
    };
var sequenceExpand = exports.sequenceExpand = function sequenceExpand(forms) {
        return map(function (form) {
            return isUnquote(form) ? [second(form)] : isUnquoteSplicing(form) ? unquoteSplicingExpand(second(form)) : 'else' ? [syntaxQuoteExpand(form)] : void 0;
        }, forms);
    };
installMacro('syntax-quote', syntaxQuote);
var notEqual = exports.notEqual = function notEqual() {
        var body = Array.prototype.slice.call(arguments, 0);
        return list.apply(void 0, [symbol(void 0, 'not')].concat([list.apply(void 0, [symbol(void 0, '=')].concat(vec(body)))]));
    };
installMacro('not=', notEqual);
var ifNot = exports.ifNot = function ifNot(condition, truthy, alternative) {
        'Complements the `if` exclusive conditional branch.';
        return list.apply(void 0, [symbol(void 0, 'if')].concat([list.apply(void 0, [symbol(void 0, 'not')].concat([condition]))], [truthy], [alternative]));
    };
installMacro('if-not', ifNot);
var expandComment = exports.expandComment = function expandComment() {
        var body = Array.prototype.slice.call(arguments, 0);
        return void 0;
    };
installMacro('comment', expandComment);
var expandThreadFirst = exports.expandThreadFirst = function expandThreadFirst() {
        var operations = Array.prototype.slice.call(arguments, 0);
        return reduce(function (form, operation) {
            return cons(first(operation), cons(form, rest(operation)));
        }, first(operations), map(function ($1) {
            return isList($1) ? $1 : list.apply(void 0, [$1].concat());
        }, rest(operations)));
    };
installMacro('->', expandThreadFirst);
var expandCond = exports.expandCond = function expandCond() {
        var clauses = Array.prototype.slice.call(arguments, 0);
        return !isEmpty(clauses) ? list(symbol(void 0, 'if'), first(clauses), isEmpty(rest(clauses)) ? (function () {
            throw Error('cond requires an even number of forms');
        })() : second(clauses), cons(symbol(void 0, 'cond'), rest(rest(clauses)))) : void 0;
    };
installMacro('cond', expandCond);
var expandDefn = exports.expandDefn = function expandDefn(_andForm, name) {
        var docPlusMetaPlusBody = Array.prototype.slice.call(arguments, 2);
        return function () {
            var docø1 = isString(first(docPlusMetaPlusBody)) ? first(docPlusMetaPlusBody) : void 0;
            var metaPlusBodyø1 = docø1 ? rest(docPlusMetaPlusBody) : docPlusMetaPlusBody;
            var metadataø1 = isDictionary(first(metaPlusBodyø1)) ? conj({ 'doc': docø1 }, first(metaPlusBodyø1)) : void 0;
            var bodyø1 = metadataø1 ? rest(metaPlusBodyø1) : metaPlusBodyø1;
            var idø1 = withMeta(name, conj(meta(name) || {}, metadataø1));
            var fnø1 = withMeta(list.apply(void 0, [symbol(void 0, 'fn')].concat([idø1], vec(bodyø1))), meta(_andForm));
            return list.apply(void 0, [symbol(void 0, 'def')].concat([idø1], [fnø1]));
        }.call(this);
    };
installMacro('defn', withMeta(expandDefn, { 'implicit': ['&form'] }));
var expandPrivateDefn = exports.expandPrivateDefn = function expandPrivateDefn(name) {
        var body = Array.prototype.slice.call(arguments, 1);
        return function () {
            var metadataø1 = conj(meta(name) || {}, { 'private': true });
            var idø1 = withMeta(name, metadataø1);
            return list.apply(void 0, [symbol(void 0, 'defn')].concat([idø1], vec(body)));
        }.call(this);
    };
installMacro('defn-', expandPrivateDefn);
var expandLazySeq = exports.expandLazySeq = function expandLazySeq() {
        var body = Array.prototype.slice.call(arguments, 0);
        return list.apply(void 0, [symbol(void 0, '.call')].concat([symbol(void 0, 'lazy-seq')], [void 0], [false], [list.apply(void 0, [symbol(void 0, 'fn')].concat([[]], vec(body)))]));
    };
installMacro('lazy-seq', expandLazySeq);


},{"./ast":"wisp/ast","./runtime":"wisp/runtime","./sequence":"wisp/sequence","./string":"wisp/string"}],"wisp/reader":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.reader',
            doc: 'Reader module provides functions for reading text input\n  as wisp data structures'
        };
    var wisp_sequence = require('./sequence');
    var list = wisp_sequence.list;
    var isList = wisp_sequence.isList;
    var count = wisp_sequence.count;
    var isEmpty = wisp_sequence.isEmpty;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var map = wisp_sequence.map;
    var vec = wisp_sequence.vec;
    var cons = wisp_sequence.cons;
    var conj = wisp_sequence.conj;
    var rest = wisp_sequence.rest;
    var concat = wisp_sequence.concat;
    var last = wisp_sequence.last;
    var butlast = wisp_sequence.butlast;
    var sort = wisp_sequence.sort;
    var lazySeq = wisp_sequence.lazySeq;
    var reduce = wisp_sequence.reduce;
    var wisp_runtime = require('./runtime');
    var isOdd = wisp_runtime.isOdd;
    var dictionary = wisp_runtime.dictionary;
    var keys = wisp_runtime.keys;
    var isNil = wisp_runtime.isNil;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var isVector = wisp_runtime.isVector;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isBoolean = wisp_runtime.isBoolean;
    var isObject = wisp_runtime.isObject;
    var isDictionary = wisp_runtime.isDictionary;
    var rePattern = wisp_runtime.rePattern;
    var reMatches = wisp_runtime.reMatches;
    var reFind = wisp_runtime.reFind;
    var str = wisp_runtime.str;
    var subs = wisp_runtime.subs;
    var char = wisp_runtime.char;
    var vals = wisp_runtime.vals;
    var isEqual = wisp_runtime.isEqual;
    var wisp_ast = require('./ast');
    var isSymbol = wisp_ast.isSymbol;
    var symbol = wisp_ast.symbol;
    var isKeyword = wisp_ast.isKeyword;
    var keyword = wisp_ast.keyword;
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var name = wisp_ast.name;
    var gensym = wisp_ast.gensym;
    var wisp_string = require('./string');
    var split = wisp_string.split;
    var join = wisp_string.join;
}
var pushBackReader = exports.pushBackReader = function pushBackReader(source, uri) {
        return {
            'lines': split(source, '\n'),
            'buffer': '',
            'uri': uri,
            'column': -1,
            'line': 0
        };
    };
var peekChar = exports.peekChar = function peekChar(reader) {
        return function () {
            var lineø1 = (reader || 0)['lines'][(reader || 0)['line']];
            var columnø1 = inc((reader || 0)['column']);
            return isNil(lineø1) ? void 0 : lineø1[columnø1] || '\n';
        }.call(this);
    };
var readChar = exports.readChar = function readChar(reader) {
        return function () {
            var chø1 = peekChar(reader);
            isNewline(peekChar(reader)) ? (function () {
                (reader || 0)['line'] = inc((reader || 0)['line']);
                return (reader || 0)['column'] = -1;
            })() : (reader || 0)['column'] = inc((reader || 0)['column']);
            return chø1;
        }.call(this);
    };
var isNewline = exports.isNewline = function isNewline(ch) {
        return '\n' === ch;
    };
var isBreakingWhitespace = exports.isBreakingWhitespace = function isBreakingWhitespace(ch) {
        return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
    };
var isWhitespace = exports.isWhitespace = function isWhitespace(ch) {
        return isBreakingWhitespace(ch) || ',' === ch;
    };
var isNumeric = exports.isNumeric = function isNumeric(ch) {
        return ch === '0' || ch === '1' || ch === '2' || ch === '3' || ch === '4' || ch === '5' || ch === '6' || ch === '7' || ch === '8' || ch === '9';
    };
var isCommentPrefix = exports.isCommentPrefix = function isCommentPrefix(ch) {
        return ';' === ch;
    };
var isNumberLiteral = exports.isNumberLiteral = function isNumberLiteral(reader, initch) {
        return isNumeric(initch) || ('+' === initch || '-' === initch) && isNumeric(peekChar(reader));
    };
var readerError = exports.readerError = function readerError(reader, message) {
        return function () {
            var textø1 = '' + message + '\n' + 'line:' + (reader || 0)['line'] + '\n' + 'column:' + (reader || 0)['column'];
            var errorø1 = SyntaxError(textø1, (reader || 0)['uri']);
            errorø1.line = (reader || 0)['line'];
            errorø1.column = (reader || 0)['column'];
            errorø1.uri = (reader || 0)['uri'];
            return (function () {
                throw errorø1;
            })();
        }.call(this);
    };
var isMacroTerminating = exports.isMacroTerminating = function isMacroTerminating(ch) {
        return !(ch === '#') && !(ch === '\'') && !(ch === ':') && macros(ch);
    };
var readToken = exports.readToken = function readToken(reader, initch) {
        return function loop() {
            var recur = loop;
            var bufferø1 = initch;
            var chø1 = peekChar(reader);
            do {
                recur = isNil(chø1) || isWhitespace(chø1) || isMacroTerminating(chø1) ? bufferø1 : (loop[0] = '' + bufferø1 + readChar(reader), loop[1] = peekChar(reader), loop);
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var skipLine = exports.skipLine = function skipLine(reader, _) {
        return function loop() {
            var recur = loop;
            do {
                recur = function () {
                    var chø1 = readChar(reader);
                    return chø1 === '\n' || chø1 === '\r' || isNil(chø1) ? reader : (loop);
                }.call(this);
            } while (recur === loop);
            return recur;
        }.call(this);
    };
var intPattern = exports.intPattern = rePattern('^([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?$');
var ratioPattern = exports.ratioPattern = rePattern('([-+]?[0-9]+)/([0-9]+)');
var floatPattern = exports.floatPattern = rePattern('([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?');
var matchInt = exports.matchInt = function matchInt(s) {
        return function () {
            var groupsø1 = reFind(intPattern, s);
            var group3ø1 = groupsø1[2];
            return !(isNil(group3ø1) || count(group3ø1) < 1) ? 0 : function () {
                var negateø1 = '-' === groupsø1[1] ? -1 : 1;
                var aø1 = groupsø1[3] ? [
                        groupsø1[3],
                        10
                    ] : groupsø1[4] ? [
                        groupsø1[4],
                        16
                    ] : groupsø1[5] ? [
                        groupsø1[5],
                        8
                    ] : groupsø1[7] ? [
                        groupsø1[7],
                        parseInt(groupsø1[7])
                    ] : 'else' ? [
                        void 0,
                        void 0
                    ] : void 0;
                var nø1 = aø1[0];
                var radixø1 = aø1[1];
                return isNil(nø1) ? void 0 : negateø1 * parseInt(nø1, radixø1);
            }.call(this);
        }.call(this);
    };
var matchRatio = exports.matchRatio = function matchRatio(s) {
        return function () {
            var groupsø1 = reFind(ratioPattern, s);
            var numinatorø1 = groupsø1[1];
            var denominatorø1 = groupsø1[2];
            return parseInt(numinatorø1) / parseInt(denominatorø1);
        }.call(this);
    };
var matchFloat = exports.matchFloat = function matchFloat(s) {
        return parseFloat(s);
    };
var matchNumber = exports.matchNumber = function matchNumber(s) {
        return reMatches(intPattern, s) ? matchInt(s) : reMatches(ratioPattern, s) ? matchRatio(s) : reMatches(floatPattern, s) ? matchFloat(s) : void 0;
    };
var escapeCharMap = exports.escapeCharMap = function escapeCharMap(c) {
        return c === 't' ? '\t' : c === 'r' ? '\r' : c === 'n' ? '\n' : c === '\\' ? '\\' : c === '"' ? '"' : c === 'b' ? '\b' : c === 'f' ? '\f' : 'else' ? void 0 : void 0;
    };
var read2Chars = exports.read2Chars = function read2Chars(reader) {
        return '' + readChar(reader) + readChar(reader);
    };
var read4Chars = exports.read4Chars = function read4Chars(reader) {
        return '' + readChar(reader) + readChar(reader) + readChar(reader) + readChar(reader);
    };
var unicode2Pattern = exports.unicode2Pattern = rePattern('[0-9A-Fa-f]{2}');
var unicode4Pattern = exports.unicode4Pattern = rePattern('[0-9A-Fa-f]{4}');
var validateUnicodeEscape = exports.validateUnicodeEscape = function validateUnicodeEscape(unicodePattern, reader, escapeChar, unicodeStr) {
        return reMatches(unicodePattern, unicodeStr) ? unicodeStr : readerError(reader, '' + 'Unexpected unicode escape ' + '\\' + escapeChar + unicodeStr);
    };
var makeUnicodeChar = exports.makeUnicodeChar = function makeUnicodeChar(codeStr, base) {
        return function () {
            var baseø2 = base || 16;
            var codeø1 = parseInt(codeStr, baseø2);
            return char(codeø1);
        }.call(this);
    };
var escapeChar = exports.escapeChar = function escapeChar(buffer, reader) {
        return function () {
            var chø1 = readChar(reader);
            var mapresultø1 = escapeCharMap(chø1);
            return mapresultø1 ? mapresultø1 : chø1 === 'x' ? makeUnicodeChar(validateUnicodeEscape(unicode2Pattern, reader, chø1, read2Chars(reader))) : chø1 === 'u' ? makeUnicodeChar(validateUnicodeEscape(unicode4Pattern, reader, chø1, read4Chars(reader))) : isNumeric(chø1) ? char(chø1) : 'else' ? readerError(reader, '' + 'Unexpected unicode escape ' + '\\' + chø1) : void 0;
        }.call(this);
    };
var readPast = exports.readPast = function readPast(predicate, reader) {
        return function loop() {
            var recur = loop;
            var _ø1 = void 0;
            do {
                recur = predicate(peekChar(reader)) ? (loop[0] = readChar(reader), loop) : peekChar(reader);
            } while (_ø1 = loop[0], recur === loop);
            return recur;
        }.call(this);
    };
var readDelimitedList = exports.readDelimitedList = function readDelimitedList(delim, reader, isRecursive) {
        return function loop() {
            var recur = loop;
            var formsø1 = [];
            do {
                recur = function () {
                    var _ø1 = readPast(isWhitespace, reader);
                    var chø1 = readChar(reader);
                    !chø1 ? readerError(reader, 'EOF') : void 0;
                    return delim === chø1 ? formsø1 : function () {
                        var formø1 = readForm(reader, chø1);
                        return loop[0] = formø1 === reader ? formsø1 : conj(formsø1, formø1), loop;
                    }.call(this);
                }.call(this);
            } while (formsø1 = loop[0], recur === loop);
            return recur;
        }.call(this);
    };
var notImplemented = exports.notImplemented = function notImplemented(reader, ch) {
        return readerError(reader, '' + 'Reader for ' + ch + ' not implemented yet');
    };
var readDispatch = exports.readDispatch = function readDispatch(reader, _) {
        return function () {
            var chø1 = readChar(reader);
            var dmø1 = dispatchMacros(chø1);
            return dmø1 ? dmø1(reader, _) : function () {
                var objectø1 = maybeReadTaggedType(reader, chø1);
                return objectø1 ? objectø1 : readerError(reader, 'No dispatch macro for ', chø1);
            }.call(this);
        }.call(this);
    };
var readUnmatchedDelimiter = exports.readUnmatchedDelimiter = function readUnmatchedDelimiter(rdr, ch) {
        return readerError(rdr, 'Unmatched delimiter ', ch);
    };
var readList = exports.readList = function readList(reader, _) {
        return function () {
            var formø1 = readDelimitedList(')', reader, true);
            return withMeta(list.apply(void 0, formø1), meta(formø1));
        }.call(this);
    };
var readComment = exports.readComment = function readComment(reader, _) {
        return function loop() {
            var recur = loop;
            var bufferø1 = '';
            var chø1 = readChar(reader);
            do {
                recur = isNil(chø1) || '\n' === chø1 ? reader || list(symbol(void 0, 'comment'), bufferø1) : '\\' === chø1 ? (loop[0] = '' + bufferø1 + escapeChar(bufferø1, reader), loop[1] = readChar(reader), loop) : 'else' ? (loop[0] = '' + bufferø1 + chø1, loop[1] = readChar(reader), loop) : void 0;
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var readVector = exports.readVector = function readVector(reader) {
        return readDelimitedList(']', reader, true);
    };
var readMap = exports.readMap = function readMap(reader) {
        return function () {
            var formø1 = readDelimitedList('}', reader, true);
            return isOdd(count(formø1)) ? readerError(reader, 'Map literal must contain an even number of forms') : withMeta(dictionary.apply(void 0, formø1), meta(formø1));
        }.call(this);
    };
var readSet = exports.readSet = function readSet(reader, _) {
        return function () {
            var formø1 = readDelimitedList('}', reader, true);
            return withMeta(concat([symbol(void 0, 'set')], formø1), meta(formø1));
        }.call(this);
    };
var readNumber = exports.readNumber = function readNumber(reader, initch) {
        return function loop() {
            var recur = loop;
            var bufferø1 = initch;
            var chø1 = peekChar(reader);
            do {
                recur = isNil(chø1) || isWhitespace(chø1) || macros(chø1) ? (function () {
                    var match = matchNumber(bufferø1);
                    return isNil(match) ? readerError(reader, 'Invalid number format [', bufferø1, ']') : new Number(match);
                })() : (loop[0] = '' + bufferø1 + readChar(reader), loop[1] = peekChar(reader), loop);
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var readString = exports.readString = function readString(reader) {
        return function loop() {
            var recur = loop;
            var bufferø1 = '';
            var chø1 = readChar(reader);
            do {
                recur = isNil(chø1) ? readerError(reader, 'EOF while reading string') : '\\' === chø1 ? (loop[0] = '' + bufferø1 + escapeChar(bufferø1, reader), loop[1] = readChar(reader), loop) : '"' === chø1 ? new String(bufferø1) : 'default' ? (loop[0] = '' + bufferø1 + chø1, loop[1] = readChar(reader), loop) : void 0;
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var readCharacter = exports.readCharacter = function readCharacter(reader) {
        return new String(readChar(reader));
    };
var readUnquote = exports.readUnquote = function readUnquote(reader) {
        return function () {
            var chø1 = peekChar(reader);
            return !chø1 ? readerError(reader, 'EOF while reading character') : chø1 === '@' ? (function () {
                readChar(reader);
                return list(symbol(void 0, 'unquote-splicing'), read(reader, true, void 0, true));
            })() : list(symbol(void 0, 'unquote'), read(reader, true, void 0, true));
        }.call(this);
    };
var specialSymbols = exports.specialSymbols = function specialSymbols(text, notFound) {
        return text === 'nil' ? void 0 : text === 'true' ? true : text === 'false' ? false : 'else' ? notFound : void 0;
    };
var readSymbol = exports.readSymbol = function readSymbol(reader, initch) {
        return function () {
            var tokenø1 = readToken(reader, initch);
            var partsø1 = split(tokenø1, '/');
            var hasNsø1 = count(partsø1) > 1 && count(tokenø1) > 1;
            var nsø1 = first(partsø1);
            var nameø1 = join('/', rest(partsø1));
            return hasNsø1 ? symbol(nsø1, nameø1) : specialSymbols(tokenø1, symbol(tokenø1));
        }.call(this);
    };
var readKeyword = exports.readKeyword = function readKeyword(reader, initch) {
        return function () {
            var tokenø1 = readToken(reader, readChar(reader));
            var partsø1 = split(tokenø1, '/');
            var nameø1 = last(partsø1);
            var nsø1 = count(partsø1) > 1 ? join('/', butlast(partsø1)) : void 0;
            var issueø1 = last(nsø1) === ':' ? 'namespace can\'t ends with ":"' : last(nameø1) === ':' ? 'name can\'t end with ":"' : last(nameø1) === '/' ? 'name can\'t end with "/"' : count(split(tokenø1, '::')) > 1 ? 'name can\'t contain "::"' : void 0;
            return issueø1 ? readerError(reader, 'Invalid token (', issueø1, '): ', tokenø1) : !nsø1 && first(nameø1) === ':' ? keyword(rest(nameø1)) : keyword(nsø1, nameø1);
        }.call(this);
    };
var desugarMeta = exports.desugarMeta = function desugarMeta(form) {
        return isKeyword(form) ? dictionary(name(form), true) : isSymbol(form) ? { 'tag': form } : isString(form) ? { 'tag': form } : isDictionary(form) ? reduce(function (result, pair) {
            (result || 0)[name(first(pair))] = second(pair);
            return result;
        }, {}, form) : 'else' ? form : void 0;
    };
var wrappingReader = exports.wrappingReader = function wrappingReader(prefix) {
        return function (reader) {
            return list(prefix, read(reader, true, void 0, true));
        };
    };
var throwingReader = exports.throwingReader = function throwingReader(msg) {
        return function (reader) {
            return readerError(reader, msg);
        };
    };
var readMeta = exports.readMeta = function readMeta(reader, _) {
        return function () {
            var metadataø1 = desugarMeta(read(reader, true, void 0, true));
            !isDictionary(metadataø1) ? readerError(reader, 'Metadata must be Symbol, Keyword, String or Map') : void 0;
            return function () {
                var formø1 = read(reader, true, void 0, true);
                return isObject(formø1) ? withMeta(formø1, conj(metadataø1, meta(formø1))) : formø1;
            }.call(this);
        }.call(this);
    };
var readRegex = exports.readRegex = function readRegex(reader) {
        return function loop() {
            var recur = loop;
            var bufferø1 = '';
            var chø1 = readChar(reader);
            do {
                recur = isNil(chø1) ? readerError(reader, 'EOF while reading string') : '\\' === chø1 ? (loop[0] = '' + bufferø1 + chø1 + readChar(reader), loop[1] = readChar(reader), loop) : '"' === chø1 ? rePattern(bufferø1) : 'default' ? (loop[0] = '' + bufferø1 + chø1, loop[1] = readChar(reader), loop) : void 0;
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var readParam = exports.readParam = function readParam(reader, initch) {
        return function () {
            var formø1 = readSymbol(reader, initch);
            return isEqual(formø1, symbol('%')) ? symbol('%1') : formø1;
        }.call(this);
    };
var isParam = exports.isParam = function isParam(form) {
        return isSymbol(form) && '%' === first(name(form));
    };
var lambdaParamsHash = exports.lambdaParamsHash = function lambdaParamsHash(form) {
        return isParam(form) ? dictionary(form, form) : isDictionary(form) || isVector(form) || isList(form) ? conj.apply(void 0, map(lambdaParamsHash, vec(form))) : 'else' ? {} : void 0;
    };
var lambdaParams = exports.lambdaParams = function lambdaParams(body) {
        return function () {
            var namesø1 = sort(vals(lambdaParamsHash(body)));
            var variadicø1 = isEqual(first(namesø1), symbol('%&'));
            var nø1 = variadicø1 && count(namesø1) === 1 ? 0 : count(namesø1) === 0 ? 0 : 'else' ? parseInt(rest(name(last(namesø1)))) : void 0;
            var paramsø1 = function loop() {
                    var recur = loop;
                    var namesø2 = [];
                    var iø1 = 1;
                    do {
                        recur = iø1 <= nø1 ? (loop[0] = conj(namesø2, symbol('' + '%' + iø1)), loop[1] = inc(iø1), loop) : namesø2;
                    } while (namesø2 = loop[0], iø1 = loop[1], recur === loop);
                    return recur;
                }.call(this);
            return variadicø1 ? conj(paramsø1, symbol(void 0, '&'), symbol(void 0, '%&')) : namesø1;
        }.call(this);
    };
var readLambda = exports.readLambda = function readLambda(reader) {
        return function () {
            var bodyø1 = readList(reader);
            return list(symbol(void 0, 'fn'), lambdaParams(bodyø1), bodyø1);
        }.call(this);
    };
var readDiscard = exports.readDiscard = function readDiscard(reader, _) {
        read(reader, true, void 0, true);
        return reader;
    };
var macros = exports.macros = function macros(c) {
        return c === '"' ? readString : c === '\\' ? readCharacter : c === ':' ? readKeyword : c === ';' ? readComment : c === '\'' ? wrappingReader(symbol(void 0, 'quote')) : c === '@' ? wrappingReader(symbol(void 0, 'deref')) : c === '^' ? readMeta : c === '`' ? wrappingReader(symbol(void 0, 'syntax-quote')) : c === '~' ? readUnquote : c === '(' ? readList : c === ')' ? readUnmatchedDelimiter : c === '[' ? readVector : c === ']' ? readUnmatchedDelimiter : c === '{' ? readMap : c === '}' ? readUnmatchedDelimiter : c === '%' ? readParam : c === '#' ? readDispatch : 'else' ? void 0 : void 0;
    };
var dispatchMacros = exports.dispatchMacros = function dispatchMacros(s) {
        return s === '{' ? readSet : s === '(' ? readLambda : s === '<' ? throwingReader('Unreadable form') : s === '"' ? readRegex : s === '!' ? readComment : s === '_' ? readDiscard : 'else' ? void 0 : void 0;
    };
var readForm = exports.readForm = function readForm(reader, ch) {
        return function () {
            var startø1 = {
                    'line': (reader || 0)['line'],
                    'column': (reader || 0)['column']
                };
            var readMacroø1 = macros(ch);
            var formø1 = readMacroø1 ? readMacroø1(reader, ch) : isNumberLiteral(reader, ch) ? readNumber(reader, ch) : 'else' ? readSymbol(reader, ch) : void 0;
            var endø1 = {
                    'line': (reader || 0)['line'],
                    'column': inc((reader || 0)['column'])
                };
            var locationø1 = {
                    'uri': (reader || 0)['uri'],
                    'start': startø1,
                    'end': endø1
                };
            return formø1 === reader ? formø1 : !(isBoolean(formø1) || isNil(formø1) || isKeyword(formø1)) ? withMeta(formø1, conj(locationø1, meta(formø1))) : 'else' ? formø1 : void 0;
        }.call(this);
    };
var read = exports.read = function read(reader, eofIsError, sentinel, isRecursive) {
        return function loop() {
            var recur = loop;
            do {
                recur = function () {
                    var chø1 = readChar(reader);
                    var formø1 = isNil(chø1) ? eofIsError ? readerError(reader, 'EOF') : sentinel : isWhitespace(chø1) ? reader : isCommentPrefix(chø1) ? read(readComment(reader, chø1), eofIsError, sentinel, isRecursive) : 'else' ? readForm(reader, chø1) : void 0;
                    return formø1 === reader ? (loop) : formø1;
                }.call(this);
            } while (recur === loop);
            return recur;
        }.call(this);
    };
var read_ = exports.read_ = function read_(source, uri) {
        return function () {
            var readerø1 = pushBackReader(source, uri);
            var eofø1 = gensym();
            return function loop() {
                var recur = loop;
                var formsø1 = [];
                var formø1 = read(readerø1, false, eofø1, false);
                do {
                    recur = formø1 === eofø1 ? formsø1 : (loop[0] = conj(formsø1, formø1), loop[1] = read(readerø1, false, eofø1, false), loop);
                } while (formsø1 = loop[0], formø1 = loop[1], recur === loop);
                return recur;
            }.call(this);
        }.call(this);
    };
var readFromString = exports.readFromString = function readFromString(source, uri) {
        return function () {
            var readerø1 = pushBackReader(source, uri);
            return read(readerø1, true, void 0, false);
        }.call(this);
    };
var readUuid = function readUuid(uuid) {
    return isString(uuid) ? list.apply(void 0, [symbol(void 0, 'UUID.')].concat([uuid])) : readerError(void 0, 'UUID literal expects a string as its representation.');
};
var readQueue = function readQueue(items) {
    return isVector(items) ? list.apply(void 0, [symbol(void 0, 'PersistentQueue.')].concat([items])) : readerError(void 0, 'Queue literal expects a vector for its elements.');
};
var __tagTable__ = exports.__tagTable__ = dictionary('uuid', readUuid, 'queue', readQueue);
var maybeReadTaggedType = exports.maybeReadTaggedType = function maybeReadTaggedType(reader, initch) {
        return function () {
            var tagø1 = readSymbol(reader, initch);
            var pfnø1 = (__tagTable__ || 0)[name(tagø1)];
            return pfnø1 ? pfnø1(read(reader, true, void 0, false)) : readerError(reader, '' + 'Could not find tag parser for ' + name(tagø1) + ' in ' + ('' + keys(__tagTable__)));
        }.call(this);
    };


},{"./ast":"wisp/ast","./runtime":"wisp/runtime","./sequence":"wisp/sequence","./string":"wisp/string"}],"wisp/repl":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.repl',
            doc: void 0
        };
    var repl = require('repl');
    var repl = repl;
    var vm = require('vm');
    var vm = vm;
    var wisp_runtime = require('./runtime');
    var subs = wisp_runtime.subs;
    var isEqual = wisp_runtime.isEqual;
    var keys = wisp_runtime.keys;
    var wisp_sequence = require('./sequence');
    var count = wisp_sequence.count;
    var list = wisp_sequence.list;
    var conj = wisp_sequence.conj;
    var cons = wisp_sequence.cons;
    var vec = wisp_sequence.vec;
    var last = wisp_sequence.last;
    var wisp_compiler = require('./compiler');
    var compile = wisp_compiler.compile;
    var readForms = wisp_compiler.readForms;
    var analyzeForms = wisp_compiler.analyzeForms;
    var generate = wisp_compiler.generate;
    var wisp_ast = require('./ast');
    var prStr = wisp_ast.prStr;
    var base64Encode = require('base64-encode');
    var btoa = base64Encode;
}
var evaluateCode = exports.evaluateCode = function evaluateCode(source, uri, context) {
        return function () {
            var sourceUriø1 = '' + 'data:application/wisp;charset=utf-8;base64,' + btoa(source);
            var formsø1 = readForms(source, sourceUriø1);
            var nodesø1 = (formsø1 || 0)['forms'] ? analyzeForms((formsø1 || 0)['forms']) : void 0;
            var inputø1 = (nodesø1 || 0)['ast'] ? (function () {
                    try {
                        return generate.apply(void 0, vec(cons({ 'source-uri': sourceUriø1 }, (nodesø1 || 0)['ast'])));
                    } catch (error) {
                        return { 'error': error };
                    }
                })() : void 0;
            var outputø1 = (inputø1 || 0)['code'] ? (function () {
                    try {
                        return { 'value': vm.runInContext((inputø1 || 0)['code'], context, uri) };
                    } catch (error) {
                        return { 'error': error };
                    }
                })() : void 0;
            var resultø1 = conj(formsø1, nodesø1, inputø1, outputø1, { 'error': (outputø1 || 0)['error'] || (inputø1 || 0)['error'] || (nodesø1 || 0)['error'] || (formsø1 || 0)['error'] });
            context._3 = context._2;
            context._2 = context._1;
            return context._1 = resultø1;
        }.call(this);
    };
var evaluate = exports.evaluate = function () {
        var inputø1 = void 0;
        var outputø1 = void 0;
        return function evaluate(code, context, file, callback) {
            return !(inputø1 === code) ? (function () {
                inputø1 = !(last(code) === '\n') ? subs(code, 0, count(code) - 1) : code;
                outputø1 = evaluateCode(inputø1, file, context);
                return callback((outputø1 || 0)['error'], (outputø1 || 0)['value']);
            })() : callback((outputø1 || 0)['error']);
        };
    }.call(this);
var start = exports.start = function start() {
        return function () {
            var sessionø1 = repl.start({
                    'writer': prStr,
                    'prompt': '=> ',
                    'ignoreUndefined': true,
                    'useGlobal': false,
                    'eval': evaluate
                });
            var contextø1 = sessionø1.context;
            [
                'runtime',
                'sequence',
                'string'
            ].map(function (n) {
                return function () {
                    var fø1 = require('' + './src/' + n + '.wisp');
                    return keys(fø1).map(function (k) {
                        return (contextø1 || 0)[k] = (fø1 || 0)[k];
                    });
                }.call(this);
            });
            contextø1.exports = {};
            return sessionø1;
        }.call(this);
    };


},{"./ast":"wisp/ast","./compiler":"wisp/compiler","./runtime":"wisp/runtime","./sequence":"wisp/sequence","base64-encode":5,"repl":7,"vm":28}],"wisp/runtime":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.runtime',
            doc: 'Core primitives required for runtime'
        };
}
var identity = exports.identity = function identity(x) {
        return x;
    };
var complement = exports.complement = function complement(f) {
        return function () {
            switch (arguments.length) {
            case 0:
                return !f();
            case 1:
                var x = arguments[0];
                return !f(x);
            case 2:
                var x = arguments[0];
                var y = arguments[1];
                return !f(x, y);
            default:
                var x = arguments[0];
                var y = arguments[1];
                var zs = Array.prototype.slice.call(arguments, 2);
                return !f.apply(void 0, [
                    x,
                    y
                ].concat(zs));
            }
        };
    };
var isOdd = exports.isOdd = function isOdd(n) {
        return n % 2 === 1;
    };
var isEven = exports.isEven = function isEven(n) {
        return n % 2 === 0;
    };
var isDictionary = exports.isDictionary = function isDictionary(form) {
        return isObject(form) && isObject(Object.getPrototypeOf(form)) && isNil(Object.getPrototypeOf(Object.getPrototypeOf(form)));
    };
var dictionary = exports.dictionary = function dictionary() {
        var pairs = Array.prototype.slice.call(arguments, 0);
        return function loop() {
            var recur = loop;
            var keyValuesø1 = pairs;
            var resultø1 = {};
            do {
                recur = keyValuesø1.length ? (function () {
                    resultø1[keyValuesø1[0]] = keyValuesø1[1];
                    return loop[0] = keyValuesø1.slice(2), loop[1] = resultø1, loop;
                })() : resultø1;
            } while (keyValuesø1 = loop[0], resultø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var keys = exports.keys = function keys(dictionary) {
        return Object.keys(dictionary);
    };
var vals = exports.vals = function vals(dictionary) {
        return keys(dictionary).map(function (key) {
            return (dictionary || 0)[key];
        });
    };
var keyValues = exports.keyValues = function keyValues(dictionary) {
        return keys(dictionary).map(function (key) {
            return [
                key,
                (dictionary || 0)[key]
            ];
        });
    };
var merge = exports.merge = function merge() {
        return Object.create(Object.prototype, Array.prototype.slice.call(arguments).reduce(function (descriptor, dictionary) {
            isObject(dictionary) ? Object.keys(dictionary).forEach(function (key) {
                return (descriptor || 0)[key] = Object.getOwnPropertyDescriptor(dictionary, key);
            }) : void 0;
            return descriptor;
        }, Object.create(Object.prototype)));
    };
var isSatisfies = exports.isSatisfies = function isSatisfies(protocol, x) {
        return protocol.wisp_core$IProtocol$_ || (x === void 0 ? protocol.wisp_core$IProtocol$nil || false : x === null ? protocol.wisp_core$IProtocol$nil || false : 'else' ? x[protocol.wisp_core$IProtocol$id] || protocol['' + 'wisp_core$IProtocol$' + Object.prototype.toString.call(x).replace('[object ', '').replace(/\]$/, '')] || false : void 0);
    };
var isContainsVector = exports.isContainsVector = function isContainsVector(vector, element) {
        return vector.indexOf(element) >= 0;
    };
var mapDictionary = exports.mapDictionary = function mapDictionary(source, f) {
        return Object.keys(source).reduce(function (target, key) {
            (target || 0)[key] = f((source || 0)[key]);
            return target;
        }, {});
    };
var toString = exports.toString = Object.prototype.toString;
var isFn = exports.isFn = typeof(/./) === 'function' ? function (x) {
        return toString.call(x) === '[object Function]';
    } : function (x) {
        return typeof(x) === 'function';
    };
var isError = exports.isError = function isError(x) {
        return x instanceof Error || toString.call(x) === '[object Error]';
    };
var isString = exports.isString = function isString(x) {
        return typeof(x) === 'string' || toString.call(x) === '[object String]';
    };
var isNumber = exports.isNumber = function isNumber(x) {
        return typeof(x) === 'number' || toString.call(x) === '[object Number]';
    };
var isVector = exports.isVector = isFn(Array.isArray) ? Array.isArray : function (x) {
        return toString.call(x) === '[object Array]';
    };
var isDate = exports.isDate = function isDate(x) {
        return toString.call(x) === '[object Date]';
    };
var isBoolean = exports.isBoolean = function isBoolean(x) {
        return x === true || x === false || toString.call(x) === '[object Boolean]';
    };
var isRePattern = exports.isRePattern = function isRePattern(x) {
        return toString.call(x) === '[object RegExp]';
    };
var isObject = exports.isObject = function isObject(x) {
        return x && typeof(x) === 'object';
    };
var isNil = exports.isNil = function isNil(x) {
        return x === void 0 || x === null;
    };
var isTrue = exports.isTrue = function isTrue(x) {
        return x === true;
    };
var isFalse = exports.isFalse = function isFalse(x) {
        return x === false;
    };
var reFind = exports.reFind = function reFind(re, s) {
        return function () {
            var matchesø1 = re.exec(s);
            return !isNil(matchesø1) ? matchesø1.length === 1 ? (matchesø1 || 0)[0] : matchesø1 : void 0;
        }.call(this);
    };
var reMatches = exports.reMatches = function reMatches(pattern, source) {
        return function () {
            var matchesø1 = pattern.exec(source);
            return !isNil(matchesø1) && (matchesø1 || 0)[0] === source ? matchesø1.length === 1 ? (matchesø1 || 0)[0] : matchesø1 : void 0;
        }.call(this);
    };
var rePattern = exports.rePattern = function rePattern(s) {
        return function () {
            var matchø1 = reFind(/^(?:\(\?([idmsux]*)\))?(.*)/, s);
            return new RegExp((matchø1 || 0)[2], (matchø1 || 0)[1]);
        }.call(this);
    };
var inc = exports.inc = function inc(x) {
        return x + 1;
    };
var dec = exports.dec = function dec(x) {
        return x - 1;
    };
var str = exports.str = function str() {
        return String.prototype.concat.apply('', arguments);
    };
var char = exports.char = function char(code) {
        return String.fromCharCode(code);
    };
var int = exports.int = function int(x) {
        return isNumber(x) ? x >= 0 ? Math.floor(x) : Math.floor(x) : x.charCodeAt(0);
    };
var subs = exports.subs = function subs(string, start, end) {
        return string.substring(start, end);
    };
var isPatternEqual = function isPatternEqual(x, y) {
    return isRePattern(x) && isRePattern(y) && x.source === y.source && x.global === y.global && x.multiline === y.multiline && x.ignoreCase === y.ignoreCase;
};
var isDateEqual = function isDateEqual(x, y) {
    return isDate(x) && isDate(y) && Number(x) === Number(y);
};
var isDictionaryEqual = function isDictionaryEqual(x, y) {
    return isObject(x) && isObject(y) && function () {
        var xKeysø1 = keys(x);
        var yKeysø1 = keys(y);
        var xCountø1 = xKeysø1.length;
        var yCountø1 = yKeysø1.length;
        return xCountø1 === yCountø1 && function loop() {
            var recur = loop;
            var indexø1 = 0;
            var countø1 = xCountø1;
            var keysø1 = xKeysø1;
            do {
                recur = indexø1 < countø1 ? isEquivalent((x || 0)[(keysø1 || 0)[indexø1]], (y || 0)[(keysø1 || 0)[indexø1]]) ? (loop[0] = inc(indexø1), loop[1] = countø1, loop[2] = keysø1, loop) : false : true;
            } while (indexø1 = loop[0], countø1 = loop[1], keysø1 = loop[2], recur === loop);
            return recur;
        }.call(this);
    }.call(this);
};
var isVectorEqual = function isVectorEqual(x, y) {
    return isVector(x) && isVector(y) && x.length === y.length && function loop() {
        var recur = loop;
        var xsø1 = x;
        var ysø1 = y;
        var indexø1 = 0;
        var countø1 = x.length;
        do {
            recur = indexø1 < countø1 ? isEquivalent((xsø1 || 0)[indexø1], (ysø1 || 0)[indexø1]) ? (loop[0] = xsø1, loop[1] = ysø1, loop[2] = inc(indexø1), loop[3] = countø1, loop) : false : true;
        } while (xsø1 = loop[0], ysø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
        return recur;
    }.call(this);
};
var isEquivalent = function isEquivalent() {
    switch (arguments.length) {
    case 1:
        var x = arguments[0];
        return true;
    case 2:
        var x = arguments[0];
        var y = arguments[1];
        return x === y || (isNil(x) ? isNil(y) : isNil(y) ? isNil(x) : isString(x) ? isString(y) && x.toString() === y.toString() : isNumber(x) ? isNumber(y) && x.valueOf() === y.valueOf() : isFn(x) ? false : isBoolean(x) ? false : isDate(x) ? isDateEqual(x, y) : isVector(x) ? isVectorEqual(x, y, [], []) : isRePattern(x) ? isPatternEqual(x, y) : 'else' ? isDictionaryEqual(x, y) : void 0);
    default:
        var x = arguments[0];
        var y = arguments[1];
        var more = Array.prototype.slice.call(arguments, 2);
        return function loop() {
            var recur = loop;
            var previousø1 = x;
            var currentø1 = y;
            var indexø1 = 0;
            var countø1 = more.length;
            do {
                recur = isEquivalent(previousø1, currentø1) && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
            } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
            return recur;
        }.call(this);
    }
};
var isEqual = exports.isEqual = isEquivalent;
var isStrictEqual = exports.isStrictEqual = function isStrictEqual() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x === y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 == currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var greaterThan = exports.greaterThan = function greaterThan() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x > y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 > currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var notLessThan = exports.notLessThan = function notLessThan() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x >= y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 >= currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var lessThan = exports.lessThan = function lessThan() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x < y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 < currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var notGreaterThan = exports.notGreaterThan = function notGreaterThan() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x <= y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 <= currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var sum = exports.sum = function sum() {
        switch (arguments.length) {
        case 0:
            return 0;
        case 1:
            var a = arguments[0];
            return a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a + b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a + b + c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a + b + c + d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a + b + c + d + e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a + b + c + d + e + f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a + b + c + d + e + f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 + (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var subtract = exports.subtract = function subtract() {
        switch (arguments.length) {
        case 0:
            return (function () {
                throw TypeError('Wrong number of args passed to: -');
            })();
        case 1:
            var a = arguments[0];
            return 0 - a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a - b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a - b - c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a - b - c - d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a - b - c - d - e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a - b - c - d - e - f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a - b - c - d - e - f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 - (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var divide = exports.divide = function divide() {
        switch (arguments.length) {
        case 0:
            return (function () {
                throw TypeError('Wrong number of args passed to: /');
            })();
        case 1:
            var a = arguments[0];
            return 1 / a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a / b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a / b / c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a / b / c / d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a / b / c / d / e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a / b / c / d / e / f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a / b / c / d / e / f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 / (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var multiply = exports.multiply = function multiply() {
        switch (arguments.length) {
        case 0:
            return 1;
        case 1:
            var a = arguments[0];
            return a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a * b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a * b * c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a * b * c * d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a * b * c * d * e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a * b * c * d * e * f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a * b * c * d * e * f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 * (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var and = exports.and = function and() {
        switch (arguments.length) {
        case 0:
            return true;
        case 1:
            var a = arguments[0];
            return a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a && b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a && b && c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a && b && c && d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a && b && c && d && e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a && b && c && d && e && f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a && b && c && d && e && f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 && (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var or = exports.or = function or() {
        switch (arguments.length) {
        case 0:
            return void 0;
        case 1:
            var a = arguments[0];
            return a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a || b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a || b || c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a || b || c || d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a || b || c || d || e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a || b || c || d || e || f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a || b || c || d || e || f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 || (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var print = exports.print = function print() {
        var more = Array.prototype.slice.call(arguments, 0);
        return console.log.apply(void 0, more);
    };
var max = exports.max = Math.max;
var min = exports.min = Math.min;
var isNan = exports.isNan = isNaN;


},{}],"wisp/sequence":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.sequence',
            doc: void 0
        };
    var wisp_runtime = require('./runtime');
    var isNil = wisp_runtime.isNil;
    var isVector = wisp_runtime.isVector;
    var isFn = wisp_runtime.isFn;
    var isNumber = wisp_runtime.isNumber;
    var isString = wisp_runtime.isString;
    var isDictionary = wisp_runtime.isDictionary;
    var keyValues = wisp_runtime.keyValues;
    var str = wisp_runtime.str;
    var dec = wisp_runtime.dec;
    var inc = wisp_runtime.inc;
    var merge = wisp_runtime.merge;
    var dictionary = wisp_runtime.dictionary;
}
var List = function List(head, tail) {
    this.head = head;
    this.tail = tail || list();
    this.length = inc(count(this.tail));
    return this;
};
List.prototype.length = 0;
List.type = 'wisp.list';
List.prototype.type = List.type;
List.prototype.tail = Object.create(List.prototype);
List.prototype.toString = function () {
    return function loop() {
        var recur = loop;
        var resultø1 = '';
        var listø1 = this;
        do {
            recur = isEmpty(listø1) ? '' + '(' + resultø1.substr(1) + ')' : (loop[0] = '' + resultø1 + ' ' + (isVector(first(listø1)) ? '' + '[' + first(listø1).join(' ') + ']' : isNil(first(listø1)) ? 'nil' : isString(first(listø1)) ? JSON.stringify(first(listø1)) : isNumber(first(listø1)) ? JSON.stringify(first(listø1)) : first(listø1)), loop[1] = rest(listø1), loop);
        } while (resultø1 = loop[0], listø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var lazySeqValue = function lazySeqValue(lazySeq) {
    return !lazySeq.realized ? (lazySeq.realized = true) && (lazySeq.x = lazySeq.x()) : lazySeq.x;
};
var LazySeq = function LazySeq(realized, x) {
    this.realized = realized || false;
    this.x = x;
    return this;
};
LazySeq.type = 'wisp.lazy.seq';
LazySeq.prototype.type = LazySeq.type;
var lazySeq = exports.lazySeq = function lazySeq(realized, body) {
        return new LazySeq(realized, body);
    };
var isLazySeq = exports.isLazySeq = function isLazySeq(value) {
        return value && LazySeq.type === value.type;
    };
var isList = exports.isList = function isList(value) {
        return value && List.type === value.type;
    };
var list = exports.list = function list() {
        return arguments.length === 0 ? Object.create(List.prototype) : Array.prototype.slice.call(arguments).reduceRight(function (tail, head) {
            return cons(head, tail);
        }, list());
    };
var cons = exports.cons = function cons(head, tail) {
        return new List(head, tail);
    };
var reverseList = function reverseList(sequence) {
    return function loop() {
        var recur = loop;
        var itemsø1 = [];
        var sourceø1 = sequence;
        do {
            recur = isEmpty(sourceø1) ? list.apply(void 0, itemsø1) : (loop[0] = [first(sourceø1)].concat(itemsø1), loop[1] = rest(sourceø1), loop);
        } while (itemsø1 = loop[0], sourceø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var isSequential = exports.isSequential = function isSequential(x) {
        return isList(x) || isVector(x) || isLazySeq(x) || isDictionary(x) || isString(x);
    };
var reverse = exports.reverse = function reverse(sequence) {
        return isList(sequence) ? reverseList(sequence) : isVector(sequence) ? sequence.reverse() : isNil(sequence) ? list() : 'else' ? reverse(seq(sequence)) : void 0;
    };
var map = exports.map = function map(f, sequence) {
        return isVector(sequence) ? sequence.map(function ($1) {
            return f($1);
        }) : isList(sequence) ? mapList(f, sequence) : isNil(sequence) ? list() : 'else' ? map(f, seq(sequence)) : void 0;
    };
var mapList = function mapList(f, sequence) {
    return function loop() {
        var recur = loop;
        var resultø1 = list();
        var itemsø1 = sequence;
        do {
            recur = isEmpty(itemsø1) ? reverse(resultø1) : (loop[0] = cons(f(first(itemsø1)), resultø1), loop[1] = rest(itemsø1), loop);
        } while (resultø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var filter = exports.filter = function filter(isF, sequence) {
        return isVector(sequence) ? sequence.filter(isF) : isList(sequence) ? filterList(isF, sequence) : isNil(sequence) ? list() : 'else' ? filter(isF, seq(sequence)) : void 0;
    };
var filterList = function filterList(isF, sequence) {
    return function loop() {
        var recur = loop;
        var resultø1 = list();
        var itemsø1 = sequence;
        do {
            recur = isEmpty(itemsø1) ? reverse(resultø1) : (loop[0] = isF(first(itemsø1)) ? cons(first(itemsø1), resultø1) : resultø1, loop[1] = rest(itemsø1), loop);
        } while (resultø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var reduce = exports.reduce = function reduce(f) {
        var params = Array.prototype.slice.call(arguments, 1);
        return function () {
            var hasInitialø1 = count(params) >= 2;
            var initialø1 = hasInitialø1 ? first(params) : void 0;
            var sequenceø1 = hasInitialø1 ? second(params) : first(params);
            return isNil(sequenceø1) ? initialø1 : isVector(sequenceø1) ? hasInitialø1 ? sequenceø1.reduce(f, initialø1) : sequenceø1.reduce(f) : isList(sequenceø1) ? hasInitialø1 ? reduceList(f, initialø1, sequenceø1) : reduceList(f, first(sequenceø1), rest(sequenceø1)) : 'else' ? reduce(f, initialø1, seq(sequenceø1)) : void 0;
        }.call(this);
    };
var reduceList = function reduceList(f, initial, sequence) {
    return function loop() {
        var recur = loop;
        var resultø1 = initial;
        var itemsø1 = sequence;
        do {
            recur = isEmpty(itemsø1) ? resultø1 : (loop[0] = f(resultø1, first(itemsø1)), loop[1] = rest(itemsø1), loop);
        } while (resultø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var count = exports.count = function count(sequence) {
        return isNil(sequence) ? 0 : seq(sequence).length;
    };
var isEmpty = exports.isEmpty = function isEmpty(sequence) {
        return count(sequence) === 0;
    };
var first = exports.first = function first(sequence) {
        return isNil(sequence) ? void 0 : isList(sequence) ? sequence.head : isVector(sequence) || isString(sequence) ? (sequence || 0)[0] : isLazySeq(sequence) ? first(lazySeqValue(sequence)) : 'else' ? first(seq(sequence)) : void 0;
    };
var second = exports.second = function second(sequence) {
        return isNil(sequence) ? void 0 : isList(sequence) ? first(rest(sequence)) : isVector(sequence) || isString(sequence) ? (sequence || 0)[1] : isLazySeq(sequence) ? second(lazySeqValue(sequence)) : 'else' ? first(rest(seq(sequence))) : void 0;
    };
var third = exports.third = function third(sequence) {
        return isNil(sequence) ? void 0 : isList(sequence) ? first(rest(rest(sequence))) : isVector(sequence) || isString(sequence) ? (sequence || 0)[2] : isLazySeq(sequence) ? third(lazySeqValue(sequence)) : 'else' ? second(rest(seq(sequence))) : void 0;
    };
var rest = exports.rest = function rest(sequence) {
        return isNil(sequence) ? list() : isList(sequence) ? sequence.tail : isVector(sequence) || isString(sequence) ? sequence.slice(1) : isLazySeq(sequence) ? rest(lazySeqValue(sequence)) : 'else' ? rest(seq(sequence)) : void 0;
    };
var lastOfList = function lastOfList(list) {
    return function loop() {
        var recur = loop;
        var itemø1 = first(list);
        var itemsø1 = rest(list);
        do {
            recur = isEmpty(itemsø1) ? itemø1 : (loop[0] = first(itemsø1), loop[1] = rest(itemsø1), loop);
        } while (itemø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var last = exports.last = function last(sequence) {
        return isVector(sequence) || isString(sequence) ? (sequence || 0)[dec(count(sequence))] : isList(sequence) ? lastOfList(sequence) : isNil(sequence) ? void 0 : isLazySeq(sequence) ? last(lazySeqValue(sequence)) : 'else' ? last(seq(sequence)) : void 0;
    };
var butlast = exports.butlast = function butlast(sequence) {
        return function () {
            var itemsø1 = isNil(sequence) ? void 0 : isString(sequence) ? subs(sequence, 0, dec(count(sequence))) : isVector(sequence) ? sequence.slice(0, dec(count(sequence))) : isList(sequence) ? list.apply(void 0, butlast(vec(sequence))) : isLazySeq(sequence) ? butlast(lazySeqValue(sequence)) : 'else' ? butlast(seq(sequence)) : void 0;
            return !(isNil(itemsø1) || isEmpty(itemsø1)) ? itemsø1 : void 0;
        }.call(this);
    };
var take = exports.take = function take(n, sequence) {
        return isNil(sequence) ? list() : isVector(sequence) ? takeFromVector(n, sequence) : isList(sequence) ? takeFromList(n, sequence) : isLazySeq(sequence) ? take(n, lazySeqValue(sequence)) : 'else' ? take(n, seq(sequence)) : void 0;
    };
var takeVectorWhile = function takeVectorWhile(predicate, vector) {
    return function loop() {
        var recur = loop;
        var resultø1 = [];
        var tailø1 = vector;
        var headø1 = first(vector);
        do {
            recur = !isEmpty(tailø1) && predicate(headø1) ? (loop[0] = conj(resultø1, headø1), loop[1] = rest(tailø1), loop[2] = first(tailø1), loop) : resultø1;
        } while (resultø1 = loop[0], tailø1 = loop[1], headø1 = loop[2], recur === loop);
        return recur;
    }.call(this);
};
var takeListWhile = function takeListWhile(predicate, items) {
    return function loop() {
        var recur = loop;
        var resultø1 = [];
        var tailø1 = items;
        var headø1 = first(items);
        do {
            recur = !isEmpty(tailø1) && isPredicate(headø1) ? (loop[0] = conj(resultø1, headø1), loop[1] = rest(tailø1), loop[2] = first(tailø1), loop) : list.apply(void 0, resultø1);
        } while (resultø1 = loop[0], tailø1 = loop[1], headø1 = loop[2], recur === loop);
        return recur;
    }.call(this);
};
var takeWhile = exports.takeWhile = function takeWhile(predicate, sequence) {
        return isNil(sequence) ? list() : isVector(sequence) ? takeVectorWhile(predicate, sequence) : isList(sequence) ? takeVectorWhile(predicate, sequence) : 'else' ? takeWhile(predicate, lazySeqValue(sequence)) : void 0;
    };
var takeFromVector = function takeFromVector(n, vector) {
    return vector.slice(0, n);
};
var takeFromList = function takeFromList(n, sequence) {
    return function loop() {
        var recur = loop;
        var takenø1 = list();
        var itemsø1 = sequence;
        var nø2 = n;
        do {
            recur = nø2 === 0 || isEmpty(itemsø1) ? reverse(takenø1) : (loop[0] = cons(first(itemsø1), takenø1), loop[1] = rest(itemsø1), loop[2] = dec(nø2), loop);
        } while (takenø1 = loop[0], itemsø1 = loop[1], nø2 = loop[2], recur === loop);
        return recur;
    }.call(this);
};
var dropFromList = function dropFromList(n, sequence) {
    return function loop() {
        var recur = loop;
        var leftø1 = n;
        var itemsø1 = sequence;
        do {
            recur = leftø1 < 1 || isEmpty(itemsø1) ? itemsø1 : (loop[0] = dec(leftø1), loop[1] = rest(itemsø1), loop);
        } while (leftø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var drop = exports.drop = function drop(n, sequence) {
        return n <= 0 ? sequence : isString(sequence) ? sequence.substr(n) : isVector(sequence) ? sequence.slice(n) : isList(sequence) ? dropFromList(n, sequence) : isNil(sequence) ? list() : isLazySeq(sequence) ? drop(n, lazySeqValue(sequence)) : 'else' ? drop(n, seq(sequence)) : void 0;
    };
var conjList = function conjList(sequence, items) {
    return reduce(function (result, item) {
        return cons(item, result);
    }, sequence, items);
};
var conj = exports.conj = function conj(sequence) {
        var items = Array.prototype.slice.call(arguments, 1);
        return isVector(sequence) ? sequence.concat(items) : isString(sequence) ? '' + sequence + str.apply(void 0, items) : isNil(sequence) ? list.apply(void 0, reverse(items)) : isList(sequence) || isLazySeq() ? conjList(sequence, items) : isDictionary(sequence) ? merge(sequence, merge.apply(void 0, items)) : 'else' ? (function () {
            throw TypeError('' + 'Type can\'t be conjoined ' + sequence);
        })() : void 0;
    };
var assoc = exports.assoc = function assoc(source) {
        var keyValues = Array.prototype.slice.call(arguments, 1);
        return conj(source, dictionary.apply(void 0, keyValues));
    };
var concat = exports.concat = function concat() {
        var sequences = Array.prototype.slice.call(arguments, 0);
        return reverse(reduce(function (result, sequence) {
            return reduce(function (result, item) {
                return cons(item, result);
            }, result, seq(sequence));
        }, list(), sequences));
    };
var seq = exports.seq = function seq(sequence) {
        return isNil(sequence) ? void 0 : isVector(sequence) || isList(sequence) || isLazySeq(sequence) ? sequence : isString(sequence) ? Array.prototype.slice.call(sequence) : isDictionary(sequence) ? keyValues(sequence) : 'default' ? (function () {
            throw TypeError('' + 'Can not seq ' + sequence);
        })() : void 0;
    };
var isSeq = exports.isSeq = function isSeq(sequence) {
        return isList(sequence) || isLazySeq(sequence);
    };
var listToVector = function listToVector(source) {
    return function loop() {
        var recur = loop;
        var resultø1 = [];
        var listø1 = source;
        do {
            recur = isEmpty(listø1) ? resultø1 : (loop[0] = (function () {
                resultø1.push(first(listø1));
                return resultø1;
            })(), loop[1] = rest(listø1), loop);
        } while (resultø1 = loop[0], listø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var vec = exports.vec = function vec(sequence) {
        return isNil(sequence) ? [] : isVector(sequence) ? sequence : isList(sequence) || isLazySeq(sequence) ? listToVector(sequence) : 'else' ? vec(seq(sequence)) : void 0;
    };
var sort = exports.sort = function sort(f, items) {
        return function () {
            var hasComparatorø1 = isFn(f);
            var itemsø2 = !hasComparatorø1 && isNil(items) ? f : items;
            var compareø1 = hasComparatorø1 ? function (a, b) {
                    return f(a, b) ? 0 : 1;
                } : void 0;
            return isNil(itemsø2) ? list() : isVector(itemsø2) ? itemsø2.sort(compareø1) : isList(itemsø2) ? list.apply(void 0, vec(itemsø2).sort(compareø1)) : isDictionary(itemsø2) ? seq(itemsø2).sort(compareø1) : 'else' ? sort(f, seq(itemsø2)) : void 0;
        }.call(this);
    };
var repeat = exports.repeat = function repeat(n, x) {
        return function loop() {
            var recur = loop;
            var nø2 = n;
            var resultø1 = [];
            do {
                recur = nø2 <= 0 ? resultø1 : (loop[0] = dec(nø2), loop[1] = conj(resultø1, x), loop);
            } while (nø2 = loop[0], resultø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var isEvery = exports.isEvery = function isEvery(predicate, sequence) {
        return vec(sequence).every(function ($1) {
            return predicate($1);
        });
    };
var some = exports.some = function some(predicate, sequence) {
        return function loop() {
            var recur = loop;
            var itemsø1 = sequence;
            do {
                recur = isEmpty(itemsø1) ? false : predicate(first(itemsø1)) ? true : 'else' ? (loop[0] = rest(itemsø1), loop) : void 0;
            } while (itemsø1 = loop[0], recur === loop);
            return recur;
        }.call(this);
    };
var partition = exports.partition = function partition() {
        switch (arguments.length) {
        case 2:
            var n = arguments[0];
            var coll = arguments[1];
            return partition(n, n, coll);
        case 3:
            var n = arguments[0];
            var step = arguments[1];
            var coll = arguments[2];
            return partition(n, step, [], coll);
        case 4:
            var n = arguments[0];
            var step = arguments[1];
            var pad = arguments[2];
            var coll = arguments[3];
            return function loop() {
                var recur = loop;
                var resultø1 = [];
                var itemsø1 = seq(coll);
                do {
                    recur = function () {
                        var chunkø1 = take(n, itemsø1);
                        var sizeø1 = count(chunkø1);
                        return sizeø1 === n ? (loop[0] = conj(resultø1, chunkø1), loop[1] = drop(step, itemsø1), loop) : 0 === sizeø1 ? resultø1 : n > sizeø1 + count(pad) ? resultø1 : 'else' ? conj(resultø1, take(n, vec(concat(chunkø1, pad)))) : void 0;
                    }.call(this);
                } while (resultø1 = loop[0], itemsø1 = loop[1], recur === loop);
                return recur;
            }.call(this);
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
var interleave = exports.interleave = function interleave() {
        switch (arguments.length) {
        case 2:
            var ax = arguments[0];
            var bx = arguments[1];
            return function loop() {
                var recur = loop;
                var cxø1 = [];
                var axø2 = ax;
                var bxø2 = bx;
                do {
                    recur = isEmpty(axø2) || isEmpty(bxø2) ? seq(cxø1) : (loop[0] = conj(cxø1, first(axø2), first(bxø2)), loop[1] = rest(axø2), loop[2] = rest(bxø2), loop);
                } while (cxø1 = loop[0], axø2 = loop[1], bxø2 = loop[2], recur === loop);
                return recur;
            }.call(this);
        default:
            var sequences = Array.prototype.slice.call(arguments, 0);
            return function loop() {
                var recur = loop;
                var resultø1 = [];
                var sequencesø2 = sequences;
                do {
                    recur = some(isEmpty, sequencesø2) ? resultø1 : (loop[0] = concat(resultø1, map(first, sequencesø2)), loop[1] = map(rest, sequencesø2), loop);
                } while (resultø1 = loop[0], sequencesø2 = loop[1], recur === loop);
                return recur;
            }.call(this);
        }
    };
var nth = exports.nth = function nth(sequence, index, notFound) {
        return isNil(sequence) ? notFound : isList(sequence) ? index < count(sequence) ? first(drop(index, sequence)) : notFound : isVector(sequence) || isString(sequence) ? index < count(sequence) ? sequence[index] : notFound : isLazySeq(sequence) ? nth(lazySeqValue(sequence), index, notFound) : 'else' ? (function () {
            throw TypeError('Unsupported type');
        })() : void 0;
    };


},{"./runtime":"wisp/runtime"}],"wisp/string":[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.string',
            doc: void 0
        };
    var wisp_runtime = require('./runtime');
    var str = wisp_runtime.str;
    var subs = wisp_runtime.subs;
    var reMatches = wisp_runtime.reMatches;
    var isNil = wisp_runtime.isNil;
    var isString = wisp_runtime.isString;
    var isRePattern = wisp_runtime.isRePattern;
    var wisp_sequence = require('./sequence');
    var vec = wisp_sequence.vec;
    var isEmpty = wisp_sequence.isEmpty;
}
var split = exports.split = function split(string, pattern, limit) {
        return string.split(pattern, limit);
    };
var splitLines = exports.splitLines = function splitLines(s) {
        return split(s, /\n|\r\n/);
    };
var join = exports.join = function join() {
        switch (arguments.length) {
        case 1:
            var coll = arguments[0];
            return str.apply(void 0, vec(coll));
        case 2:
            var separator = arguments[0];
            var coll = arguments[1];
            return vec(coll).join(separator);
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
var upperCase = exports.upperCase = function upperCase(string) {
        return string.toUpperCase();
    };
var lowerCase = exports.lowerCase = function lowerCase(string) {
        return string.toLowerCase();
    };
var capitalize = exports.capitalize = function capitalize(s) {
        return count(s) < 2 ? upperCase(s) : '' + upperCase(subs(s, 0, 1)) + lowerCase(subs(s, 1));
    };
var ESCAPE_PATTERN = new RegExp('([-()\\[\\]{}+?*.$\\^|,:#<!\\\\])', 'g');
var patternEscape = exports.patternEscape = function patternEscape(source) {
        return source.replace(ESCAPE_PATTERN, '\\$1').replace(new RegExp('\\x08', 'g'), '\\x08');
    };
var replaceFirst = exports.replaceFirst = function replaceFirst(string, match, replacement) {
        return string.replace(match, replacement);
    };
var replace = exports.replace = function replace(string, match, replacement) {
        return isString(match) ? string.replace(new RegExp(patternEscape(match), 'g'), replacement) : isRePattern(match) ? string.replace(new RegExp(match.source, 'g'), replacement) : 'else' ? (function () {
            throw '' + 'Invalid match arg: ' + match;
        })() : void 0;
    };
var __LEFTSPACES__ = exports.__LEFTSPACES__ = /^\s\s*/;
var __RIGHTSPACES__ = exports.__RIGHTSPACES__ = /\s\s*$/;
var __SPACES__ = exports.__SPACES__ = /^\s\s*$/;
var triml = exports.triml = isNil(''.trimLeft) ? function (string) {
        return string.replace(__LEFTSPACES__, '');
    } : function (string) {
        return string.trimLeft();
    };
var trimr = exports.trimr = isNil(''.trimRight) ? function (string) {
        return string.replace(__RIGHTSPACES__, '');
    } : function (string) {
        return string.trimRight();
    };
var trim = exports.trim = isNil(''.trim) ? function (string) {
        return string.replace(__LEFTSPACES__).replace(__RIGHTSPACES__);
    } : function (string) {
        return string.trim();
    };
var isBlank = exports.isBlank = function isBlank(string) {
        return isNil(string) || isEmpty(string) || reMatches(__SPACES__, string);
    };
var reverse = exports.reverse = function reverse(string) {
        return join('', string.split(/(?:)/).reverse());
    };


},{"./runtime":"wisp/runtime","./sequence":"wisp/sequence"}]},{},[3]);
