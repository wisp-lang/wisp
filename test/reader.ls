(include "./macros")
(import (read-from-string) "../src/reader")
(import (list) "../src/list")

(test
  ("read simple list"
    (equal?
      (.to-string (read-from-string "(foo bar)"))
      "(\uFDD1'foo \uFDD1'bar)"
      "(foo bar) -> (\uFDD1'foo \uFDD1'bar)"))

  ("read comma is a whitespace"
    (equal?
      (.to-string (read-from-string "(foo, bar)"))
      "(\uFDD1'foo \uFDD1'bar)"
      "(foo, bar) -> (\uFDD1'foo \uFDD1'bar)"))

  ("read numbers"
    (equal?
      (.to-string (read-from-string "(+ 1 2)"))
      "(\uFDD1'+ 1 2)"
      "(+ 1 2) -> (\uFDD1'+ 1 2)"))

  ("read keywords"
    (equal?
      (.to-string (read-from-string "(foo :bar)"))
      "(\uFDD1'foo \uFDD0'bar)"
      "(foo :bar) -> (\uFDD1'foo \uFDD0'bar)"))


  ("read quoted list"
    (equal?
      (.to-string (read-from-string "'(foo bar)"))
      "(quote (\uFDD1'foo \uFDD1'bar))"
      "'(foo bar) -> (quote (\uFDD1'foo \uFDD1'bar))"))

  ("read vector"
    (deep-equal?
      (read-from-string "(foo [bar :baz 2])")
      (list "\uFDD1'foo" (Array "\uFDD1'bar" "\uFDD0'baz" 2))
      "(foo [bar :baz 2]) -> (\uFDD1'foo [\uFDD1'bar \uFDD0'baz 2]"))

  ("read special symbols"
    (deep-equal?
      (read-from-string "(true false nil)")
      (list true false undefined)
      "(true false nil) -> (true false undefined)"))

  ("read chars"
    (deep-equal?
      (read-from-string "(\\x \\y \\z)")
      (list "x" "y" "z")
      "(\\x \\y \\z) -> (\"x\" \"y\" \"z\")"))

  ("read strings"
    (deep-equal?
      (read-from-string "(\"hello world\" \"hi \\\n there\")")
      (list "hello world" "hi \n there")
      "strings are read precisely"))

  ("read deref"
    (equal?
      (.to-string (read-from-string "(+ @foo 2)"))
      "(\uFDD1'+ (deref \uFDD1'foo) 2)"
      "(+ @foo 2) -> (\uFDD1'+ (deref \uFDD1'foo) 2)"))




  )
