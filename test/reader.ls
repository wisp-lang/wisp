(include "./macros")
(import (read-from-string list symbol quote deref
         keyword unquote unquote-splicing meta dictionary) "../src/reader")
(import (list) "../src/list")

(def read-string read-from-string)

(test
  ("read simple list"
    (deep-equal?
      (read-string "(foo bar)")
      (list (symbol "foo") (symbol "bar"))
      "(foo bar) -> (foo bar)"))

  ("read comma is a whitespace"
    (deep-equal?
      (read-string "(foo, bar)")
      (list (symbol "foo") (symbol "bar"))
      "(foo, bar) -> (foo bar)"))

  ("read numbers"
    (deep-equal?
      (read-string "(+ 1 2)")
      (list (symbol "+") 1 2)
      "(+ 1 2) -> (+ 1 2)"))

  ("read keywords"
    (deep-equal?
      (read-string "(foo :bar)")
      (list (symbol "foo") (keyword "bar"))
      "(foo :bar) -> (foo :bar)"))


  ("read quoted list"
    (deep-equal?
      (read-string "'(foo bar)")
      (list quote (list (symbol "foo") (symbol "bar")))
      "'(foo bar) -> (quote (foo bar))"))

  ("read vector"
    (deep-equal?
      (read-string "(foo [bar :baz 2])")
      (list (symbol "foo") (array (symbol "bar") (keyword "baz") 2))
      "(foo [bar :baz 2]) -> (foo [bar :baz 2])"))

  ("read special symbols"
    (deep-equal?
      (read-string "(true false nil)")
      (list true false undefined)
      "(true false nil) -> (true false undefined)"))

  ("read chars"
    (deep-equal?
      (read-string "(\\x \\y \\z)")
      (list "x" "y" "z")
      "(\\x \\y \\z) -> (\"x\" \"y\" \"z\")"))

  ("read strings"
    (deep-equal?
      (read-string "(\"hello world\" \"hi \\\n there\")")
      (list "hello world" "hi \n there")
      "strings are read precisely"))

  ("read deref"
    (deep-equal?
      (read-string "(+ @foo 2)")
      (list (symbol "+") (list deref (symbol "foo")) 2)
      "(+ @foo 2) -> (+ (deref foo) 2)"))

  ("read unquote"
   (deep-equal?
    (read-string "(~foo ~@bar ~(baz))")
    (list (list unquote (symbol "foo"))
          (list unquote-splicing (symbol "bar"))
          (list unquote (list (symbol "baz"))))
    "(~foo ~@bar ~(baz)) -> ((unquote foo) (unquote-splicing bar) (unquote (baz))")
   (deep-equal?
    (read-string "(~@(foo bar))")
    (list (list unquote-splicing (list (symbol "foo") (symbol "bar"))))
    "(~@(foo bar)) -> ((unquote-splicing (foo bar)))"))

  ("clojurescript"
    (assert (= 1 (read-string "1")) "1 -> 1")
    (assert (= 2 (read-string "2")) "#_nope 2 -> 2")
    (assert (= -1 (read-string "-1")) "-1 -> -1")

    ;(assert (= (parse-float "-1.5") (read-string "-1.5")))
    (deep-equal? (array 3 4) (read-string "[3 4]") "[3 4] -> [3 4]")
    (assert (= "foo" (read-string "\"foo\"")) "\"foo\" -> \"foo\"")
    (assert (= (keyword "hello") (read-string ":hello")) ":hello -> :hello")
    (deep-equal? (symbol "goodbye") (read-string "goodbye") "goodbye -> goodbye")
    (deep-equal? (list (symbol "set") 1 2 3) (read-string "#{1 2 3}")
                 "#{1 2 3} -> (set 1 2 3)")
    (deep-equal? (list 7 8 9) (read-string "(7 8 9)") "(7 8 9) -> (7 8 9)")
    (deep-equal? (list deref (symbol "foo")) (read-string "@foo")
                 "@foo -> (deref foo)")
    (deep-equal? (list quote (symbol "bar")) (read-string "'bar")
                 "'bar -> (quote bar)")
    (deep-equal? (symbol "foo" "bar") (read-string "foo/bar")
                 "foo/bar -> foo/bar")
    (assert (= "a" (read-string "\\a")) "\\a -> \"a\"")
    (deep-equal? (dictionary (keyword "tag") (symbol "String"))
                 (meta (read-string "^String {:a 1}"))
                 "(meta ^String {:a 1}) -> {:tag String}")
    (deep-equal? (array (keyword "a")
                        (symbol "b")
                        (list (symbol "set") (symbol "c")
                              (dictionary (keyword "d")
                                          (array (keyword "e")
                                                 (keyword "f")
                                                 (keyword "g")))))
                 (read-string "[:a b #{c {:d [:e :f :g]}}]")
                 "[:a b #{c {:d [:e :f :g]}}] -> [:a b (set c {:d [:e :f :g]})]")
    (assert (= (keyword "foo" "bar") (read-string ":foo/bar"))
            ":foo/bar -> :foo/bar")
    (assert (= undefined (read-string "nil")) "nil -> undefined")
    (assert (= true (read-string "true")) "true -> true")
    (assert (= false (read-string "false")) "false -> false")
    (assert (= "string" (read-string "\"string\"")) "\"string\" -> \"string\"")

    (deep-equal? (list (symbol "new") (symbol "PersistentQueue") (array))
                 (read-string "#queue []")
                 "#queue [] -> (new PersistentQueue [])")

    (deep-equal? (list (symbol "new") (symbol "PersistentQueue") (array 1))
                 (read-string "#queue [1]")
                 "#queue [1] -> (new PersistentQueue [1])")

      )


  )
