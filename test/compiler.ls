(include "./macros")
(import [symbol] "../src/ast")
(import [list] "../src/list")
(import [self-evaluating?] "../src/compiler")

(def nil)

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
    (assert (not (self-evaluating? (symbol "symbol"))) "symbol is not self evaluating")))

