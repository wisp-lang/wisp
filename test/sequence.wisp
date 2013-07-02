(ns wisp.test.sequence
  (:require [wisp.src.sequence :refer [cons conj list list? seq vec empty?
                                       count first second third rest last
                                       butlast take drop repeat concat reverse
                                       sort map filter reduce assoc every?
                                       some partition interleave nth]]
            [wisp.src.runtime :refer [str inc dec even? odd? vals =]]))


(print "test empty?")

(assert (empty? "") "\"\" is empty")
(assert (empty? []) "[] is empty")
(assert (empty? nil) "nil is empty")
(assert (empty? {}) "{} is empty")
(assert (empty? '()) "'() is empty")

(print "test count")

(assert (= (count "") 0) "count 0 in \"\"")
(assert (= (count "hello") 5) "count 5 in \"hello\"")
(assert (= (count []) 0) "count 0 in []")
(assert (= (count [1 2 3 "hi"]) 4) "1 2 3 \"hi\"")
(assert (= (count nil) 0) "count 0 in nil")
(assert (= (count {}) 0) "count 0 in {}")
(assert (= (count {:hello :world}) 1) "count 1 in {:hello :world}")
(assert (= (count '()) 0) "count 0 in '()")
(assert (= (count '(1 2)) 2) "count 2 in '(1 2)")

(print "test first")

(assert (= nil (first nil)))
(assert (= nil (first "")))
(assert (= \h (first "hello")))
(assert (= nil (first [])))
(assert (= 1 (first [1 2 3])))
(assert (= nil (first '())))
(assert (= \a (first '(\a \b \c))))
(assert (= nil (first {})))
(assert (= [:a 1] (first {:a 1, :b 2})))

(print "test second")

(assert (= nil (second nil)))
(assert (= nil (second "")))
(assert (= nil (second "h")))
(assert (= \e (second "hello")))
(assert (= nil (second [])))
(assert (= nil (second [1])))
(assert (= 2 (second [1 2 3])))
(assert (= nil (second '())))
(assert (= nil (second '(:a))))
(assert (= \b (second '(\a \b \c))))
(assert (= nil (second {})))
(assert (= nil (second {:a 1})))
(assert (= [:b 2] (second {:a 1, :b 2})))

(print "test third")

(assert (= nil (third nil)))
(assert (= nil (third "")))
(assert (= nil (third "h")))
(assert (= \l (third "hello")))
(assert (= nil (third [])))
(assert (= nil (third [1])))
(assert (= 3 (third [1 2 3])))
(assert (= nil (third '())))
(assert (= nil (third '(:a))))
(assert (= \c (third '(\a \b \c))))
(assert (= nil (third {})))
(assert (= nil (third {:a 1})))
(assert (= [:c 3] (third {:a 1, :b 2, :c 3})))

(print "test last")

(assert (= nil (last nil)))
(assert (= nil (last [])))
(assert (= 3 (last [1 2 3])))
(assert (= \o (last "hello")))
(assert (= nil (last "")))
(assert (= \c (last '(\a \b \c))))
(assert (= nil (last '())))
(assert (= \c (last '(\a \b \c))))
(assert (= [:b 2] (last {:a 1, :b 2})))
(assert (= nil (last {})))

(print "test butlast")

(assert (= nil (butlast nil)))

(assert (= nil (butlast '())))
(assert (= nil (butlast '(1))))
(assert (= '(1 2) (butlast '(1 2 3))))

(assert (= nil (butlast [])))
(assert (= nil (butlast [1])))
(assert (= [1 2] (butlast [1 2 3])))

(assert (= nil (butlast {})))
(assert (= nil (butlast {:a 1})))
(assert (= [[:a 1]] (butlast {:a 1, :b 2})))


(print "test rest")

(assert (= [] (rest {:a 1})))
(assert (= "" (rest "a")))
(assert (= '(2 3 4) (rest '(1 2 3 4))))
(assert (= [2 3] (rest [1 2 3])))
(assert (= [[:b 2]] (rest {:a 1 :b 2})))
(assert (= "ello" (rest "hello")))



(assert (= '() (rest nil)))
(assert (= '() (rest '())))
(assert (= [] (rest [1])))
(assert (= [] (rest {:a 1})))
(assert (= "" (rest "a")))
(assert (= '(2 3 4) (rest '(1 2 3 4))))
(assert (= [2 3] (rest [1 2 3])))
(assert (= [[:b 2]] (rest {:a 1 :b 2})))
(assert (= "ello" (rest "hello")))


(print "test list?")

(assert (list? '()) "'() is list")
(assert (not (list? 2)) "2 is not list")
(assert (not (list? {})) "{} is not list")
(assert (not (list? [])) "[] is not list")

(print "test list quoting")

(assert (not (empty? '(1 2 3 4)))
        "non empty list returns false on empty?")

(assert (= (count '(1 2 3 4)) 4)
        "list has expected length")

(assert (= (first (list 1 2 3 4)) 1)
        "first returns first item in the list")

(assert (= (rest '(1 2 3 4)) '(2 3 4))
        "rest returns rest items")

(assert (identical? (str '(1 2 3 4)) "(1 2 3 4)")
        "stringification returns list")


(print "test cons")

(assert (not (empty? (cons 1 '()))) "cons creates non-empty list")
(assert (not (empty? (cons 1 nil))) "cons onto nil is list of that item")
(assert (= (cons 1 nil) '(1)))
(assert (= 1 (first (cons 1 nil))))
(assert (= '() (rest (cons 1 nil))))
(assert (= (cons 1 '(2 3)) '(1 2 3))
        "cons returns new list prefixed with first argument")
(assert (not (empty? (cons 1 (list)))) "cons creates non-empty list")
(assert (= (cons 1 (list 2 3)) (list 1 2 3))
        "cons returns new list prefixed with first argument")

(print "test conj")

(assert (= '(1) (conj nil 1)))
(assert (= '(2 1) (conj nil 1 2)))
(assert (= '(1) (conj '() 1)))
(assert (= '(2 1) (conj '() 1 2)))
(assert (= '(4 1 2 3) (conj '(1 2 3) 4)))
(assert (= [1] (conj [] 1)))
(assert (= [1 2] (conj [] 1 2)))
(assert (= ["a" "b" "c" "d"] (conj ["a" "b" "c"] "d")))
(assert (= [1 2 3 4] (conj [1 2] 3 4)))
(assert (= [[1 2] [3 4] [5 6]] (conj [[1 2] [3 4]] [5 6])))
(assert (= {:nationality "Chinese", :age 25
            :firstname "John", :lastname "Doe"}
           (conj {:firstname "John" :lastname "Doe"}
                 {:age 25 :nationality "Chinese"})))
;; TODO fix this test
;; (assert (= {5 6, 1 2, 3 4} (conj {1 2, 3 4} [5 6])))

(assert (not (empty? (cons 1 nil)))
        "cons onto nil is list of that item")
(assert (= (cons 1 nil) '(1)))
(assert (= 1 (first (cons 1 nil))))
(assert (= '() (rest (cons 1 nil))))
(assert (= (cons 1 '(2 3)) '(1 2 3))
        "cons returns new list prefixed with first argument")
(assert (not (empty? (cons 1 (list)))) "cons creates non-empty list")
(assert (= (cons 1 (list 2 3)) (list 1 2 3))
        "cons returns new list prefixed with first argument")



(print "test reverse")

(assert (= (reverse '(1 2 3 4)) '(4 3 2 1))
        "reverse reverses order of items")
(assert (= [1 2 3 4] (reverse [4 3 2 1])))
(assert (= '() (reverse nil)))
(assert (= [[:b 2] [:a 1]] (reverse {:a 1, :b 2})))



(print "test list constructor")

(assert (not (empty? (list 1 2 3 4)))
        "non empty list returns false on empty?")
(assert (= (count (list 1 2 3 4)) 4)
        "list has expected length")
(assert (= (first (list 1 2 3 4)) 1)
        "first returns first item in the list")
(assert (= (rest (list 1 2 3 4)) (list 2 3 4))
        "rest returns rest items")
(assert (identical? (str (list 1 2 3 4)) "(1 2 3 4)")
        "stringification returs list")
(assert (empty? (list)) "list without arguments creates empty list")


(print "test vec")

(assert (= [1 2 3] (vec '(1 2 3))))
(assert (= [1 2 3] (vec [1 2 3])))
(assert (= [] (vec '())))
(assert (= [] (vec nil)))
(assert (= [\f \o \o] (vec "foo")))
(assert (= [[:a 1] [:b 2]] (vec {:a 1 :b 2})))

(print "test map")

(assert (= '() (map inc nil)))
(assert (= '() (map inc '())))
(assert (= [] (map inc [])))
(assert (= [] (map inc {})))
(assert (= '(2 3 4) (map inc '(1 2 3))))
(assert (= [2 3 4 5 6] (map inc [1 2 3 4 5])))
(assert (= [(str :a 1), (str :b 2)]
           (map (fn [pair] (apply str pair)) {:a 1 :b 2})))


(print "test filter")

(assert (= '() (filter even? nil)))
(assert (= '() (filter even? '())))
(assert (= [] (filter even? [])))
(assert (= [] (filter even? {})))
(assert (= [2 4] (filter even? [1 2 3 4])))
(assert (= '(2 4) (filter even? '(1 2 3 4))))
(assert (= [[:b 2]] (filter (fn [pair] (even? (second pair))) {:a 1 :b 2})))


(print "test reduce")

(assert (= (reduce (fn [result v] (+ result v)) '(1 2 3 4)) 10)
        "initial value is optional")

(assert (= (reduce (fn [result v] (+ result v)) [1 2 3 4]) 10)
        "initial value is optional")

(assert (= (reduce (fn [result v] (+ result v)) 5 '()) 5)
        "initial value is returned for empty list")
(assert (= (reduce (fn [result v] (+ result v)) 5 []) 5))

(assert (= (reduce (fn [result v] (+ result v)) 5 nil) 5)
        "initial value is returned for empty list")

(assert (= (reduce (fn [result v] (+ result v)) 5 '(1)) 6)
        "works with single item")
(assert (= (reduce (fn [result v] (+ result v)) 5 [1]) 6))

(assert (= (reduce (fn [result v] (+ result v)) '(5)) 5)
        "works with single item & no initial")

(assert (= (reduce (fn [result v] (+ result v)) [5]) 5))

(print "test take")

(assert (= '() (take 1 nil)))
(assert (= '() (take 1 '())))
(assert (= [] (take 2 "")))
(assert (= [] (take 2 {})))

(assert (= [\f \o] (take 2 "foo")))
(assert (= '(1 2) (take 2 '(1 2 3 4))))
(assert (= [1 2 3] (take 3 [1 2 3 4])))
(assert (= [[:a 1] [:b 2]] (take 2 {:a 1 :b 2 :c 3})))


(print "test drop")

(assert (= '() (drop 1 nil) ))
(assert (= '() (drop 1 '())))
(assert (= [] (drop 1 [])))
(assert (= '(1 2 3) (drop -1 '(1 2 3))))
(assert (= [1 2 3 4] (drop -1 [1 2 3 4])))
(assert (= '(1 2 3) (drop 0 '(1 2 3))))
(assert (= [1 2 3 4] (drop 0 [1 2 3 4])))
(assert (= '(3 4) (drop 2 '(1 2 3 4))))
(assert (= [2 3 4] (drop 1 [1 2 3 4])))



(print "test concat")

(assert (= '(1 2 3 4) (concat '(1 2) '(3 4))))
(assert (= '(1 2 3 4 5) (concat '(1 2) '() '() '(3 4) '(5))))
(assert (= '(1 2 3 4) (concat [1 2] [3 4])))
(assert (= (list :a :b 1 [2 3] 4) (concat [:a :b] nil [1 [2 3] 4])))
(assert (= (list 1 2 3 4 [:a 1] [:b 2])
           (concat [1] [2] '(3 4) {:a 1, :b 2})))
(assert (= (list :a :b 1 [2 3] 4)
           (concat [:a :b] nil [1 [2 3] 4])))
(assert (= (list 1 2 3 4 5 6 7 [:a 9] [:b 10])
           (concat [1] [2] '(3 4) [5 6 7] {:a 9 :b 10})))


(print "test sort")

(assert (= '() (sort nil)))
(assert (= '() (sort (fn [a b] (> a b)) nil)))

(assert (= [] (sort [])))
(assert (= [1 2 3 4] (sort [3 1 2 4])))
(assert (= [ 10, 5, 2 ]
           (sort (fn [a b] (> a b)) (vals {:foo 5, :bar 2, :baz 10}))))

(assert (= [[:c 3] [:a 2] [:b 1]]
           (sort (fn [a b] (> (last a) (last b))) {:b 1 :c 3 :a  2})))

(assert (= '(1 2 3 4) (sort '(3 1 2 4))))
(assert (= '(4 3 2 1) (sort (fn [a b] (> a b)) '(3 1 2 4))))
(assert (= '("dear" "frient" "hello" "my")
            (sort '("hello" "my" "dear" "frient"))))

(assert (= [7 7 7 7] (repeat 4 7)))
(assert (= [] (repeat 0 7)))
(assert (= [] (repeat -1 7)))
(assert (= [7] (repeat 1 7)))

(print "test assoc")

(assert (= {:a :b} (assoc {} :a :b)))
(assert (= {:a :b :c :d} (assoc {:a :b} :c :d)))
(assert (= {:a :c} (assoc {:a :b} :a :c)))

(print "test every?")

(assert (every? even? [2 4 6 8]))
(assert (not (every? even? [2 4 6 8 9])))
(assert (every? even? '(2 4 6 8)))
(assert (not (every? even? '(2 4 5))))

(print "test some")

(assert (= false (some even? [])))
(assert (= false (some even? ())))
(assert (= false (some even? [1 3 5 7])))
(assert (= false (some even? '(1 3 5 7))))
(assert (some even? [1 2 3]))
(assert (some even? '(1 2 3)))

(print "test partition")


(assert (= [[1 2] [3 4] [5 6] [7 8]]
           (partition 2 [1 2 3 4 5 6 7 8 9])))

(assert (= [[1 2 3] [3 4 5] [5 6 7] [7 8 9]]
           (partition 3 2 [1 2 3 4 5 6 7 8 9])))

(assert (= [[1 2 3 4 5] [3 4 5 6 7] [5 6 7 8 :a]]
           (partition 5 2 [:a :b :c :d] [1 2 3 4 5 6 7 8])))

(assert (= [[1 2 3] [3 4 5] [5 6 7] [7 8 :a]]
           (partition 3 2 [:a :b :c :d] [1 2 3 4 5 6 7 8])))

(print "test interleave")

(assert (= [1 4 2 5 3 6]
           (interleave [1 2 3]
                       [4 5 6])))

(assert (= [1 4 2 5 3 6]
           (interleave [1 2 3]
                       '(4 5 6))))


(assert (= [1 4 2 5 3 6]
           (interleave '(1 2 3)
                       [4 5 6])))

(assert (= [1 4 2 5 3 6]
           (interleave [1 2 3 3.5]
                       [4 5 6])))

(assert (= [1 4 2 5 3 6]
           (interleave [1 2 3]
                       [4 5 6 7])))

(assert (= []
           (interleave [1 2 3]
                       [])))

(assert (= []
           (interleave []
                       [4 5 6])))

(assert (= []
           (interleave [1 2 3]
                       [4 5 6 7]
                       [])))
(assert (= '(1 4 8)
           (interleave [1 2 3]
                       [4 5 6 7]
                       [8])))

(assert (= '(1 4 8 2 5 9)
           (interleave [1 2 3]
                       [4 5 6 7]
                       [8 9])))

(assert (= '(1 4 8 2 5 9 3 6 10)
           (interleave [1 2 3]
                       [4 5 6 7]
                       [8 9 10])))

(assert (= '(1 4 8 2 5 9 3 6 10)
           (interleave [1 2 3]
                       [4 5 6 7]
                       [8 9 10 11])))

(print "test nth")

(assert (= (nth nil 1) nil))
(assert (= (nth nil 1 :not-found) :not-found))
(assert (= (nth "hello" 2) \l))
(assert (= (nth '(1 2 3 4) 3) 4))
(assert (= (nth '(1 2 3 4) 0) 1))
(assert (= (nth [1 2 3 4] 3) 4))
(assert (= (nth [1 2 3 4] 4) nil))
(assert (= (nth [1 2 3 4] 2) 3))
(assert (= (nth [1 2 3 4] 0) 1))
(assert (= (nth (seq {:foo 1 :bar 2}) 1) [:bar 2]))
