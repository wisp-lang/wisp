/*jshint asi:true */

// constants
var DOT = '.'
var quote = 'quote'
var unquote = 'unquote'
var quasiquote = 'quasiquote'

// registries

var macros = {}
var env = {}
var specials = {}

// predicates

function isSymbol(token) { return typeof(token) === 'string' }
function isMacro(symbol) { return symbol in macros }
function isSpecial(symbol) { return symbol in specials }
function isList(symbol) { return symbol instanceof Symbol }

// utils

function symbolName(symbol) { return symbol }

function List(head, tail) {}
List.prototype.toString = function() {
  var value = '', rest = this
  while (rest) {
    value = value + ' ' + first(rest)
    rest = next(rest)
  }
  return '(' + value + ')'
}

function cons(head, tail) {
  var list = new List()
  list.head = head
  list.tail = tail
  list.length = tail.length + 1
  return list
}
env.cons = cons

function first(list) { return list.head }
env.first = first

function rest(list) { return list.tail }
var next = rest
env.next = next
env.rest = rest

function second(list) { return first(rest(list)) }

function count(list) { return list ? list.length : 0 }


function list() {
  var items = Array.prototype.slice.call(arguments)
  var count = items.length, value = null
  while (count--) value = cons(items[count], value)
  return value
}
env.list = list


env[quote] = function(form) {
  return first(form)
}
env[quasiquote] = function(form) {
  return first(form)
}


// parser

function macroExpand1(form) {
  if (isList(form)) {
    var operator = first(form)
    if (isSpecial(operator))
      return form
    if (isMacro(operator)) {
      return macros[operator](list(form, env, next(form)))
    }
    else {
      if (isSymbol(operator)) {
        var name = symbolName(operator)
        //(.substring s 2 5) => (. s substring 2 5)
        if (name.charAt(0) == DOT) {
          if (count(form) < 2)
              throw TypeError("Malformed member expression, expecting (.member target ...)")
          var method = name.substr(1)
          var target = second(form)

          return list(DOT, target, method, next(next(form)))
        }
        else {
          // (s.substring 2 5) => (. s substring 2 5)
          // (package.class.name ...) (. package.class name ...)
          var index = name.lastIndexOf(DOT)
          // if (index > 0 && index < symbol.length - 1) {
          //   var target = symbol.substr(0, index)
          //   var method = symbol.substr(index + 1)
          //   return list(DOT, target, method, rest(form))
          // }
          // (StringBuilder. "foo") => (new StringBuilder "foo")
          if (index == name.length - 1)
            return list(NEW, name.substr(0, index), next(form))
        }
      }
    }
  }
  return form
}


function analize(context, form, name) {
  if (form === null)
    return null
  else if (form === TRUE)
    return TRUE_EXPR
  else if (form === FALSE)
    return FALSE_EXPR

  if (isSymbol(form))
    return analizeSymbol(form)
  else if (isKeyword(form))
    return registerKeyword(form)
  else if (isNumber(form))
    return parseNumber(form)
  else if (isString(form))
    return stringExpression(form)
  //else if (isCharacter(form))
  //  return characterExpression(form)
  else if (isPersistentCollection(form) && form.length === 0)
    return emptyExpression(form)
  else if (isSeq(form))
    return analyzeSeq(context, Seq(form), name)
  else if (isPersistentVector(form))
    return parseVectorExpr(context, form)
  else if (isRecord(form))
    return constantExpr(form)
  else if (isType(form))
    return constantExpr(form)
  else if (isPersistentMap(form))
    return parseMapExpr(context, form)
  else if (isPersistentSet(form))
    return parseSetExpr(context, form)
  else
    return constantExpr(form)
}

macroExpand1(list("quote", "a", "b", "c"))
macroExpand1(list("quote", list("a", "b", "c")))
// macroExpand1(list("a", "b", "c"))
macroExpand1(list("first", list("a", "b")))


