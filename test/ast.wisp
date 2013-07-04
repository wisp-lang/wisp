(ns wisp.test.ast
  (:require [wisp.test.util :refe [is thrown?]]
            [wisp.src.reader :refer [read-from-string]]
            [wisp.src.sequence :refer [list]]
            [wisp.src.runtime :refer [str =]]
            [wisp.src.ast :refer [name gensym symbol? symbol keyword? keyword
                                  quote? quote syntax-quote? syntax-quote]]))

(def read-string read-from-string)


(is (symbol? (gensym))
        "gensym generates symbol")
(is (identical? (.substr (name (gensym)) 0 3) "G__")
    "global symbols are prefixed with 'G__'")
(is (not (identical? (name (gensym)) (name (gensym))))
        "gensym generates unique symbol each time")
(is (identical? (.substr (name (gensym "foo")) 0 3) "foo")
    "if prefix is given symbol is prefixed with it")
(is (not (identical? (name (gensym "p")) (name (gensym "p"))))
        "gensym generates unique symbol even if prefixed")


(is (quote? (read-string "'()")) "'() is quoted list")
(is (not (quote? (read-string "`()"))) "'() is not quoted list")
(is (not (quote? (read-string "()"))) "() is not quoted list")

(is (quote? (read-string "'foo")) "'foo is quoted symbol")
(is (not (quote? (read-string "foo"))) "foo symbol is not quoted")

(is (syntax-quote? (read-string "`()")) "`() is syntax quoted list")
(is (not (syntax-quote?
          (read-string "'()"))) "'() is not syntax quoted list")

(is (not (syntax-quote?
              (read-string "()"))) "() is not syntax quoted list")
(is (syntax-quote? (read-string "`foo")) "`foo is syntax quoted symbol")
(is (not (syntax-quote?
          (read-string "'foo"))) "'foo symbol is not syntax quoted")
(is (not (syntax-quote?
          (read-string "foo"))) "foo symbol is not syntax quoted")


(is (symbol? (symbol "foo")))
(is (symbol? (symbol "/")))
(is (symbol? (symbol "")))
(is (symbol? (symbol "foo" "bar")))

(is (= "foo" (name (symbol "foo"))))
(is (= "/" (name (symbol "/"))))
; TODO: fix
; (assert (= "" (name (symbol ""))))
(is (= "bar" (name (symbol "foo" "bar"))))
