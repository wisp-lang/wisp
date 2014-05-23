(ns wisp.test.escodegen
  (:require [wisp.test.util :refer [is thrown?]]
            [wisp.src.sequence :refer [concat cons vec take first rest
                                       second third list list? count drop
                                       lazy-seq? seq nth map]]
            [wisp.src.runtime :refer [subs = dec identity keys nil? vector?
                                      string? dec re-find]]
            [wisp.src.compiler :refer [compile]]
            [wisp.src.reader :refer [read* read-from-string]
                             :rename {read-from-string read-string}]
            [wisp.src.ast :refer [meta name pr-str symbol]]))

(defn transpile
  [code]
  (let [output (compile code {:no-map true})]
    (if (:error output)
      (throw (:error output))
      (:code output))))


;; =>
;; literals


(is (= (transpile "nil") "void 0;"))
(is (= (transpile "true") "true;"))
(is (= (transpile "false") "false;"))
(is (= (transpile "1") "1;"))
(is (= (transpile "-1") "-1;"))
(is (= (transpile "\"hello world\"") "'hello world';"))
(is (= (transpile "()") "list();"))
(is (= (transpile "[]") "[];"))
(is (= (transpile "{}") "({});"))

;; =>
;; identifiers


(is (= (transpile "foo") "foo;"))
(is (= (transpile "foo-bar") "fooBar;"))
(is (= (transpile "ba-ra-baz") "baRaBaz;"))
(is (= (transpile "-boom") "_boom;"))
(is (= (transpile "foo?") "isFoo;"))
(is (= (transpile "foo-bar?") "isFooBar;"))
(is (= (transpile "**private**") "__private__;"))
(is (= (transpile "dot.chain") "dot.chain;"))
(is (= (transpile "make!") "make;"))
(is (= (transpile "red=blue") "redEqualBlue;"))
(is (= (transpile "red+blue") "redPlusBlue;"))
(is (= (transpile "red+blue") "redPlusBlue;"))
(is (= (transpile "->string") "toString;"))
(is (= (transpile "%a") "$a;"))
(is (= (transpile "what.man?.->you.**.=") "what.isMan.toYou.__.isEqual;"))
(is (= (transpile "foo/bar") "foo.bar;"))
(is (= (transpile "foo.bar/baz") "foo_bar.baz;"))
(is (= (transpile "js/window") "window;"))

;; =>
;; keywords

(is (= (transpile ":foo") "'foo';"))
(is (= (transpile ":foo/bar") "'foo/bar';"))
(is (= (transpile ":foo.bar/baz") "'foo.bar/baz';"))


;; =>
;; re-pattern

(is (= (transpile "#\"foo\"") "/foo/;"))
(is (= (transpile "#\"(?m)foo\"") "/foo/m;"))
(is (= (transpile "#\"(?i)foo\"") "/foo/i;"))
(is (= (transpile "#\"^$\"") "/^$/;"))
(is (= (transpile "#\"/.\"") "/\\/./;"))

;; =>
;; invoke forms

(is (= (transpile "(foo)")"foo();")
    "function calls compile")

(is (= (transpile "(foo bar)") "foo(bar);")
    "function calls with single arg compile")

(is (= (transpile "(foo bar baz)") "foo(bar, baz);")
    "function calls with multi arg compile")

(is (= (transpile "(foo ((bar baz) beep))")
       "foo(bar(baz)(beep));")
    "nested function calls compile")

(is (= (transpile "(beep name 4 \"hello\")")
       "beep(name, 4, 'hello');"))


(is (= (transpile "(swap! foo bar)")
       "swap(foo, bar);"))


(is (= (transpile "(create-server options)")
       "createServer(options);"))

(is (= (transpile "(.create-server http options)")
       "http.createServer(options);"))

;; =>
;; vectors

(is (= (transpile "[]")
"[];"))

