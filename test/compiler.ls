(include "./macros")
(import [symbol] "../src/ast")
(import [list] "../src/list")
(import [self-evaluating? compile macroexpand macroexpand-1] "../src/compiler")
(import [read-from-string] "../src/reader")

(def nil)

(defn transpile
  [source]
  (compile (macroexpand (read-from-string source))))

(test
   ("self evaluating forms"
    (assert (self-evaluating? 1) "number is self evaluating")
    (assert (self-evaluating? "string") "string is self evaluating")
    (assert (self-evaluating? true) "true is boolean => self evaluating")
    (assert (self-evaluating? false) "false is boolean => self evaluating")
    (assert (self-evaluating?) "no args is nil => self evaluating")
    (assert (self-evaluating? nil) "nil is self evaluating")
    (assert (self-evaluating? :keyword) "keyword is self evaluating")
    (assert (not (self-evaluating? (list))) "list is not self evaluating")
    (assert (not (self-evaluating? self-evaluating?)) "fn is not self evaluating")
    (assert (not (self-evaluating? (symbol "symbol"))) "symbol is not self evaluating"))

  ("compile primitive forms"
    (assert (identical? (transpile "(def x)") "var x = void 0")
            "def compiles properly")
    (assert (identical? (transpile "(def y 1)") "var y = 1")
            "def with two args compiled properly")
    (assert (identical? (transpile "'(def x 1)") "(list)(def, x, 1)")
            "quotes preserve lists")

    (assert (identical? (transpile "(foo)") "(foo)()")
             "function calls compile")
    (assert (identical? (transpile "(foo bar)") "(foo)(bar)")
             "function calls with single arg compile")
    (assert (identical? (transpile "(foo bar baz)") "(foo)(bar, baz)")
            "function calls with multi arg compile")
    (assert (identical? (transpile "(foo ((bar baz) beep))")
                        "(foo)(((bar)(baz))(beep))")
             "nested function calls compile")


    (assert (identical? (transpile "(fn [x] x)")
                        "function(x) {\n  return x;\n}")
            "function compiles")

    (assert (identical? (transpile "(fn [x] (def y 1) (foo x y))")
                        "function(x) {\n  var y = 1;\n  return (foo)(x, y);\n}")
            "function with multiple statements compiles")

    (assert (identical? (transpile "(if foo (bar))")
                        "foo ?\n  (bar)() :\n  void 0")
             "if compiles")

    (assert (identical? (transpile "(if foo (bar) baz)")
                        "foo ?\n  (bar)() :\n  baz")
             "if-else compiles")


    (assert (identical? (transpile "(do (foo bar) bar)")
                        "(function() {\n  (foo)(bar);\n  return bar;\n})()")
             "do compiles")
    (assert (identical? (transpile "(do)")
                        "(function() {\n  return void 0;\n})()")
             "empty do compiles")


    (assert (identical? (transpile "(let [] x)")
                        "(function() {\n  return x;\n})()")
            "let bindings compiles properly")
    (assert (identical?
              (transpile "(let [x 1 y 2] x)")
              "(function() {\n  var x = 1;\n  var y = 2;\n  return x;\n})()")
            "let with bindings compiles properly")


    (assert (identical? (transpile "(throw error)")
                        "(function() { throw error; })()")
            "throw reference compiles")

    (assert (identical? (transpile "(throw (Error message))")
                        "(function() { throw (Error)(message); })()")
            "throw expression compiles")

    (assert (identical? (transpile "(throw \"boom\")")
                        "(function() { throw \"boom\"; })()")
            "throw string compile")

    (assert (identical? (transpile "(set! x 1)")
            "x = 1")
            "set! compiles")

    (assert (identical? (transpile "(set! x (foo bar 2))")
            "x = (foo)(bar, 2)")
            "set! with value expression compiles")

    (assert (identical? (transpile "[a b]")
            "[a, b]")
            "vector compiles")

    (assert (identical? (transpile "[a (b c)]")
            "[a, (b)(c)]")
            "vector of expressions compiles")

    (assert (identical? (transpile "[]")
            "[]")
            "empty vector compiles")
    )
)

