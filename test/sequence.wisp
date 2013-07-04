(ns wisp.test.sequence
  (:require [wisp.test.util :refer [is thrown?]]
            [wisp.src.sequence :refer [cons conj list list? seq vec empty?
                                       count first second third rest last
                                       butlast take drop repeat concat reverse
                                       sort map filter reduce assoc every?
                                       some partition interleave nth]]
            [wisp.src.runtime :refer [str inc dec even? odd? vals =]]))



(is (empty? "") "\"\" is empty")
(is (empty? []) "[] is empty")
(is (empty? nil) "nil is empty")
(is (empty? {}) "{} is empty")
(is (empty? '()) "'() is empty")


(is (= (count "") 0) "count 0 in \"\"")
(is (= (count "hello") 5) "count 5 in \"hello\"")
(is (= (count []) 0) "count 0 in []")
(is (= (count [1 2 3 "hi"]) 4) "1 2 3 \"hi\"")
(is (= (count nil) 0) "count 0 in nil")
(is (= (count {}) 0) "count 0 in {}")
(is (= (count {:hello :world}) 1) "count 1 in {:hello :world}")
(is (= (count '()) 0) "count 0 in '()")
(is (= (count '(1 2)) 2) "count 2 in '(1 2)")


(is (= nil (first nil)))
(is (= nil (first "")))
(is (= \h (first "hello")))
(is (= nil (first [])))
(is (= 1 (first [1 2 3])))
(is (= nil (first '())))
(is (= \a (first '(\a \b \c))))
(is (= nil (first {})))
(is (= [:a 1] (first {:a 1, :b 2})))


(is (= nil (second nil)))
(is (= nil (second "")))
(is (= nil (second "h")))
(is (= \e (second "hello")))
(is (= nil (second [])))
(is (= nil (second [1])))
(is (= 2 (second [1 2 3])))
(is (= nil (second '())))
(is (= nil (second '(:a))))
(is (= \b (second '(\a \b \c))))
(is (= nil (second {})))
(is (= nil (second {:a 1})))
(is (= [:b 2] (second {:a 1, :b 2})))


(is (= nil (third nil)))
(is (= nil (third "")))
(is (= nil (third "h")))
(is (= \l (third "hello")))
(is (= nil (third [])))
(is (= nil (third [1])))
(is (= 3 (third [1 2 3])))
(is (= nil (third '())))
(is (= nil (third '(:a))))
(is (= \c (third '(\a \b \c))))
(is (= nil (third {})))
(is (= nil (third {:a 1})))
(is (= [:c 3] (third {:a 1, :b 2, :c 3})))


(is (= nil (last nil)))
(is (= nil (last [])))
(is (= 3 (last [1 2 3])))
(is (= \o (last "hello")))
(is (= nil (last "")))
(is (= \c (last '(\a \b \c))))
(is (= nil (last '())))
(is (= \c (last '(\a \b \c))))
(is (= [:b 2] (last {:a 1, :b 2})))
(is (= nil (last {})))


(is (= nil (butlast nil)))

(is (= nil (butlast '())))
(is (= nil (butlast '(1))))
(is (= '(1 2) (butlast '(1 2 3))))

(is (= nil (butlast [])))
(is (= nil (butlast [1])))
(is (= [1 2] (butlast [1 2 3])))

(is (= nil (butlast {})))
(is (= nil (butlast {:a 1})))
(is (= [[:a 1]] (butlast {:a 1, :b 2})))



(is (= [] (rest {:a 1})))
(is (= "" (rest "a")))
(is (= '(2 3 4) (rest '(1 2 3 4))))
(is (= [2 3] (rest [1 2 3])))
(is (= [[:b 2]] (rest {:a 1 :b 2})))
(is (= "ello" (rest "hello")))



(is (= '() (rest nil)))
(is (= '() (rest '())))
(is (= [] (rest [1])))
(is (= [] (rest {:a 1})))
(is (= "" (rest "a")))
(is (= '(2 3 4) (rest '(1 2 3 4))))
(is (= [2 3] (rest [1 2 3])))
(is (= [[:b 2]] (rest {:a 1 :b 2})))
(is (= "ello" (rest "hello")))



(is (list? '()) "'() is list")
(is (not (list? 2)) "2 is not list")
(is (not (list? {})) "{} is not list")
(is (not (list? [])) "[] is not list")


(is (not (empty? '(1 2 3 4)))
    "non empty list returns false on empty?")

(is (= (count '(1 2 3 4)) 4)
    "list has expected length")

(is (= (first (list 1 2 3 4)) 1)
    "first returns first item in the list")

(is (= (rest '(1 2 3 4)) '(2 3 4))
    "rest returns rest items")

(is (identical? (str '(1 2 3 4)) "(1 2 3 4)")
    "stringification returns list")



(is (not (empty? (cons 1 '()))) "cons creates non-empty list")
(is (not (empty? (cons 1 nil))) "cons onto nil is list of that item")
(is (= (cons 1 nil) '(1)))
(is (= 1 (first (cons 1 nil))))
(is (= '() (rest (cons 1 nil))))
(is (= (cons 1 '(2 3)) '(1 2 3))
    "cons returns new list prefixed with first argument")
(is (not (empty? (cons 1 (list)))) "cons creates non-empty list")
(is (= (cons 1 (list 2 3)) (list 1 2 3))
    "cons returns new list prefixed with first argument")


(is (= '(1) (conj nil 1)))
(is (= '(2 1) (conj nil 1 2)))
(is (= '(1) (conj '() 1)))
(is (= '(2 1) (conj '() 1 2)))
(is (= '(4 1 2 3) (conj '(1 2 3) 4)))
(is (= [1] (conj [] 1)))
(is (= [1 2] (conj [] 1 2)))
(is (= ["a" "b" "c" "d"] (conj ["a" "b" "c"] "d")))
(is (= [1 2 3 4] (conj [1 2] 3 4)))
(is (= [[1 2] [3 4] [5 6]] (conj [[1 2] [3 4]] [5 6])))
(is (= {:nationality "Chinese", :age 25
        :firstname "John", :lastname "Doe"}
       (conj {:firstname "John" :lastname "Doe"}
             {:age 25 :nationality "Chinese"})))
;; TODO fix this test
;; (is (= {5 6, 1 2, 3 4} (conj {1 2, 3 4} [5 6])))

(is (not (empty? (cons 1 nil)))
    "cons onto nil is list of that item")
(is (= (cons 1 nil) '(1)))
(is (= 1 (first (cons 1 nil))))
(is (= '() (rest (cons 1 nil))))
(is (= (cons 1 '(2 3)) '(1 2 3))
    "cons returns new list prefixed with first argument")
(is (not (empty? (cons 1 (list)))) "cons creates non-empty list")
(is (= (cons 1 (list 2 3)) (list 1 2 3))
    "cons returns new list prefixed with first argument")




(is (= (reverse '(1 2 3 4)) '(4 3 2 1))
    "reverse reverses order of items")
(is (= [1 2 3 4] (reverse [4 3 2 1])))
(is (= '() (reverse nil)))
(is (= [[:b 2] [:a 1]] (reverse {:a 1, :b 2})))




(is (not (empty? (list 1 2 3 4)))
    "non empty list returns false on empty?")
(is (= (count (list 1 2 3 4)) 4)
    "list has expected length")
(is (= (first (list 1 2 3 4)) 1)
    "first returns first item in the list")
(is (= (rest (list 1 2 3 4)) (list 2 3 4))
    "rest returns rest items")
(is (identical? (str (list 1 2 3 4)) "(1 2 3 4)")
    "stringification returs list")
(is (empty? (list)) "list without arguments creates empty list")



(is (= [1 2 3] (vec '(1 2 3))))
(is (= [1 2 3] (vec [1 2 3])))
(is (= [] (vec '())))
(is (= [] (vec nil)))
(is (= [\f \o \o] (vec "foo")))
(is (= [[:a 1] [:b 2]] (vec {:a 1 :b 2})))


(is (= '() (map inc nil)))
(is (= '() (map inc '())))
(is (= [] (map inc [])))
(is (= [] (map inc {})))
(is (= '(2 3 4) (map inc '(1 2 3))))
(is (= [2 3 4 5 6] (map inc [1 2 3 4 5])))
(is (= [(str :a 1), (str :b 2)]
       (map (fn [pair] (apply str pair)) {:a 1 :b 2})))



(is (= '() (filter even? nil)))
(is (= '() (filter even? '())))
(is (= [] (filter even? [])))
(is (= [] (filter even? {})))
(is (= [2 4] (filter even? [1 2 3 4])))
(is (= '(2 4) (filter even? '(1 2 3 4))))
(is (= [[:b 2]] (filter (fn [pair] (even? (second pair))) {:a 1 :b 2})))



(is (= (reduce (fn [result v] (+ result v)) '(1 2 3 4)) 10)
    "initial value is optional")

(is (= (reduce (fn [result v] (+ result v)) [1 2 3 4]) 10)
    "initial value is optional")

(is (= (reduce (fn [result v] (+ result v)) 5 '()) 5)
    "initial value is returned for empty list")
(is (= (reduce (fn [result v] (+ result v)) 5 []) 5))

(is (= (reduce (fn [result v] (+ result v)) 5 nil) 5)
    "initial value is returned for empty list")

(is (= (reduce (fn [result v] (+ result v)) 5 '(1)) 6)
    "works with single item")
(is (= (reduce (fn [result v] (+ result v)) 5 [1]) 6))

(is (= (reduce (fn [result v] (+ result v)) '(5)) 5)
    "works with single item & no initial")

(is (= (reduce (fn [result v] (+ result v)) [5]) 5))


(is (= '() (take 1 nil)))
(is (= '() (take 1 '())))
(is (= [] (take 2 "")))
(is (= [] (take 2 {})))

(is (= [\f \o] (take 2 "foo")))
(is (= '(1 2) (take 2 '(1 2 3 4))))
(is (= [1 2 3] (take 3 [1 2 3 4])))
(is (= [[:a 1] [:b 2]] (take 2 {:a 1 :b 2 :c 3})))



(is (= '() (drop 1 nil) ))
(is (= '() (drop 1 '())))
(is (= [] (drop 1 [])))
(is (= '(1 2 3) (drop -1 '(1 2 3))))
(is (= [1 2 3 4] (drop -1 [1 2 3 4])))
(is (= '(1 2 3) (drop 0 '(1 2 3))))
(is (= [1 2 3 4] (drop 0 [1 2 3 4])))
(is (= '(3 4) (drop 2 '(1 2 3 4))))
(is (= [2 3 4] (drop 1 [1 2 3 4])))




(is (= '(1 2 3 4) (concat '(1 2) '(3 4))))
(is (= '(1 2 3 4 5) (concat '(1 2) '() '() '(3 4) '(5))))
(is (= '(1 2 3 4) (concat [1 2] [3 4])))
(is (= (list :a :b 1 [2 3] 4) (concat [:a :b] nil [1 [2 3] 4])))
(is (= (list 1 2 3 4 [:a 1] [:b 2])
       (concat [1] [2] '(3 4) {:a 1, :b 2})))
(is (= (list :a :b 1 [2 3] 4)
       (concat [:a :b] nil [1 [2 3] 4])))
(is (= (list 1 2 3 4 5 6 7 [:a 9] [:b 10])
       (concat [1] [2] '(3 4) [5 6 7] {:a 9 :b 10})))



(is (= '() (sort nil)))
(is (= '() (sort (fn [a b] (> a b)) nil)))

(is (= [] (sort [])))
(is (= [1 2 3 4] (sort [3 1 2 4])))
(is (= [ 10, 5, 2 ]
       (sort (fn [a b] (> a b)) (vals {:foo 5, :bar 2, :baz 10}))))

(is (= [[:c 3] [:a 2] [:b 1]]
       (sort (fn [a b] (> (last a) (last b))) {:b 1 :c 3 :a  2})))

(is (= '(1 2 3 4) (sort '(3 1 2 4))))
(is (= '(4 3 2 1) (sort (fn [a b] (> a b)) '(3 1 2 4))))
(is (= '("dear" "frient" "hello" "my")
       (sort '("hello" "my" "dear" "frient"))))

(is (= [7 7 7 7] (repeat 4 7)))
(is (= [] (repeat 0 7)))
(is (= [] (repeat -1 7)))
(is (= [7] (repeat 1 7)))


(is (= {:a :b} (assoc {} :a :b)))
(is (= {:a :b :c :d} (assoc {:a :b} :c :d)))
(is (= {:a :c} (assoc {:a :b} :a :c)))


(is (every? even? [2 4 6 8]))
(is (not (every? even? [2 4 6 8 9])))
(is (every? even? '(2 4 6 8)))
(is (not (every? even? '(2 4 5))))


(is (= false (some even? [])))
(is (= false (some even? ())))
(is (= false (some even? [1 3 5 7])))
(is (= false (some even? '(1 3 5 7))))
(is (some even? [1 2 3]))
(is (some even? '(1 2 3)))



(is (= [[1 2] [3 4] [5 6] [7 8]]
       (partition 2 [1 2 3 4 5 6 7 8 9])))

(is (= [[1 2 3] [3 4 5] [5 6 7] [7 8 9]]
       (partition 3 2 [1 2 3 4 5 6 7 8 9])))

(is (= [[1 2 3 4 5] [3 4 5 6 7] [5 6 7 8 :a]]
       (partition 5 2 [:a :b :c :d] [1 2 3 4 5 6 7 8])))

(is (= [[1 2 3] [3 4 5] [5 6 7] [7 8 :a]]
       (partition 3 2 [:a :b :c :d] [1 2 3 4 5 6 7 8])))


(is (= [1 4 2 5 3 6]
       (interleave [1 2 3]
                   [4 5 6])))

(is (= [1 4 2 5 3 6]
       (interleave [1 2 3]
                   '(4 5 6))))


(is (= [1 4 2 5 3 6]
       (interleave '(1 2 3)
                   [4 5 6])))

(is (= [1 4 2 5 3 6]
       (interleave [1 2 3 3.5]
                   [4 5 6])))

(is (= [1 4 2 5 3 6]
       (interleave [1 2 3]
                   [4 5 6 7])))

(is (= []
       (interleave [1 2 3]
                   [])))

(is (= []
       (interleave []
                   [4 5 6])))

(is (= []
       (interleave [1 2 3]
                   [4 5 6 7]
                   [])))
(is (= '(1 4 8)
       (interleave [1 2 3]
                   [4 5 6 7]
                   [8])))

(is (= '(1 4 8 2 5 9)
       (interleave [1 2 3]
                   [4 5 6 7]
                   [8 9])))

(is (= '(1 4 8 2 5 9 3 6 10)
       (interleave [1 2 3]
                   [4 5 6 7]
                   [8 9 10])))

(is (= '(1 4 8 2 5 9 3 6 10)
       (interleave [1 2 3]
                   [4 5 6 7]
                   [8 9 10 11])))


(is (= (nth nil 1) nil))
(is (= (nth nil 1 :not-found) :not-found))
(is (= (nth "hello" 2) \l))
(is (= (nth '(1 2 3 4) 3) 4))
(is (= (nth '(1 2 3 4) 0) 1))
(is (= (nth [1 2 3 4] 3) 4))
(is (= (nth [1 2 3 4] 4) nil))
(is (= (nth [1 2 3 4] 2) 3))
(is (= (nth [1 2 3 4] 0) 1))
(is (= (nth (seq {:foo 1 :bar 2}) 1) [:bar 2]))
