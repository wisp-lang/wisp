(import (empty? first rest cons list reverse) "../src/list")

(test "list"
   (let [actual (list 1 2 3 4)]
     (.equal assert (empty? actual) false
             "non empty list returns false on empty?")

     (.equal assert (.-length actual) 4
             "list has expected length")

     (.equal assert (first actual) 1
             "first returns first item in the list")

     (.deep-equal assert (rest actual) (list 2 3 4)
             "rest returns rest items")

     (.equal assert (.to-string actual) "(1 2 3 4)"
             "stringification returs list")

     (.ok assert (empty? (list))
                 "list without arguments creates empty list")

     ))

(test "cons"
  (.equal assert
          (empty? (cons 1 (list)))
          false
          "cons creates non-empty list")

  (.deep-equal assert
               (cons 1 (list 2 3))
               (list 1 2 3)
               "cons returns new list prefixed with first argument"))

(test "reverse"
  (.deep-equal assert
               (reverse (list 1 2 3 4))
               (list 4 3 2 1)
               "reverse reverses order of items"))

(test "first rest"
      (.equal assert (empty? (rest (list))) true
              "rest of the empty list is empty list")

      (.deep-equal assert
              (rest (rest (list)))
              (list)
              "multiple rests still return empty list"))
