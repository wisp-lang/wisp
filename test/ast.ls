(include "./macros")
(import [read-from-string] "../src/reader")
(import [list] "../src/list")
(import [name gensym symbol? symbol keyword? keyword
         quote? quote syntax-quote? syntax-quote] "../src/ast")

(def read read-from-string)

;; Some form are not supported by a current reader, so they are
;; commented out and new reader is used to read those. 

(test
   ("gensym"
    (assert (symbol? (gensym))
            "gensym generates symbol")
    (assert (.substr (name (gensym)) 0 3) "G__"
            "global symbols are prefixed with 'G__'")
    (assert (not (identical? (name (gensym)) (name (gensym))))
            "gensym generates unique symbol each time")
    (assert (.substr (name (gensym "foo")) 0 3) "foo"
            "if prefix is given symbol is prefixed with it")
    (assert (not (identical? (name (gensym "p")) (name (gensym "p"))))
            "gensym generates unique symbol even if prefixed"))

  ("quote?"
    (assert (quote? ;'()) "'() is quoted list")
                    (read "'()")) "'() is quoted list")
    (assert (not (quote? ;`())) "'() is not quoted list")
                         (read "`()"))) "'() is not quoted list")
    (assert (not (quote? ;())) "() is not quoted list")
                         (read "()"))) "() is not quoted list")
    (assert (quote? ;'foo) "'foo is quoted symbol")
                    (read "'foo")) "'foo is quoted symbol")
    (assert (not (quote? ;foo)) "foo symbol is not quoted"))
                         (read "foo"))) "foo symbol is not quoted"))


  ("syntax-quote?"
    (assert (syntax-quote? ;`()) "`() is syntax quoted list")
                           (read "`()")) "`() is syntax quoted list")
    (assert (not (syntax-quote? ;'())) "'() is not syntax quoted list")
                                (read "'()"))) "'() is not syntax quoted list")

    (assert (not (syntax-quote? ;())) "() is not syntax quoted list")
                                (read "()"))) "() is not syntax quoted list")
    (assert (syntax-quote? ;`foo) "`foo is syntax quoted symbol")
                           (read "`foo")) "`foo is syntax quoted symbol")
    (assert (not (syntax-quote? ;'foo)) "'foo symbol is not syntax quoted")
                                (read "'foo"))) "'foo symbol is not syntax quoted")
    (assert (not (syntax-quote? ;foo)) "foo symbol is not syntax quoted"))
                                (read "foo"))) "foo symbol is not syntax quoted"))


   )

