(import [empty? first rest cons list? list reverse
         reduce-list sort-list concat-list] "../src/list")
(import [equivalent?] "./utils")



(.log console "test list?")

(assert (list? '()) "'() is list")
(assert (not (list? 2)) "2 is not list")
(assert (not (list? {})) "{} is not list")
(assert (not (list? [])) "[] is not list")

(.log console "test list quoting")

(assert (not (empty? '(1 2 3 4)))
        "non empty list returns false on empty?")

(assert (= (.-length '(1 2 3 4)) 4)
        "list has expected length")

(assert (= (first (list 1 2 3 4)) 1)
        "first returns first item in the list")

(assert (equivalent? (rest '(1 2 3 4)) '(2 3 4))
        "rest returns rest items")

(assert (identical? (.to-string '(1 2 3 4)) "(1 2 3 4)")
        "stringification returns list")

(assert (empty? '()) "list without arguments creates empty list")


(.log console "test cons")

(assert (not (empty? (cons 1 '()))) "cons creates non-empty list")

(assert (equivalent? (cons 1 '(2 3)) '(1 2 3))
        "cons returns new list prefixed with first argument")


(.log console "test reverse")

(assert (equivalent? (reverse '(1 2 3 4)) '(4 3 2 1))
        "reverse reverses order of items")

(.log console "test first / rest")


(assert (empty? (rest '())) "rest of the empty list is empty list")
(assert (equivalent? (rest (rest '())) '())
        "multiple rests still return empty list")


(.log console "test list constructor")

(assert (not (empty? (list 1 2 3 4)))
        "non empty list returns false on empty?")

(assert (= (.-length (list 1 2 3 4)) 4)
        "list has expected length")

(assert (= (first (list 1 2 3 4)) 1)
        "first returns first item in the list")

(assert (equivalent? (rest (list 1 2 3 4)) (list 2 3 4))
        "rest returns rest items")

(assert (identical? (.to-string (list 1 2 3 4)) "(1 2 3 4)")
        "stringification returs list")

(assert (empty? (list)) "list without arguments creates empty list")

(.log console "test cons")

(assert (not (empty? (cons 1 (list)))) "cons creates non-empty list")

(assert (equivalent? (cons 1 (list 2 3)) (list 1 2 3))
        "cons returns new list prefixed with first argument")

(.log console "test reduce-list")

(assert (= (reduce-list '(1 2 3 4) (fn [result v] (+ result v))) 10)
        "initial value is optional")

(assert (= (reduce-list '() (fn [result v] (+ result v)) 5) 5)
        "initial value is returned for empty list")

(assert (= (reduce-list '(1) (fn [result v] (+ result v)) 5) 6)
        "works with single item")

(assert (= (reduce-list '(5) (fn [result v] (+ result v))) 5)
        "works with single item & no initial")

(.log console "test sort")

(assert (equivalent? (sort-list '(3 1 2 4)) '(1 2 3 4))
        "sorts list by number comparison")

(assert (equivalent? (sort-list '(3 1 2 4) (fn [a b] (> a b)))
                     '(4 3 2 1))
        "sorts list by number comparison fn")

(assert (equivalent? (sort-list '("hello" "my" "dear" "frient"))
                     '("dear" "frient" "hello" "my"))
        "sorts list strings")

(.log console "test concat")

(assert (equivalent? (concat-list '(1 2) '(3 4))
                     '(1 2 3 4)))
(assert (equivalent? (concat-list '(1 2) '() '() '(3 4) '(5))
                     '(1 2 3 4 5)))