(is (= (transpile "[a b]")
"[
    a,
    b
];"))


(is (= (transpile "[a (b c)]")
"[
    a,
    b(c)
];"))


;; =>
;; public defs

(is (= (transpile "(def x)")
       "var x = exports.x = void 0;")
    "def without initializer")

(is (= (transpile "(def y 1)")
       "var y = exports.y = 1;")
    "def with initializer")

(is (= (transpile "'(def x 1)")
       "list(symbol(void 0, 'def'), symbol(void 0, 'x'), 1);")
    "quoted def")

(is (= (transpile "(def a \"docs\" 1)")
       "var a = exports.a = 1;")
    "def is allowed an optional doc-string")

(is (= (transpile "(def ^{:private true :dynamic true} x 1)")
       "var x = 1;")
    "def with extended metadata")

(is (= (transpile "(def ^{:private true} a \"doc\" b)")
       "var a = b;")
    "def with metadata and docs")

(is (= (transpile "(def under_dog)")
       "var under_dog = exports.under_dog = void 0;"))

;; =>
;; private defs

(is (= (transpile "(def ^:private x)")
       "var x = void 0;"))

(is (= (transpile "(def ^:private y 1)")
       "var y = 1;"))


;; =>
;; throw


(is (= (transpile "(throw error)")
"(function () {
    throw error;
})();") "throw reference")

(is (= (transpile "(throw (Error message))")
"(function () {
    throw Error(message);
})();") "throw expression")

(is (= (transpile "(throw (Error. message))")
"(function () {
    throw new Error(message);
})();") "throw instance")


(is (= (transpile "(throw \"boom\")")
"(function () {
    throw 'boom';
})();") "throw string literal")

;; =>
;; new

(is (= (transpile "(new Type)")
       "new Type();"))

(is (= (transpile "(Type.)")
       "new Type();"))


(is (= (transpile "(new Point x y)")
       "new Point(x, y);"))

(is (= (transpile "(Point. x y)")
       "new Point(x, y);"))

;; =>
;; macro syntax

(is (thrown? (transpile "(.-field)")
             #"Malformed member expression, expecting \(.-member target\)"))

(is (thrown? (transpile "(.-field a b)")
             #"Malformed member expression, expecting \(.-member target\)"))

(is (= (transpile "(.-field object)")
       "object.field;"))

(is (= (transpile "(.-field (foo))")
       "foo().field;"))

(is (= (transpile "(.-field (foo bar))")
       "foo(bar).field;"))

(is (thrown? (transpile "(.substring)")
             #"Malformed method expression, expecting \(.method object ...\)"))

(is (= (transpile "(.substr text)")
       "text.substr();"))
(is (= (transpile "(.substr text 0)")
       "text.substr(0);"))
(is (= (transpile "(.substr text 0 5)")
       "text.substr(0, 5);"))
(is (= (transpile "(.substr (read file) 0 5)")
       "read(file).substr(0, 5);"))


(is (= (transpile "(.log console message)")
       "console.log(message);"))

(is (= (transpile "(.-location window)")
       "window.location;"))

(is (= (transpile "(.-foo? bar)")
       "bar.isFoo;"))

(is (= (transpile "(.-location (.open window url))")
       "window.open(url).location;"))

(is (= (transpile "(.slice (.splice arr 0))")
       "arr.splice(0).slice();"))

(is (= (transpile "(.a (.b \"/\"))")
       "'/'.b().a();"))

(is (= (transpile "(:foo bar)")
       "(bar || 0)['foo'];"))

;; =>
;; syntax quotes


(is (= (transpile "`(1 ~@'(2 3))")
       "list.apply(void 0, [1].concat(vec(list(2, 3))));"))

(is (= (transpile "`()")
       "list();"))

(is (= (transpile "`[1 ~@[2 3]]")
"[1].concat([
    2,
    3
]);"))

(is (= (transpile "`[]")
       "[];"))

(is (= (transpile "'()")
       "list();"))

(is (= (transpile "()")
       "list();"))

(is (= (transpile "'(1)")
       "list(1);"))

(is (= (transpile "'[]")
       "[];"))

;; =>
;; set!

(is (= (transpile "(set! x 1)")
       "x = 1;"))

(is (= (transpile "(set! x (foo bar 2))")
       "x = foo(bar, 2);"))

(is (= (transpile "(set! x (.m o))")
       "x = o.m();"))

(is (= (transpile "(set! (.-field object) x)")
       "object.field = x;"))

;; =>
;; aget


(is (thrown? (transpile "(aget foo)")
             #"Malformed aget expression expected \(aget object member\)"))

(is (= (transpile "(aget foo bar)")
       "foo[bar];"))

(is (= (transpile "(aget array 1)")
       "array[1];"))

(is (= (transpile "(aget json \"data\")")
       "json['data'];"))

(is (= (transpile "(aget foo (beep baz))")
       "foo[beep(baz)];"))

(is (= (transpile "(aget (beep foo) 'bar)")
       "beep(foo).bar;"))

(is (= (transpile "(aget (beep foo) (boop bar))")
       "beep(foo)[boop(bar)];"))

;; =>
;; functions


(is (= (transpile "(fn [] (+ x y))")
"(function () {
    return x + y;
});"))

;; =>

(is (= (transpile "(fn [x] (def y 7) (+ x y))")
"(function (x) {
    var y = 7;
    return x + y;
});"))

;; =>

(is (= (transpile "(fn [])")
"(function () {
    return void 0;
});"))

;; =>

(is (= (transpile "(fn ([]))")
"(function () {
    return void 0;
});"))

;; =>

(is (= (transpile "(fn ([]))")
"(function () {
    return void 0;
});"))

;; =>

(is (thrown? (transpile "(fn a b)")
             #"parameter declaration \(b\) must be a vector"))

;; =>

(is (thrown? (transpile "(fn a ())")
             #"parameter declaration \(\(\)\) must be a vector"))

;; =>

(is (thrown? (transpile "(fn a (b))")
             #"parameter declaration \(\(b\)\) must be a vector"))

;; =>

(is (thrown? (transpile "(fn)")
             #"parameter declaration \(nil\) must be a vector"))

;; =>

(is (thrown? (transpile "(fn {} a)")
             #"parameter declaration \({}\) must be a vector"))

;; =>

(is (thrown? (transpile "(fn ([]) a)")
             #"Malformed fn overload form"))

;; =>

(is (thrown? (transpile "(fn ([]) (a))")
             #"Malformed fn overload form"))

;; =>

(is (= (transpile "(fn [x] x)")
       "(function (x) {\n    return x;\n});")
    "function compiles")

;; =>

(is (= (transpile "(fn [x] (def y 1) (foo x y))")
       "(function (x) {\n    var y = 1;\n    return foo(x, y);\n});")
    "function with multiple statements compiles")

;; =>

(is (= (transpile "(fn identity [x] x)")
                  "(function identity(x) {\n    return x;\n});")
    "named function compiles")

;; =>

(is (thrown? (transpile "(fn \"doc\" a [x] x)")
             #"parameter declaration (.*) must be a vector"))

;; =>

(is (= (transpile "(fn foo? ^boolean [x] true)")
       "(function isFoo(x) {\n    return true;\n});")
    "metadata is supported")

;; =>

(is (= (transpile "(fn ^:static x [y] y)")
       "(function x(y) {\n    return y;\n});")
    "fn name metadata")

;; =>

(is (= (transpile "(fn [a & b] a)")
"(function (a) {
    var b = Array.prototype.slice.call(arguments, 1);
    return a;
});") "variadic function")

;; =>

(is (= (transpile "(fn [& a] a)")
"(function () {
    var a = Array.prototype.slice.call(arguments, 0);
    return a;
});") "function with all variadic arguments")


;; =>

(is (= (transpile "(fn
                     ([] 0)
                     ([x] x))")
"(function () {
    switch (arguments.length) {
    case 0:
        return 0;
    case 1:
        var x = arguments[0];
        return x;
    default:
        throw RangeError('Wrong number of arguments passed');
    }
});") "function with overloads")

;; =>

(is (= (transpile "(fn sum
                    ([] 0)
                    ([x] x)
                    ([x y] (+ x y))
                    ([x y & rest] (reduce sum
                                          (sum x y)
                                          rest)))")
"(function sum() {
    switch (arguments.length) {
    case 0:
        return 0;
    case 1:
        var x = arguments[0];
        return x;
    case 2:
        var x = arguments[0];
        var y = arguments[1];
        return x + y;
    default:
        var x = arguments[0];
        var y = arguments[1];
        var rest = Array.prototype.slice.call(arguments, 2);
        return reduce(sum, sum(x, y), rest);
    }
});") "variadic with overloads")


;; =>

(is (= (transpile "(fn vector->list [v] (make list v))")
"(function vectorToList(v) {
    return make(list, v);
});"))


;; =>
;; Conditionals

(is (thrown? (transpile "(if x)")
             #"Malformed if expression, too few operands"))

(is (= (transpile "(if x y)")
       "x ? y : void 0;"))

(is (= (transpile "(if foo (bar))")
       "foo ? bar() : void 0;")
    "if compiles")

(is (= (transpile "(if foo (bar) baz)")
       "foo ? bar() : baz;")
    "if-else compiles")

(is (= (transpile "(if monday? (.log console \"monday\"))")
       "isMonday ? console.log('monday') : void 0;")
    "macros inside blocks expand properly")

(is (= (transpile "(if a (make a))")
       "a ? make(a) : void 0;"))

(is (= (transpile "(if (if foo? bar) (make a))")
       "(isFoo ? bar : void 0) ? make(a) : void 0;"))

;; =>
;; Do


(is (= (transpile "(do (foo bar) bar)")
"(function () {
    foo(bar);
    return bar;
})();") "do compiles")

(is (= (transpile "(do)")
"(function () {
    return void 0;
})();") "empty do compiles")

(is (= (transpile "(do (buy milk) (sell honey))")
"(function () {
    buy(milk);
    return sell(honey);
})();"))

(is (= (transpile "(do
                    (def a 1)
                    (def a 2)
                    (plus a b))")
"(function () {
    var a = exports.a = 1;
    var a = exports.a = 2;
    return plus(a, b);
})();"))

(is (= (transpile "(fn [a]
                    (do
                      (def b 2)
                      (plus a b)))")
"(function (a) {
    return (function () {
        var b = 2;
        return plus(a, b);
    })();
});") "only top level defs are public")



;; Let

(is (= (transpile "(let [])")
"(function () {
    return void 0;
}.call(this));"))

;; =>

(is (= (transpile "(let [] x)")
"(function () {
    return x;
}.call(this));"))

;; =>

(is (= (transpile "(let [x 1 y 2] (+ x y))")
"(function () {
    var xø1 = 1;
    var yø1 = 2;
    return xø1 + yø1;
}.call(this));"))

;; =>

(is (= (transpile "(let [x y
                         y x]
                     [x y])")
"(function () {
    var xø1 = y;
    var yø1 = xø1;
    return [
        xø1,
        yø1
    ];
}.call(this));") "same named bindings can be used")

;; =>

(is (= (transpile "(let []
                     (+ x y))")
"(function () {
    return x + y;
}.call(this));"))

;; =>

(is (= (transpile "(let [x 1
                         y y]
                     (+ x y))")
"(function () {
    var xø1 = 1;
    var yø1 = y;
    return xø1 + yø1;
}.call(this));"))


;; =>

(is (= (transpile "(let [x 1
                         x (inc x)
                         x (dec x)]
                     (+ x 5))")
"(function () {
    var xø1 = 1;
    var xø2 = inc(xø1);
    var xø3 = dec(xø2);
    return xø3 + 5;
}.call(this));"))

;; =>

(is (= (transpile "(let [x 1
                         y (inc x)
                         x (dec x)]
                     (if x y (+ x 5)))")
"(function () {
    var xø1 = 1;
    var yø1 = inc(xø1);
    var xø2 = dec(xø1);
    return xø2 ? yø1 : xø2 + 5;
}.call(this));"))

;; =>

(is (= (transpile "(let [x x] (fn [] x))")
"(function () {
    var xø1 = x;
    return function () {
        return xø1;
    };
}.call(this));"))

;; =>

(is (= (transpile "(let [x x] (fn [x] x))")
"(function () {
    var xø1 = x;
    return function (x) {
        return x;
    };
}.call(this));"))

;; =>

(is (= (transpile "(let [x x] (fn x [] x))")
"(function () {
    var xø1 = x;
    return function x() {
        return x;
    };
}.call(this));"))

;; =>

(is (= (transpile "(let [x x] (< x 2))")
"(function () {
    var xø1 = x;
    return xø1 < 2;
}.call(this));") "macro forms inherit renaming")

;; =>

(is (= (transpile "(let [a a] a.a)")
"(function () {
    var aø1 = a;
    return aø1.a;
}.call(this));") "member targets also renamed")

;; =>

;; throw


(is (= (transpile "(throw)")
"(function () {
    throw void 0;
})();"))

;; =>

(is (= (transpile "(throw error)")
"(function () {
    throw error;
})();"))

;; =>

(is (= (transpile "(throw (Error message))")
"(function () {
    throw Error(message);
})();"))

;; =>

(is (= (transpile "(throw \"boom\")")
"(function () {
    throw 'boom';
})();"))

;; =>

(is (= (transpile "(throw (Error. message))")
"(function () {
    throw new Error(message);
})();"))

;; =>

;; TODO: Consider submitting a bug to clojure
;; to raise compile time error on such forms
(is (= (transpile "(throw a b)")
"(function () {
    throw a;
})();"))

;; =>
;; try



(is (= (transpile "(try
                     (/ 1 0)
                     (catch e
                       (console.error e)))")
"(function () {
    try {
        return 1 / 0;
    } catch (e) {
        return console.error(e);
    }
})();"))

;; =>


(is (= (transpile "(try
                     (/ 1 0)
                     (catch e (console.error e))
                     (finally (print \"final exception.\")))")
"(function () {
    try {
        return 1 / 0;
    } catch (e) {
        return console.error(e);
    } finally {
        return console.log('final exception.');
    }
})();"))

;; =>

(is (= (transpile "(try
                        (open file)
                        (read file)
                      (finally (close file)))")
"(function () {
    try {
        open(file);
        return read(file);
    } finally {
        return close(file);
    }
})();"))

;; =>


(is (= (transpile "(try)")
"(function () {
    try {
        return void 0;
    } finally {
    }
})();"))

;; =>

(is (= (transpile "(try me)")
"(function () {
    try {
        return me;
    } finally {
    }
})();"))

;; =>

(is (= (transpile "(try (boom) (catch error))")
"(function () {
    try {
        return boom();
    } catch (error) {
        return void 0;
    }
})();"))

;; =>

(is (= (transpile "(try (m 1 0) (catch e e))")
"(function () {
    try {
        return m(1, 0);
    } catch (e) {
        return e;
    }
})();"))

;; =>

(is (= (transpile "(try (m 1 0) (finally 0))")
"(function () {
    try {
        return m(1, 0);
    } finally {
        return 0;
    }
})();"))

;; =>


(is (= (transpile "(try (m 1 0) (catch e e) (finally 0))")
"(function () {
    try {
        return m(1, 0);
    } catch (e) {
        return e;
    } finally {
        return 0;
    }
})();"))

;; =>

;; loop


(is (= (transpile "(loop [x 10]
                        (if (< x 7)
                          (print x)
                          (recur (- x 2))))")
"(function loop() {
    var recur = loop;
    var xø1 = 10;
    do {
        recur = xø1 < 7 ? console.log(xø1) : (loop[0] = xø1 - 2, loop);
    } while (xø1 = loop[0], recur === loop);
    return recur;
}.call(this));"))

;; =>

(is (= (transpile "(loop [forms forms
                             result []]
                        (if (empty? forms)
                          result
                          (recur (rest forms)
                                 (conj result (process (first forms))))))")
"(function loop() {
    var recur = loop;
    var formsø1 = forms;
    var resultø1 = [];
    do {
        recur = isEmpty(formsø1) ? resultø1 : (loop[0] = rest(formsø1), loop[1] = conj(resultø1, process(first(formsø1))), loop);
    } while (formsø1 = loop[0], resultø1 = loop[1], recur === loop);
    return recur;
}.call(this));"))


;; =>
;; ns


(is (= (transpile "(ns foo.bar
                      \"hello world\"
                      (:require lib.a
                                [lib.b]
                                [lib.c :as c]
                                [lib.d :refer [foo bar]]
                                [lib.e :refer [beep baz] :as e]
                                [lib.f :refer [faz] :rename {faz saz}]
                                [lib.g :refer [beer] :rename {beer coffee} :as booze]))")

"{
    var _ns_ = {
            id: 'foo.bar',
            doc: 'hello world'
        };
    var lib_a = require('lib/a');
    var lib_b = require('lib/b');
    var lib_c = require('lib/c');
    var c = lib_c;
    var lib_d = require('lib/d');
    var foo = lib_d.foo;
    var bar = lib_d.bar;
    var lib_e = require('lib/e');
    var e = lib_e;
    var beep = lib_e.beep;
    var baz = lib_e.baz;
    var lib_f = require('lib/f');
    var saz = lib_f.faz;
    var lib_g = require('lib/g');
    var booze = lib_g;
    var coffee = lib_g.beer;
}"))

(is (= (transpile "(ns wisp.example.main
                         (:refer-clojure :exclude [macroexpand-1])
                         (:require [clojure.java.io]
                                   [wisp.example.dependency :as dep]
                                   [wisp.foo :as wisp.bar]
                                   [clojure.string :as string :refer [join split]]
                                   [wisp.sequence :refer [first rest] :rename {first car rest cdr}]
                                   [wisp.ast :as ast :refer [symbol] :rename {symbol ast-symbol}])
                         (:use-macros [cljs.analyzer-macros :only [disallowing-recur]]))")
"{
    var _ns_ = {
            id: 'wisp.example.main',
            doc: void 0
        };
    var clojure_java_io = require('clojure/java/io');
    var wisp_example_dependency = require('./dependency');
    var dep = wisp_example_dependency;
    var wisp_foo = require('./../foo');
    var wisp_bar = wisp_foo;
    var clojure_string = require('clojure/string');
    var string = clojure_string;
    var join = clojure_string.join;
    var split = clojure_string.split;
    var wisp_sequence = require('./../sequence');
    var car = wisp_sequence.first;
    var cdr = wisp_sequence.rest;
    var wisp_ast = require('./../ast');
    var ast = wisp_ast;
    var astSymbol = wisp_ast.symbol;
}"))

(is (= (transpile "(ns foo.bar)")
"{
    var _ns_ = {
            id: 'foo.bar',
            doc: void 0
        };
}"))

(is (= (transpile "(ns foo.bar \"my great lib\")")
"{
    var _ns_ = {
            id: 'foo.bar',
            doc: 'my great lib'
        };
}"))

;; =>
;; Logical operators

(is (= (transpile "(or)")
       "void 0;"))

(is (= (transpile "(or 1)")
       "1;"))

(is (= (transpile "(or 1 2)")
       "1 || 2;"))

(is (= (transpile "(or 1 2 3)")
       "1 || 2 || 3;"))

(is (= (transpile "(and)")
       "true;"))

(is (= (transpile "(and 1)")
       "1;"))

(is (= (transpile "(and 1 2)")
       "1 && 2;"))

(is (= (transpile "(and 1 2 a b)")
       "1 && 2 && a && b;"))

(is (thrown? (transpile "(not)")
             #"Wrong number of arguments \(0\) passed to: not"))

(is (= (transpile "(not x)")
       "!x;"))

(is (thrown? (transpile "(not x y)")
             #"Wrong number of arguments \(2\) passed to: not"))\

(is (= (transpile "(not (not x))")
       "!!x;"))

;; =>
;; Bitwise Operators


(is (thrown? (transpile "(bit-and)")
             #"Wrong number of arguments \(0\) passed to: bit-and"))

;; =>

(is (thrown? (transpile "(bit-and 1)")
             #"Wrong number of arguments \(1\) passed to: bit-and"))

;; =>


(is (= (transpile "(bit-and 1 0)")
       "1 & 0;"))

;; =>


(is (= (transpile "(bit-and 1 1 0)")
       "1 & 1 & 0;"))
;; =>


(is (thrown? (transpile "(bit-or)")
             #"Wrong number of arguments \(0\) passed to: bit-or"))
;; =>

(is (thrown? (transpile "(bit-or a)")
             #"Wrong number of arguments \(1\) passed to: bit-or"))
;; =>

(is (= (transpile "(bit-or a b)")
       "a | b;"))

;; =>


(is (= (transpile "(bit-or a b c d)")
       "a | b | c | d;"))

;; =>


(is (thrown? (transpile "(bit-xor)")
             #"Wrong number of arguments \(0\) passed to: bit-xor"))

;; =>

(is (thrown? (transpile "(bit-xor a)")
             #"Wrong number of arguments \(1\) passed to: bit-xor"))

;; =>


(is (= (transpile "(bit-xor a b)")
       "a ^ b;"))

;; =>

(is (= (transpile "(bit-xor 1 4 3)")
       "1 ^ 4 ^ 3;"))

;; =>


(is (thrown? (transpile "(bit-not)")
             #"Wrong number of arguments \(0\) passed to: bit-not"))
;; =>

(is (= (transpile "(bit-not 4)")
       "~4;"))

;; =>

(is (thrown? (transpile "(bit-not 4 5)")
             #"Wrong number of arguments \(2\) passed to: bit-not"))

;; =>


(is (thrown? (transpile "(bit-shift-left)")
             #"Wrong number of arguments \(0\) passed to: bit-shift-left"))

;; =>

(is (thrown? (transpile "(bit-shift-left a)")
             #"Wrong number of arguments \(1\) passed to: bit-shift-left"))
;; =>

(is (= (transpile "(bit-shift-left 1 4)")
       "1 << 4;"))

;; =>

(is (= (transpile "(bit-shift-left 1 4 3)")
       "1 << 4 << 3;"))


;; =>

;; Comparison operators

(is (thrown? (transpile "(<)")
             #"Wrong number of arguments \(0\) passed to: <"))

;; =>


(is (= (transpile "(< (foo))")
       "foo(), true;"))

;; =>

(is (= (transpile "(< x y)")
       "x < y;"))

;; =>

(is (= (transpile "(< a b c)")
       "a < b && b < c;"))

;; =>


(is (= (transpile "(< a b c d e)")
       "a < b && b < c && c < d && d < e;"))

;; =>


(is (thrown? (transpile "(>)")
             #"Wrong number of arguments \(0\) passed to: >"))

;; =>


(is (= (transpile "(> (foo))")
       "foo(), true;"))

;; =>

(is (= (transpile "(> x y)")
       "x > y;"))

;; =>

(is (= (transpile "(> a b c)")
       "a > b && b > c;"))

;; =>


(is (= (transpile "(> a b c d e)")
       "a > b && b > c && c > d && d > e;"))


;; =>


(is (thrown? (transpile "(<=)")
             #"Wrong number of arguments \(0\) passed to: <="))

;; =>


(is (= (transpile "(<= (foo))")
       "foo(), true;"))

;; =>

(is (= (transpile "(<= x y)")
       "x <= y;"))

;; =>

(is (= (transpile "(<= a b c)")
       "a <= b && b <= c;"))

;; =>


(is (= (transpile "(<= a b c d e)")
       "a <= b && b <= c && c <= d && d <= e;"))

;; =>

(is (thrown? (transpile "(>=)")
             #"Wrong number of arguments \(0\) passed to: >="))

;; =>


(is (= (transpile "(>= (foo))")
       "foo(), true;"))

;; =>

(is (= (transpile "(>= x y)")
       "x >= y;"))

;; =>

(is (= (transpile "(>= a b c)")
       "a >= b && b >= c;"))

;; =>


(is (= (transpile "(>= a b c d e)")
       "a >= b && b >= c && c >= d && d >= e;"))

;; =>



(is (= (transpile "(not= x y)")
       (transpile "(not (= x y))")))

;; =>


(is (thrown? (transpile "(identical?)")
             #"Wrong number of arguments \(0\) passed to: identical?"))


;; =>

(is (thrown? (transpile "(identical? x)")
             #"Wrong number of arguments \(1\) passed to: identical?"))

;; =>

(is (= (transpile "(identical? x y)")
       "x === y;"))

;; =>

;; This does not makes sence but let's let's stay compatible
;; with clojure and hop that it will be fixed.
;; http://dev.clojure.org/jira/browse/CLJ-1219
(is (thrown? (transpile "(identical? x y z)")
             #"Wrong number of arguments \(3\) passed to: identical?"))

;; =>

;; Arithmetic operators


(is (= (transpile "(+)")
       "0;"))
;; =>

(is (= (transpile "(+ 1)")
       "0 + 1;"))

;; =>

(is (= (transpile "(+ -1)")
       "0 + -1;"))

;; =>

(is (= (transpile "(+ 1 2)")
       "1 + 2;"))

;; =>

(is (= (transpile "(+ 1 2 3 4 5)")
       "1 + 2 + 3 + 4 + 5;"))

;; =>

(is (thrown? (transpile "(-)")
             #"Wrong number of arguments \(0\) passed to: -"))

;; =>


(is (= (transpile "(- 1)")
       "0 - 1;"))
;; =>


(is (= (transpile "(- 4 1)")
       "4 - 1;"))

;; =>

(is (= (transpile "(- 4 1 5 7)")
       "4 - 1 - 5 - 7;"))

;; =>

(is (thrown? (transpile "(mod)")
             #"Wrong number of arguments \(0\) passed to: mod"))
;; =>

(is (thrown? (transpile "(mod 1)")
             #"Wrong number of arguments \(1\) passed to: mod"))

;; =>

(is (= (transpile "(mod 1 2)")
       "1 % 2;"))
;; =>

(is (thrown? (transpile "(/)")
             #"Wrong number of arguments \(0\) passed to: /"))
;; =>


(is (= (transpile "(/ 2)")
       "1 / 2;"))

;; =>


(is (= (transpile "(/ 1 2)")
       "1 / 2;"))
;; =>


(is (= (transpile "(/ 1 2 3)")
       "1 / 2 / 3;"))

;; instance?


(is (thrown? (transpile "(instance?)")
             #"Wrong number of arguments \(0\) passed to: instance?"))

;; =>

(is (= (transpile "(instance? Number)")
       "void 0 instanceof Number;"))

;; =>

(is (= (transpile "(instance? Number (Number. 1))")
       "new Number(1) instanceof Number;"))

;; =>

;; Such instance? expression should probably throw
;; exception rather than ignore `y`. Waiting on
;; response for a clojure bug:
;; http://dev.clojure.org/jira/browse/CLJ-1220
(is (= (transpile "(instance? Number x y)")
       "x instanceof Number;"))

;; =>


(is (= (transpile "(defprotocol IFoo)")
"{
    var IFoo = exports.IFoo = { wisp_core$IProtocol$id: 'user.wisp/IFoo' };
    IFoo;
}") "protocol defined")

(is (= (transpile "(defprotocol IBar \"optional docs\")")
"{
    var IBar = exports.IBar = { wisp_core$IProtocol$id: 'user.wisp/IBar' };
    IBar;
}") "optionally docs can be provided")


(is (= (transpile
"(defprotocol ISeq
  (-first [coll])
  (^clj -rest [coll]))")
"{
    var ISeq = exports.ISeq = {
            wisp_core$IProtocol$id: 'user.wisp/ISeq',
            _first: function user_wisp$ISeq$First(self) {
                var f = self === null ? user_wisp$ISeq$First.nil : self === void 0 ? user_wisp$ISeq$First.nil : 'else' ? self.user_wisp$ISeq$First || user_wisp$ISeq$First[Object.prototype.toString.call(self).replace('[object ', '').replace(/\\]$/, '')] || user_wisp$ISeq$First._ : void 0;
                return f.apply(self, arguments);
            },
            _rest: function user_wisp$ISeq$Rest(self) {
                var f = self === null ? user_wisp$ISeq$Rest.nil : self === void 0 ? user_wisp$ISeq$Rest.nil : 'else' ? self.user_wisp$ISeq$Rest || user_wisp$ISeq$Rest[Object.prototype.toString.call(self).replace('[object ', '').replace(/\\]$/, '')] || user_wisp$ISeq$Rest._ : void 0;
                return f.apply(self, arguments);
            }
        };
    var _first = exports._first = ISeq._first;
    var _rest = exports._rest = ISeq._rest;
    ISeq;
}") "methods can are also generated & exported")

(is (= (transpile
"(ns wisp.core)
(defprotocol ISeq
  (-first [coll])
  (^clj -rest [coll]))
")
"{
    var _ns_ = {
            id: 'wisp.core',
            doc: void 0
        };
}
{
    var ISeq = exports.ISeq = {
            wisp_core$IProtocol$id: 'wisp.core/ISeq',
            _first: function wisp_core$ISeq$First(self) {
                var f = self === null ? wisp_core$ISeq$First.nil : self === void 0 ? wisp_core$ISeq$First.nil : 'else' ? self.wisp_core$ISeq$First || wisp_core$ISeq$First[Object.prototype.toString.call(self).replace('[object ', '').replace(/\\]$/, '')] || wisp_core$ISeq$First._ : void 0;
                return f.apply(self, arguments);
            },
            _rest: function wisp_core$ISeq$Rest(self) {
                var f = self === null ? wisp_core$ISeq$Rest.nil : self === void 0 ? wisp_core$ISeq$Rest.nil : 'else' ? self.wisp_core$ISeq$Rest || wisp_core$ISeq$Rest[Object.prototype.toString.call(self).replace('[object ', '').replace(/\\]$/, '')] || wisp_core$ISeq$Rest._ : void 0;
                return f.apply(self, arguments);
            }
        };
    var _first = exports._first = ISeq._first;
    var _rest = exports._rest = ISeq._rest;
    ISeq;
}") "method names take into account defined namespace")


(is (= (transpile
"(defprotocol ^:private Fn
  \"Marker protocol\")")
"{
    var Fn = { wisp_core$IProtocol$id: 'user.wisp/Fn' };
    Fn;
}") "protocol defs can be private")

(is (= (transpile
"(defprotocol ^:private IFooBar
  (^:private foo [])
  (bar []))")
"{
    var IFooBar = {
            wisp_core$IProtocol$id: 'user.wisp/IFooBar',
            foo: function user_wisp$IFooBar$foo(self) {
                var f = self === null ? user_wisp$IFooBar$foo.nil : self === void 0 ? user_wisp$IFooBar$foo.nil : 'else' ? self.user_wisp$IFooBar$foo || user_wisp$IFooBar$foo[Object.prototype.toString.call(self).replace('[object ', '').replace(/\\]$/, '')] || user_wisp$IFooBar$foo._ : void 0;
                return f.apply(self, arguments);
            },
            bar: function user_wisp$IFooBar$bar(self) {
                var f = self === null ? user_wisp$IFooBar$bar.nil : self === void 0 ? user_wisp$IFooBar$bar.nil : 'else' ? self.user_wisp$IFooBar$bar || user_wisp$IFooBar$bar[Object.prototype.toString.call(self).replace('[object ', '').replace(/\\]$/, '')] || user_wisp$IFooBar$bar._ : void 0;
                return f.apply(self, arguments);
            }
        };
    var foo = IFooBar.foo;
    var bar = exports.bar = IFooBar.bar;
    IFooBar;
}") "protocol methods can be private")

(is (= (transpile
"(defprotocol ICounted
  (^number -count [coll] \"constant time count\"))")
"{
    var ICounted = exports.ICounted = {
            wisp_core$IProtocol$id: 'user.wisp/ICounted',
            _count: function user_wisp$ICounted$Count(self) {
                var f = self === null ? user_wisp$ICounted$Count.nil : self === void 0 ? user_wisp$ICounted$Count.nil : 'else' ? self.user_wisp$ICounted$Count || user_wisp$ICounted$Count[Object.prototype.toString.call(self).replace('[object ', '').replace(/\\]$/, '')] || user_wisp$ICounted$Count._ : void 0;
                return f.apply(self, arguments);
            }
        };
    var _count = exports._count = ICounted._count;
    ICounted;
}") "protocol methods with docs")

(is (= (transpile "(defrecord Employee [name surname])")
"var Employee = exports.Employee = (function () {
        var Employee = function Employee(name, surname) {
            this.name = name;
            this.surname = surname;
            return this;
        };
        return Employee;
    })();") "simple record")

(is (= (transpile
"(defrecord Employee [name surname]
  Object
  (toString [_] (str name \" \" surname))
  User
  (greet [_] (str \"Hi \" name)))")
"var Employee = exports.Employee = (function () {
        var Employee = function Employee(name, surname) {
            this.name = name;
            this.surname = surname;
            return this;
        };
        Employee.prototype[Object.wisp_core$IProtocol$id] = true;
        Employee.prototype.toString = function (_) {
            var name = this.name;
            var surname = this.surname;
            return '' + name + ' ' + surname;
        };
        Employee.prototype[User.wisp_core$IProtocol$id] = true;
        Employee.prototype[User.greet.name] = function (_) {
            var name = this.name;
            var surname = this.surname;
            return '' + 'Hi ' + name;
        };
        return Employee;
    })();") "more advance record implementing protocols")

(is (= (transpile
"(deftype Reduced [val]
  IDeref
  (-deref [o] val))")
"var Reduced = exports.Reduced = (function () {
        var Reduced = function Reduced(val) {
            this.val = val;
            return this;
        };
        Reduced.prototype[IDeref.wisp_core$IProtocol$id] = true;
        Reduced.prototype[IDeref._deref.name] = function (o) {
            var val = this.val;
            return val;
        };
        return Reduced;
    })();") "method with one type")

(is (= (transpile
"(deftype Point [x y]
  Object
  (toJSON [_] [x y]))")
"var Point = exports.Point = (function () {
        var Point = function Point(x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        Point.prototype[Object.wisp_core$IProtocol$id] = true;
        Point.prototype.toJSON = function (_) {
            var x = this.x;
            var y = this.y;
            return [
                x,
                y
            ];
        };
        return Point;
    })();") "Object methods names are kept as is")

(is (= (transpile
"(deftype Point [x y]
  Object
  (toJSON [_] [x y])
  JSON
  (toJSON [] {:x x :y y}))")
"var Point = exports.Point = (function () {
        var Point = function Point(x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        Point.prototype[Object.wisp_core$IProtocol$id] = true;
        Point.prototype.toJSON = function (_) {
            var x = this.x;
            var y = this.y;
            return [
                x,
                y
            ];
        };
        Point.prototype[JSON.wisp_core$IProtocol$id] = true;
        Point.prototype[JSON.toJSON.name] = function () {
            var x = this.x;
            var y = this.y;
            return {
                'x': x,
                'y': y
            };
        };
        return Point;
    })();") "Non Object protocol method names taken from protocol")

(is (= (transpile
"(extend-type number
  IEquiv
  (-equiv [x o] (identical? x o)))")
"(function () {
    IEquiv.wisp_core$IProtocol$Number = true;
    IEquiv._equiv.Number = function (x, o) {
        return x === o;
    };
    return void 0;
})();") "extend type")

(is (= (transpile
"(extend-type nil
  ICounted
  (-count [_] 0))")
"(function () {
    ICounted.wisp_core$IProtocol$nil = true;
    ICounted._count.nil = function (_) {
        return 0;
    };
    return void 0;
})();") "extend type works with nil")

(is (= (transpile
"(extend-type default
  IHash
  (-hash [o]
    (getUID o)))")
"(function () {
    IHash.wisp_core$IProtocol$_ = true;
    IHash._hash._ = function (o) {
        return getUID(o);
    };
    return void 0;
})();") "extend default type")

(is (= (transpile
"(extend-type Set ICounted)")
"(function () {
    Set.prototype[ICounted.wisp_core$IProtocol$id] = true;
    return void 0;
})();") "implement protocol without methods")

(is (= (transpile
"(extend-protocol ISeq
  List
  (first [list] (:head list))
  (rest [list] (:rest list))
  nil
  (first [_] nil)
  (rest [_] ())
  Array
  (first [array] (aget array 0))
  (rest [array] (.slice array 1)))")
"(function () {
    (function () {
        Array.prototype[ISeq.wisp_core$IProtocol$id] = true;
        Array.prototype[ISeq.first.name] = function (array) {
            return array[0];
        };
        Array.prototype[ISeq.rest.name] = function (array) {
            return array.slice(1);
        };
        return void 0;
    })();
    (function () {
        ISeq.wisp_core$IProtocol$nil = true;
        ISeq.first.nil = function (_) {
            return void 0;
        };
        ISeq.rest.nil = function (_) {
            return list();
        };
        return void 0;
    })();
    (function () {
        List.prototype[ISeq.wisp_core$IProtocol$id] = true;
        List.prototype[ISeq.first.name] = function (list) {
            return (list || 0)['head'];
        };
        List.prototype[ISeq.rest.name] = function (list) {
            return (list || 0)['rest'];
        };
        return void 0;
    })();
    return void 0;
})();") "extend protocol expands to extent-type calls")

(is (= (transpile
"(extend-protocol IFoo
  nil
  Number
  String)")
"(function () {
    (function () {
        String.prototype[IFoo.wisp_core$IProtocol$id] = true;
        return void 0;
    })();
    (function () {
        Number.prototype[IFoo.wisp_core$IProtocol$id] = true;
        return void 0;
    })();
    (function () {
        IFoo.wisp_core$IProtocol$nil = true;
        return void 0;
    })();
    return void 0;
})();") "extend protocol without methods")
