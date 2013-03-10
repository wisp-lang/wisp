(import [symbol] "../src/ast")
(import [list] "../src/sequence")
(import [str =] "../src/runtime")
(import [self-evaluating? compile macroexpand compile-program] "../src/compiler")
(import [read-from-string] "../src/reader")

(defn transpile [& forms] (compile-program forms))

(.log console "self evaluating forms")
(assert (self-evaluating? 1) "number is self evaluating")
(assert (self-evaluating? "string") "string is self evaluating")
(assert (self-evaluating? true) "true is boolean => self evaluating")
(assert (self-evaluating? false) "false is boolean => self evaluating")
(assert (self-evaluating?) "no args is nil => self evaluating")
(assert (self-evaluating? nil) "nil is self evaluating")
(assert (self-evaluating? :keyword) "keyword is self evaluating")
(assert (not (self-evaluating? ':keyword)) "quoted keyword not self evaluating")
(assert (not (self-evaluating? (list))) "list is not self evaluating")
(assert (not (self-evaluating? self-evaluating?)) "fn is not self evaluating")
(assert (not (self-evaluating? (symbol "symbol"))) "symbol is not self evaluating")


(.log console "compile primitive forms")

(assert (= (transpile '(def x)) "var x = void(0);\nexports.x = x")
        "def compiles properly")
(assert (= (transpile '(def y 1)) "var y = 1;\nexports.y = y")
        "def with two args compiled properly")
(assert (= (transpile ''(def x 1))
                      "list(symbol(void(0), \"def\"), symbol(void(0), \"x\"), 1)")
        "quotes preserve lists")

(.log console "private defs")

;; Note need to actually read otherwise metadata is lost after
;; compilation.
(assert (= (transpile (read-from-string "(def ^:private x)"))
           "var x = void(0)"))
(assert (= (transpile (read-from-string "(def ^:private y 1)"))
           "var y = 1"))



(.log console "compile invoke forms")
(assert (identical? (transpile '(foo)) "foo()")
        "function calls compile")
(assert (identical? (transpile '(foo bar)) "foo(bar)")
        "function calls with single arg compile")
(assert (identical? (transpile '(foo bar baz)) "foo(bar, baz)")
        "function calls with multi arg compile")
(assert (identical? (transpile '(foo ((bar baz) beep)))
                    "foo((bar(baz))(beep))")
        "nested function calls compile")

(.log console "compile functions")


(assert (identical? (transpile '(fn [x] x))
                    "function(x) {\n  return x;\n}")
        "function compiles")
(assert (identical? (transpile '(fn [x] (def y 1) (foo x y)))
                    "function(x) {\n  var y = 1;\n  return foo(x, y);\n}")
        "function with multiple statements compiles")
(assert (identical? (transpile '(fn identity [x] x))
                    "function identity(x) {\n  return x;\n}")
        "named function compiles")
(assert (identical? (transpile '(fn a "docs docs" [x] x))
                    "function a(x) {\n  return x;\n}")
        "fn docs are supported")
(assert (identical? (transpile '(fn "docs docs" [x] x))
                    "function(x) {\n  return x;\n}")
        "fn docs for anonymous functions are supported")

(assert (identical? (transpile '(fn foo? ^boolean [x] true))
                    "function isFoo(x) {\n  return true;\n}")
        "metadata is supported")


(assert (identical? (transpile '(fn [a & b] a))
"function(a) {
  var b = Array.prototype.slice.call(arguments, 1);
  return a;
}") "function with variadic arguments")

(assert (identical? (transpile '(fn [& a] a))
"function() {
  var a = Array.prototype.slice.call(arguments, 0);
  return a;
}") "function with all variadic arguments")

(assert (identical? (transpile '(fn
                                  ([] 0)
                                  ([x] x)))
"function(x) {
  switch (arguments.length) {
    case 0:
      return 0;
    case 1:
      return x;
    
    default:
      (function() { throw Error(\"Invalid arity\"); })()
  };
  return void(0);
}") "function with overloads")

(assert (identical? (transpile
'(fn sum
  "doc"
  {:version "1.0"}
  ([] 0)
  ([x] x)
  ([x y] (+ x y))
  ([x & rest] (reduce rest sum x))))

"function sum(x, y) {
  switch (arguments.length) {
    case 0:
      return 0;
    case 1:
      return x;
    case 2:
      return x + y;
    
    default:
      var rest = Array.prototype.slice.call(arguments, 1);
      return reduce(rest, sum, x);
  };
  return void(0);
}") "function with overloads docs & metadata")

(.log console "compile if special form")



(assert (identical? (transpile '(if foo (bar)))
                    "foo ?\n  bar() :\n  void(0)")
        "if compiles")

(assert (identical? (transpile '(if foo (bar) baz))
                    "foo ?\n  bar() :\n  baz")
        "if-else compiles")

(assert (identical? (transpile '(if monday? (.log console "monday")))
                    "isMonday ?\n  console.log(\"monday\") :\n  void(0)")
        "macros inside blocks expand properly")



(.log console "compile do special form")



(assert (identical? (transpile '(do (foo bar) bar))
                    "(function() {\n  foo(bar);\n  return bar;\n})()")
        "do compiles")
(assert (identical? (transpile '(do))
                    "(function() {\n  return void(0);\n})()")
        "empty do compiles")




(.log console "compile let special form")



(assert (identical? (transpile '(let [] x))
                    "(function() {\n  return x;\n})()")
        "let bindings compiles properly")
(assert (identical?
         (transpile '(let [x 1 y 2] x))
         "(function() {\n  var x = 1;\n  var y = 2;\n  return x;\n})()")
        "let with bindings compiles properly")




(.log console "compile throw special form")



(assert (identical? (transpile '(throw error))
                    "(function() { throw error; })()")
        "throw reference compiles")

(assert (identical? (transpile '(throw (Error message)))
                    "(function() { throw Error(message); })()")
        "throw expression compiles")

(assert (identical? (transpile '(throw "boom"))
                    "(function() { throw \"boom\"; })()")
        "throw string compile")



(.log console "compile set! special form")




(assert (identical? (transpile '(set! x 1))
                    "x = 1")
        "set! compiles")

(assert (identical? (transpile '(set! x (foo bar 2)))
                    "x = foo(bar, 2)")
        "set! with value expression compiles")

(assert (identical? (transpile '(set! x (.m o)))
                    "x = o.m()")
        "set! expands macros")




(.log console "compile vectors")




(assert (identical? (transpile '[a b]) "[a, b]")
        "vector compiles")

(assert (identical? (transpile '[a (b c)]) "[a, b(c)]")
        "vector of expressions compiles")

(assert (identical? (transpile '[]) "[]")
        "empty vector compiles")



(.log console "compiles try special form")



(assert (identical?
         (transpile '(try (m 1 0) (catch e e)))
         "(function() {\ntry {\n  return m(1, 0);\n} catch (e) {\n  return e;\n}})()")
        "try / catch compiles")

(assert (identical?
         (transpile '(try (m 1 0) (finally 0)))
         "(function() {\ntry {\n  return m(1, 0);\n} finally {\n  return 0;\n}})()")
        "try / finally compiles")

(assert (identical?
         (transpile '(try (m 1 0) (catch e e) (finally 0)))
         "(function() {\ntry {\n  return m(1, 0);\n} catch (e) {\n  return e;\n} finally {\n  return 0;\n}})()")
        "try / catch / finally compiles")




(.log console "compile property / method access / call special forms")




(assert (identical? (transpile '(.log console message))
                    "console.log(message)")
        "method call compiles correctly")
(assert (identical? (transpile '(.-location window))
                    "window.location")
        "property access compiles correctly")
(assert (identical? (transpile '(.-foo? bar))
                    "bar.isFoo")
        "property access compiles naming conventions")
(assert (identical? (transpile '(.-location (.open window url)))
                    "(window.open(url)).location")
        "compound property access and method call")
(assert (identical? (transpile '(.slice (.splice arr 0)))
                    "arr.splice(0).slice()")
        "(.slice (.splice arr 0)) => arr.splice(0).slice()")
(assert (identical? (transpile '(.a (.b "/")))
                    "\"/\".b().a()")
        "(.a (.b \"/\")) => \"/\".b().a()")

(.log console "compile sugar for keyword based access")

(assert (identical? (transpile '(:foo bar))
                    "(bar || 0)[\"foo\"]"))


(.log console "compile unquote-splicing forms")

(assert (identical? (transpile '`(1 ~@'(2 3)))
                    "concat(list(1), list(2, 3))")
        "list unquote-splicing compiles")
(assert (identical? (transpile '`())
                    "list()")
         "empty list unquotes to empty list")

(assert (identical? (transpile '`[1 ~@[2 3]])
                    "vec(concat([1], [2, 3]))")
        "vector unquote-splicing compiles")

(assert (identical? (transpile '`[])
                    "[]")
        "syntax-quoted empty vector compiles to empty vector")



(.log console "compile references")



(assert (identical? (transpile '(set! **macros** []))
                    "__macros__ = []")
        "**macros** => __macros__")
(assert (identical?
         (transpile '(fn vector->list [v] (make list v)))
         "function vectorToList(v) {\n  return make(list, v);\n}")
        "list->vector => listToVector")
(assert (identical? (transpile '(swap! foo bar))
                    "swap(foo, bar)")
        "set! => set")

;(assert (identical? (transpile '(let [raw% foo-bar] raw%))
;                     "swap(foo, bar)")
;          "set! => set")

(assert (identical? (transpile '(def under_dog))
                    "var under_dog = void(0);\nexports.under_dog = under_dog")
        "foo_bar => foo_bar")
(assert (identical? (transpile '(digit? 0))
                    "isDigit(0)")
        "number? => isNumber")

(assert (identical? (transpile '(create-server options))
                    "createServer(options)")
        "create-server => createServer")

(assert (identical? (transpile '(.create-server http options))
                    "http.createServer(options)")
        "http.create-server => http.createServer")




(.log console "compiles new special form")


(assert (identical? (transpile '(new Foo)) "new Foo()")
        "(new Foo) => new Foo()")
(assert (identical? (transpile '(Foo.)) "new Foo()")
        "(Foo.) => new Foo()")
(assert (identical? (transpile '(new Foo a b)) "new Foo(a, b)")
        "(new Foo a b) => new Foo(a, b)")
(assert (identical? (transpile '(Foo. a b)) "new Foo(a, b)")
        "(Foo. a b) => new Foo(a, b)")

(.log console "compiles native special forms: and or + * - / not")


(assert (identical? (transpile '(and a b)) "a && b")
        "(and a b) => a && b")
(assert (identical? (transpile '(and a b c)) "a && b && c")
        "(and a b c) => a && b && c")
(assert (identical? (transpile '(and a (or b c))) "a && (b || c)")
        "(and a (or b c)) => a && (b || c)")
(assert (identical?
        "(a > b) && (c > d) ?\n  x :\n  y"
        (transpile '(if (and (> a b) (> c d)) x y))))

(assert (identical?
         (transpile '(and a (or b (or c d)))) "a && (b || (c || d))")
        "(and a (or b (or c d))) => a && (b || (c || d))")
(assert (identical? (transpile '(not x)) "!(x)")
        "(not x) => !(x)")
(assert (identical? (transpile '(not (or x y))) "!(x || y)")
        "(not x) => !(x)")


(.log console "compiles = == >= <= < > special forms")


(assert (identical? (transpile '(= a b)) "isEqual(a, b)")
        "(= a b) => isEqual(a, b)")
(assert (identical? (transpile '(= a b c)) "isEqual(a, b, c)")
        "(= a b c) => isEqual(a, b, c)")
(assert (identical? (transpile '(< a b c)) "a < b && b < c")
        "(< a b c) => a < b && b < c")
(assert (identical? (transpile '(identical? a b c)) "a === b && b === c")
        "(identical? a b c) => a === b && b === c")
(assert (identical? (transpile '(>= (.index-of arr el) 0))
                    "arr.indexOf(el) >= 0")
        "(>= (.index-of arr el) 0) => arr.indexOf(el) >= 0")

(.log console "compiles = - + == >= <= / * as functions")

(assert (identical? (transpile '(apply and nums))
        "and.apply(and, nums)"))
(assert (identical? (transpile '(apply or nums))
        "or.apply(or, nums)"))
(assert (identical? (transpile '(apply = nums))
                    "isEqual.apply(isEqual, nums)"))
(assert (identical? (transpile '(apply == nums))
                    "isStrictEqual.apply(isStrictEqual, nums)"))
(assert (identical? (transpile '(apply > nums))
                    "greaterThan.apply(greaterThan, nums)"))
(assert (identical? (transpile '(apply < nums))
                    "lessThan.apply(lessThan, nums)"))
(assert (identical? (transpile '(apply <= nums))
                    "notGreaterThan.apply(notGreaterThan, nums)"))
(assert (identical? (transpile '(apply >= nums))
                    "notLessThan.apply(notLessThan, nums)"))
(assert (identical? (transpile '(apply * nums))
                    "multiply.apply(multiply, nums)"))
(assert (identical? (transpile '(apply / nums))
                    "divide.apply(divide, nums)"))
(assert (identical? (transpile '(apply + nums))
                    "sum.apply(sum, nums)"))
(assert (identical? (transpile '(apply - nums))
                    "subtract.apply(subtract, nums)"))

(.log console "compiles dictionaries to js objects")

(assert (identical? (transpile '{}) "{}")
        "empty hash compiles to empty object")
(assert (identical? (transpile '{ :foo 1 }) "{\n  \"foo\": 1\n}")
        "compile dictionaries to js objects")

(assert (identical?
         (transpile '{:foo 1 :bar (a b) :bz (fn [x] x) :bla { :sub 2 }})
"{
  \"foo\": 1,
  \"bar\": a(b),
  \"bz\": function(x) {
    return x;
  },
  \"bla\": {
    \"sub\": 2
  }
}") "compile nested dictionaries")


(.log console "compiles compound accessor")


(assert (identical? (transpile '(get a b)) "a[b]")
        "(get a b) => a[b]")
(assert (identical? (transpile '(aget arguments 1)) "arguments[1]")
        "(aget arguments 1) => arguments[1]")
(assert (identical? (transpile '(get (a b) (get c d)))
                    "(a(b))[c[d]]")
        "(get (a b) (get c d)) => a(b)[c[d]]")
(assert (identical? (transpile '(get (or t1 t2) p))
                    "(t1 || t2)[p]"))

(.log console "compiles instance?")

(assert (identical? (transpile '(instance? Object a))
                    "a instanceof Object")
        "(instance? Object a) => a instanceof Object")
(assert (identical? (transpile '(instance? (C D) (a b)))
                    "a(b) instanceof C(D)")
        "(instance? (C D) (a b)) => a(b) instanceof C(D)")


(.log console "compile loop")
(assert (identical? (transpile '(loop [x 7] (if (f x) x (recur (b x)))))
"(function loop(x) {
  var recur = loop;
  while (recur === loop) {
    recur = f(x) ?
    x :
    (x = b(x), loop);
  };
  return recur;
})(7)") "single binding loops compile")

(assert (identical? (transpile '(loop [] (if (m?) m (recur))))
"(function loop() {
  var recur = loop;
  while (recur === loop) {
    recur = isM() ?
    m :
    (loop);
  };
  return recur;
})()") "zero bindings loops compile")

(assert
 (identical?
  (transpile '(loop [x 3 y 5] (if (> x y) x (recur (+ x 1) (- y 1)))))
"(function loop(x, y) {
  var recur = loop;
  while (recur === loop) {
    recur = x > y ?
    x :
    (x = x + 1, y = y - 1, loop);
  };
  return recur;
})(3, 5)") "multi bindings loops compile")

(assert (= (transpile '(defn identity [x] x))
           (str "var identity = function identity(x) {\n  return x;\n};\n"
                "exports.identity = identity")))

(assert (= (transpile '(defn- identity [x] x))
           "var identity = function identity(x) {\n  return x;\n}")
        "private functions")
