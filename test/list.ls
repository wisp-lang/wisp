(include "./macros")
(import (empty? first rest cons list? list reverse reduce-list) "../src/list")

(test
 ("list?"
    (assert (list? (list)) "() is list")
    (assert (not (list? 2)) "2 is not list")
    (assert (not (list? {})) "{} is not list")
    ;(assert (not (list? [])) "[] is not list")
    )

 ("list"
  (equal? (empty? (list 1 2 3 4)) false
          "non empty list returns false on empty?")

  (equal? (.-length (list 1 2 3 4)) 4
          "list has expected length")

  (equal? (first (list 1 2 3 4)) 1
          "first returns first item in the list")

  (deep-equal? (rest (list 1 2 3 4)) (list 2 3 4)
               "rest returns rest items")

  (equal? (.to-string (list 1 2 3 4)) "(1 2 3 4)"
          "stringification returs list")

  (assert (empty? (list))
          "list without arguments creates empty list"))


 ("cons"
  (equal? (empty? (cons 1 (list))) false
          "cons creates non-empty list")

  (deep-equal? (cons 1 (list 2 3)) (list 1 2 3)
               "cons returns new list prefixed with first argument"))

 ("reverse"
  (deep-equal? (reverse (list 1 2 3 4)) (list 4 3 2 1)
               "reverse reverses order of items"))

 ("first rest"
         (assert (empty? (rest (list)))
                 "rest of the empty list is empty list")

         (deep-equal? (rest (rest (list))) (list)
                      "multiple rests still return empty list"))


 ("list"
  (equal? (empty? (list 1 2 3 4)) false
          "non empty list returns false on empty?")

  (equal? (.-length (list 1 2 3 4)) 4
          "list has expected length")

  (equal? (first (list 1 2 3 4)) 1
          "first returns first item in the list")

  (deep-equal? (rest (list 1 2 3 4)) (list 2 3 4)
               "rest returns rest items")

  (equal? (.to-string (list 1 2 3 4)) "(1 2 3 4)"
          "stringification returs list")

  (assert (empty? (list))
          "list without arguments creates empty list"))

 ("cons"
  (equal? (empty? (cons 1 (list))) false
          "cons creates non-empty list")

  (deep-equal? (cons 1 (list 2 3)) (list 1 2 3)
               "cons returns new list prefixed with first argument"))

 ("reduce"
  (assert (=
            (reduce-list
              (list 1 2 3 4)
              (fn [result v] (+ result v)))
            10)
            "initial value is optional")

  (assert (=
            (reduce-list
              (list)
              (fn [result v] (+ result v))
              5)
            5)
            "initial value is returned for empty list")

  (assert (=
            (reduce-list
              (list 1)
              (fn [result v] (+ result v))
              5)
            6)
            "works with single item")
  (assert (=
            (reduce-list
              (list 5)
              (fn [result v] (+ result v)))
            5)
            "works with single item & no initial")))
