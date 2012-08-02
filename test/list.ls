(import (empty? first rest cons list reverse) "../src/list")

(.log console "running tests")

(set!
 (get exports "test list")
 (fn [assert]
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
             "stringification returs list"))))

