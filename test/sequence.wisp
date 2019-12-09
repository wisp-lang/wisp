(ns wisp.test.sequence
  (:require [wisp.test.util :refer [is thrown?]]
            [wisp.src.sequence :refer [cons conj into disj list list? empty seq vec vector
                                       range empty? count first second third rest last butlast
                                       take take-while drop drop-while repeatedly repeat concat
                                       mapcat reverse sort map mapv map-indexed filter zipmap
                                       filterv reduce assoc dissoc every? some partition
                                       interleave nth lazy-seq set identity-set identity-set?
                                       contains? union difference intersection subset? superset?
                                       unfold iterate cycle infinite-range lazy-map lazy-filter
                                       lazy-concat lazy-partition run! dorun doall]]
            [wisp.src.runtime :refer [str int inc dec even? odd? number? set? vals + =]]))


(is (= (empty "foo") ""))
(is (= (empty [1 2 3]) []))
(is (= (empty '(1 2 3)) '()))
(is (= (empty {:hello :world}) {}))
(is (= (empty #{1 2 3}) #{}))
(is (= (empty (Set. [1 2 3])) #{}))
(is (= (empty (Map. [[1 2]])) nil))

(is (empty? "") "\"\" is empty")
(is (empty? []) "[] is empty")
(is (empty? nil) "nil is empty")
(is (empty? {}) "{} is empty")
(is (empty? '()) "'() is empty")
(is (empty? #{}) "#{} is empty")
(is (empty? (Set.)) "(Set.) is empty")
(is (empty? (Map.)) "(Map.) is empty")


(is (= (count "") 0) "count 0 in \"\"")
(is (= (count "hello") 5) "count 5 in \"hello\"")
(is (= (count []) 0) "count 0 in []")
(is (= (count [1 2 3 "hi"]) 4) "1 2 3 \"hi\"")
(is (= (count nil) 0) "count 0 in nil")
(is (= (count {}) 0) "count 0 in {}")
(is (= (count {:hello :world}) 1) "count 1 in {:hello :world}")
(is (= (count '()) 0) "count 0 in '()")
(is (= (count '(1 2)) 2) "count 2 in '(1 2)")
(is (= (count #{}) 0) "count 0 in #{}")
(is (= (count #{:foo :bar}) 2) "count 2 in #{:foo :bar}")
(is (= (count (Set.)) 0) "count 0 in (Set.)")
(is (= (count (Set. [:foo :bar])) 2) "count 2 in (Set. [:foo :bar])")
(is (= (count (Map. [[:hello :world]])) 1) "count 1 in (Map. [[:hello :world]])")


(is (= (first nil) nil))
(is (= (first "") nil))
(is (= (first "hello") \h))
(is (= (first []) nil))
(is (= (first [1 2 3]) 1))
(is (= (first '()) nil))
(is (= (first '(\a \b \c)) \a))
(is (= (first {}) nil))
(is (= (first {:a 1, :b 2}) [:a 1]))


(is (= (second nil) nil))
(is (= (second "") nil))
(is (= (second "h") nil))
(is (= (second "hello") \e))
(is (= (second []) nil))
(is (= (second [1]) nil))
(is (= (second [1 2 3]) 2))
(is (= (second '()) nil))
(is (= (second '(:a)) nil))
(is (= (second '(\a \b \c)) \b))
(is (= (second {}) nil))
(is (= (second {:a 1}) nil))
(is (= (second {:a 1, :b 2}) [:b 2]))


(is (= (third nil) nil))
(is (= (third "") nil))
(is (= (third "h") nil))
(is (= (third "hello") \l))
(is (= (third []) nil))
(is (= (third [1]) nil))
(is (= (third [1 2 3]) 3))
(is (= (third '()) nil))
(is (= (third '(:a)) nil))
(is (= (third '(\a \b \c)) \c))
(is (= (third {}) nil))
(is (= (third {:a 1}) nil))
(is (= (third {:a 1, :b 2, :c 3}) [:c 3]))


(is (= (last nil) nil))
(is (= (last []) nil))
(is (= (last [1 2 3]) 3))
(is (= (last "hello") \o))
(is (= (last "") nil))
(is (= (last '(\a \b \c)) \c))
(is (= (last '()) nil))
(is (= (last '(\a \b \c)) \c))
(is (= (last {:a 1, :b 2}) [:b 2]))
(is (= (last {}) nil))


(is (= (butlast nil) nil))

(is (= (butlast '()) nil))
(is (= (butlast '(1)) nil))
(is (= (butlast '(1 2 3)) '(1 2)))

(is (= (butlast []) nil))
(is (= (butlast [1]) nil))
(is (= (butlast [1 2 3]) [1 2]))

(is (= (butlast {}) nil))
(is (= (butlast {:a 1}) nil))
(is (= (butlast {:a 1, :b 2}) [[:a 1]]))



(is (= (rest {:a 1}) []))
(is (= (rest "a") ""))
(is (= (rest '(1 2 3 4)) '(2 3 4)))
(is (= (rest [1 2 3]) [2 3]))
(is (= (rest {:a 1 :b 2}) [[:b 2]]))
(is (= (rest "hello") "ello"))



(is (= (rest nil) '()))
(is (= (rest '()) '()))
(is (= (rest [1]) []))
(is (= (rest {:a 1}) []))
(is (= (rest "a") ""))
(is (= (rest '(1 2 3 4)) '(2 3 4)))
(is (= (rest [1 2 3]) [2 3]))
(is (= (rest {:a 1 :b 2}) [[:b 2]]))
(is (= (rest "hello") "ello"))



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



(is (set? #{}) "#{} is a set")
(is (identity-set? #{}) "#{} is identity-set")
(is (not (identity-set? 2)) "2 is not identity-set")
(is (not (identity-set? {})) "{} is not identity-set")
(is (not (identity-set? [])) "[] is not identity-set")
(is (not (identity-set? (Set.))) "(Set.) is not identity-set")
(is (= #{1 3 2} #{3 1 2}))
(is (= #{1 3 2} (Set. [2 1 3])))
(is (= (Set. [2 1 3]) #{1 3 2}))


(is (not (empty? #{1 2 3 4}))
    "non empty identity-set returns false on empty?")

(is (= (count #{1 2 3 4}) 4)
    "identity-set has expected length")

(is (= (first (identity-set 1 2 3 4)) 1)
    "first returns first item in identity-set")

(is (= (vec (rest #{1 2 3 4})) [2 3 4])
    "rest returns rest items")

(is (identical? (str #{1 2 3 4}) "#{1 2 3 4}")
    "stringification returns identity-set")

(is (#{1 3 2} 2)       "identity-set duplicates as a membership function")
(is (not (#{1 3 2} 4)) "identity-set duplicates as a membership function")



(is (not (empty? (cons 1 '()))) "cons creates non-empty list")
(is (not (empty? (cons 1 nil))) "cons onto nil is list of that item")
(is (= (cons 1 nil) '(1)))
(is (= (first (cons 1 nil)) 1))
(is (= (rest (cons 1 nil)) '()))
(is (= (cons 1 '(2 3)) '(1 2 3))
    "cons returns new list prefixed with first argument")
(is (not (empty? (cons 1 (list)))) "cons creates non-empty list")
(is (= (cons 1 (list 2 3)) (list 1 2 3))
    "cons returns new list prefixed with first argument")


(is (= (conj nil 1) '(1)))
(is (= (conj nil 1 2) '(2 1)))
(is (= (conj '() 1) '(1)))
(is (= (conj '() 1 2) '(2 1)))
(is (= (conj '(1 2 3) 4) '(4 1 2 3)))
(is (= (conj [] 1) [1]))
(is (= (conj [] 1 2) [1 2]))
(is (= (conj ["a" "b" "c"] "d") ["a" "b" "c" "d"]))
(is (= (conj [1 2] 3 4) [1 2 3 4]))
(is (= (conj [[1 2] [3 4]] [5 6]) [[1 2] [3 4] [5 6]]))
(is (= (conj {:firstname "John" :lastname "Doe"}
             {:age 25 :nationality "Chinese"})
       {:nationality "Chinese", :age 25
        :firstname "John", :lastname "Doe"}))
(is (= (conj {1 2, 3 4} [5 6]) {5 6, 1 2, 3 4}))
(is (= (conj #{} 2 1) #{1 2}))
(is (= (conj #{2 1} 4 3 1) #{1 2 3 4}))
(is (= (conj (Set. [2 1]) 4 3 1) #{1 2 3 4}))

(is (= (into nil nil) '()))
(is (= (into nil '(1)) '(1)))
(is (= (into nil [1 2]) '(2 1)))
(is (= (into '() [1]) '(1)))
(is (= (into '() [1 2]) '(2 1)))
(is (= (into '(1 2 3) [4]) '(4 1 2 3)))
(is (= (into [] '(1)) [1]))
(is (= (into [] [1 2]) [1 2]))
(is (= (into ["a" "b" "c"] "def") ["a" "b" "c" "d" "e" "f"]))
(is (= (into [1 2] '(3 4)) [1 2 3 4]))
(is (= (into [[1 2] [3 4]] '([5 6])) [[1 2] [3 4] [5 6]]))
(is (= (into {:firstname "John" :lastname "Doe"}
             {:age 25 :nationality "Chinese"})
       {:nationality "Chinese", :age 25
        :firstname "John", :lastname "Doe"}))
(is (= (into {1 2, 3 4} [[5 6]]) {5 6, 1 2, 3 4}))
(is (= (into #{} [2 1]) #{1 2}))
(is (= (into #{2 1} [4 3 1]) #{1 2 3 4}))
(is (= (into (Set. [2 1]) [4 3 1]) #{1 2 3 4}))

(is (= (disj #{1 2} 2 1) #{}))
(is (= (disj #{1 2 3 4} 4 3) #{2 1}))
(is (= (disj (Set. [1 2 3 4]) 4 3) #{2 1}))
(is (= (disj {:a :b, :c :d} :a) {:c :d}))
(is (= (disj {:a :b, :c :d} :a :c) {}))

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
(is (= (reverse [4 3 2 1]) [1 2 3 4]))
(is (= (reverse nil) '()))
(is (= (reverse {:a 1, :b 2}) (list [:b 2] [:a 1])))
(is (= (reverse (Set. [1 2])) '(2 1)))




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



(is (= (vec '(1 2 3)) [1 2 3]))
(is (= (vec [1 2 3]) [1 2 3]))
(is (= (vec '()) []))
(is (= (vec nil) []))
(is (= (vec "foo") [\f \o \o]))
(is (= (vec (lazy-seq "foo")) [\f \o \o]))
(is (= (vec {:a 1 :b 2}) [[:a 1] [:b 2]]))
(is (= (vec (Set. [42])) [42]))
(is (= (vec (Map. [[42 ':a]])) [[42 ':a]]))
(is (= (vec (.keys (Map. [[42 ':a]])) [42])))


(is (= (range 5)       [0 1 2 3 4]))
(is (= (range 3  8)    [3 4 5 6 7]))
(is (= (range 2 12  3) [2 5 8 11]))
(is (= (range 2 11  3) [2 5 8]))
(is (= (range 2 10  3) [2 5 8]))
(is (= (range 2  9  3) [2 5 8]))
(is (= (range 2  8  3) [2 5]))
(is (= (range 9  2 -3) [9 6 3]))
(is (= (range 9  3 -3) [9 6]))
(is (= (range 9  4 -3) [9 6]))
(is (= (range 9  5 -3) [9 6]))
(is (= (range 9  6 -3) [9]))
(is (= (range 9  6)    []))
(is (= (range 9  6  3) []))
(is (= (range 6  9 -3) []))


(is (= (map inc nil) '()))
(is (= (map inc '()) '()))
(is (= (map inc []) []))
(is (= (map inc {}) []))
(is (= (map inc '(1 2 3)) '(2 3 4)))
(is (= (map inc [1 2 3 4 5]) [2 3 4 5 6]))
(is (= (map (fn [pair] (apply str pair)) {:a 1 :b 2})
       [(str :a 1) (str :b 2)]))
(is (= (map inc #{1 2 3}) '(2 3 4)))
(is (= (map + nil (range 4)) '()))
(is (= (map + '() (range 4)) '()))
(is (= (map + []  (range 4)) []))
(is (= (map + {}  (range 4)) []))
(is (= (map + '(\a \b \c) (range 4)) '("a0" "b1" "c2")))
(is (= (map + [\a \b \c \d \e] (range 4)) ["a0" "b1" "c2" "d3"]))
(is (= (map + "abcde" (range 4)) ["a0" "b1" "c2" "d3"]))
(is (= (map + {:a :foo, :b :bar, :c :baz} (range 4))
       ["a,foo0" "b,bar1" "c,baz2"]))
(is (= (map + #{\a \b \c} (range 4)) '("a0" "b1" "c2")))

(is (= (mapv inc nil) []))
(is (= (mapv inc '()) []))
(is (= (mapv inc '(1 2 3)) [2 3 4]))
(is (= (mapv inc #{1 2 3}) [2 3 4]))
(is (= (mapv + nil (range 4)) []))
(is (= (mapv + '() (range 4)) []))
(is (= (mapv + '(\a \b \c) (range 4)) ["a0" "b1" "c2"]))
(is (= (mapv + #{\a \b \c} (range 4)) ["a0" "b1" "c2"]))
(is (= (mapv vector [1 2 3] [4 5 6] [7 8 9])
       [[1 4 7] [2 5 8] [3 6 9]]))
(is (= (mapv vector [1 2 3] [4 5 6])
       [[1 4] [2 5] [3 6]]))
(is (= (mapv vector [1 2] [3 4] [5 6])
       [[1 3 5] [2 4 6]]))

(is (= (map-indexed + nil) '()))
(is (= (map-indexed + '()) '()))
(is (= (map-indexed + []) []))
(is (= (map-indexed + {}) []))
(is (= (map-indexed + '(\a \b \c)) '("0a" "1b" "2c")))
(is (= (map-indexed + [\a \b \c \d \e]) ["0a" "1b" "2c" "3d" "4e"]))
(is (= (map-indexed + "abcde") ["0a" "1b" "2c" "3d" "4e"]))
(is (= (map-indexed + {:a :foo, :b :bar, :c :baz})
       ["0a,foo" "1b,bar" "2c,baz"]))
(is (= (map-indexed + #{\a \b \c}) '("0a" "1b" "2c")))

(is (= (zipmap "abcde" (range 3)) {:a 0, :b 1, :c 2}))


(is (= (filter even? nil) '()))
(is (= (filter even? '()) '()))
(is (= (filter even? []) []))
(is (= (filter even? {}) []))
(is (= (filter even? [1 2 3 4]) [2 4]))
(is (= (filter even? '(1 2 3 4)) '(2 4)))
(is (= (filter (fn [pair] (even? (second pair))) {:a 1 :b 2}) [[:b 2]]))
(is (= (filter even? #{1 2 3 4}) '(2 4)))
(is (= (filter #{3 2 5} [1 2 3 4]) [2 3]))

(is (= (filterv even? nil) []))
(is (= (filterv even? '()) []))
(is (= (filterv even? '(1 2 3 4)) [2 4]))
(is (= (filterv even? #{1 2 3 4}) [2 4]))



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


(is (= (take 1 nil) '()))
(is (= (take 1 '()) '()))
(is (= (take 2 "") []))
(is (= (take 2 {}) []))

(is (= (take 2 "foo") [\f \o]))
(is (= (take 2 '(1 2 3 4)) '(1 2)))
(is (= (take 3 [1 2 3 4]) [1 2 3]))
(is (= (take 2 {:a 1 :b 2 :c 3}) [[:a 1] [:b 2]]))


(is (= (take-while #(< % 3) [1 2 3 4 5]) [1 2]))
(is (= (take-while number? [1 2 3 4 5]) [1 2 3 4 5]))
(is (= (take-while even? [1 2 3 4 5]) []))


(is (= (drop 1 nil) '()))
(is (= (drop 1 '()) '()))
(is (= (drop 1 []) []))
(is (= (drop -1 '(1 2 3)) '(1 2 3)))
(is (= (drop -1 [1 2 3 4]) [1 2 3 4]))
(is (= (drop 0 '(1 2 3)) '(1 2 3)))
(is (= (drop 0 [1 2 3 4]) [1 2 3 4]))
(is (= (drop 2 '(1 2 3 4)) '(3 4)))
(is (= (drop 1 [1 2 3 4]) [2 3 4]))


(is (= (drop-while #(< % 3) [1 2 3 4 5]) [3 4 5]))
(is (= (drop-while number? [1 2 3 4 5]) []))
(is (= (drop-while even? [1 2 3 4 5]) [1 2 3 4 5]))




(is (= (concat '(1 2) '(3 4)) '(1 2 3 4)))
(is (= (concat '(1 2) '() '() '(3 4) '(5)) '(1 2 3 4 5)))
(is (= (concat [1 2] [3 4]) '(1 2 3 4)))
(is (= (concat [:a :b] nil [1 [2 3] 4]) (list :a :b 1 [2 3] 4)))
(is (= (concat [1] [2] '(3 4) {:a 1, :b 2})
       (list 1 2 3 4 [:a 1] [:b 2])))
(is (= (concat [:a :b] nil [1 [2 3] 4])
       (list :a :b 1 [2 3] 4)))
(is (= (concat [1] [2] '(3 4) [5 6 7] {:a 9 :b 10})
       (list 1 2 3 4 5 6 7 [:a 9] [:b 10])))

(is (= (mapcat (fn [x] [x x]) [1 2 3])  '(1 1 2 2 3 3)))
(is (= (mapcat (fn [x] [x x]) '(1 2 3)) '(1 1 2 2 3 3)))



(is (= (sort nil) '()))
(is (= (sort (fn [a b] (> a b)) nil) '()))

(is (= (sort []) []))
(is (= (sort [3 1 2 4]) [1 2 3 4]))
(is (= (sort (fn [a b] (> a b)) (vals {:foo 5, :bar 2, :baz 10}))
       [10 5 2]))

(is (= (sort (fn [a b] (> (last a) (last b))) {:b 1 :c 3 :a  2})
       (list [:c 3] [:a 2] [:b 1])))
(is (= (sort (fn [a b] (> (last a) (last b))) [:ab :ba :cb])
       [:ab :cb :ba]))
(is (= (sort (fn [a b] (< (last a) (last b))) [:ab :ba :cb])
       [:ba :ab :cb]))

(is (= (sort '(3 1 2 4)) '(1 2 3 4)))
(is (= (sort (fn [a b] (> a b)) '(3 1 2 4)) '(4 3 2 1)))
(is (= (sort '("hello" "my" "dear" "frient"))
       '("dear" "frient" "hello" "my")))
(is (= (sort (Set. [3 1 2 4])) '(1 2 3 4)))

(is (= (repeatedly 5 #(* 6 7)) [42 42 42 42 42]))

(is (= (repeat 4 7)  [7 7 7 7]))
(is (= (repeat 0 7)  []))
(is (= (repeat -1 7) []))
(is (= (repeat 1 7)  [7]))
(is (= (repeat 2)    [nil nil]))
(is (= (repeat)      []))


(is (= (assoc {} :a :b) {:a :b}))
(is (= (assoc {:a :b} :c :d) {:a :b :c :d}))
(is (= (assoc {:a :b} :a :c) {:a :c}))

(is (= (dissoc {:a :b, :c :d} :a) {:c :d}))
(is (= (dissoc {:a :b, :c :d} :a :c) {}))


(is (every? even? [2 4 6 8]))
(is (not (every? even? [2 4 6 8 9])))
(is (every? even? '(2 4 6 8)))
(is (not (every? even? '(2 4 5))))


(is (= (some even? []) nil))
(is (= (some even? ()) nil))
(is (= (some even? [1 3 5 7]) nil))
(is (= (some even? '(1 3 5 7)) nil))
(is (= (some even? [1 2 3]) true))
(is (= (some even? '(1 2 3)) true))
(is (= (some dec [1 43]) 42))



(is (= (partition 2 [1 2 3 4 5 6 7 8 9])
       [[1 2] [3 4] [5 6] [7 8]]))

(is (= (partition 3 2 [1 2 3 4 5 6 7 8 9])
       [[1 2 3] [3 4 5] [5 6 7] [7 8 9]]))

(is (= (partition 5 2 [:a :b :c :d] [1 2 3 4 5 6 7 8])
       [[1 2 3 4 5] [3 4 5 6 7] [5 6 7 8 :a]]))

(is (= (partition 3 2 [:a :b :c :d] [1 2 3 4 5 6 7 8])
       [[1 2 3] [3 4 5] [5 6 7] [7 8 :a]]))


(is (= (interleave) []))

(is (= (interleave [1 2 3]) [1 2 3]))

(is (= (interleave [1 2 3]
                   [4 5 6])
       [1 4 2 5 3 6]))

(is (= (interleave [1 2 3]
                   '(4 5 6))
       [1 4 2 5 3 6]))


(is (= (interleave '(1 2 3)
                   [4 5 6])
       [1 4 2 5 3 6]))

(is (= (interleave [1 2 3 3.5]
                   [4 5 6])
       [1 4 2 5 3 6]))

(is (= (interleave [1 2 3]
                   [4 5 6 7])
       [1 4 2 5 3 6]))

(is (= (interleave [1 2 3]
                   [])
       []))

(is (= (interleave []
                   [4 5 6])
       []))

(is (= (interleave [1 2 3]
                   [4 5 6 7]
                   [])
       []))
(is (= (interleave [1 2 3]
                   [4 5 6 7]
                   [8])
       [1 4 8]))

(is (= (interleave [1 2 3]
                   [4 5 6 7]
                   [8 9])
       [1 4 8 2 5 9]))

(is (= (interleave [1 2 3]
                   [4 5 6 7]
                   [8 9 10])
       [1 4 8 2 5 9 3 6 10]))

(is (= (interleave [1 2 3]
                   [4 5 6 7]
                   [8 9 10 11])
       [1 4 8 2 5 9 3 6 10]))


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
(is (= (nth (Map. [[1 2] [3 4]]) 1) [3 4]))


(is (contains? #{2 1 3} 3)           "contains? on sets checks for membership")
(is (not (contains? #{2 1 3} 0))     "contains? on sets checks for membership")
(is (contains? {:a 1, :b 2} :a)      "contains? on dictionaries checks for key existence")
(is (not (contains? {:a 1, :b 2} 1)) "contains? on dictionaries checks for key existence")
(is (contains? [:a :b :c] 1)         "contains? on vectors checks for index existence")
(is (not (contains? [:a :b :c] :b))  "contains? on vectors checks for index existence")
(is (contains? "foo" 2)              "contains? on strings checks for index existence")
(is (not (contains? "foo" \f))       "contains? on strings checks for index existence")
(is (not (contains? (list 1 2 3) 1)) "contains? on other types returns false")

(is (= (union) #{}))
(is (= (union [1 2 3]) #{1 2 3}))
(is (= (union :foo [\b \a \r] "baz")
       #{:a :b :f :o :r :z}))

(is (= (difference [1 2 3]) #{1 2 3}))
(is (= (difference [\b \a \r] "baz") #{:r}))
(is (= (difference [\b \a \r] "baz" :answer) #{}))

(is (= (intersection [1 2 3]) #{1 2 3}))
(is (= (intersection [\b \a \r] "baz") #{:a :b}))
(is (= (intersection [\b \a \r] "baz" :answer) #{:a}))

(is (subset? nil [42])          "subset? checks if all items from set1 are in set2")
(is (subset? :foo "of")         "subset? works on equal sets")
(is (not (subset? "bar" "baz")) "subset? works on different sets")

(is (superset? [42] nil)          "superset? checks if all items from set2 are in set1")
(is (superset? :of "foo")         "superset? works on equal sets")
(is (not (superset? "baz" "bar")) "superset? works on different sets")


(defn- binary* [n]    ; unfolder to binary form (reversed)
  (if (> n 0) [(rem n 2) (int (/ n 2))]))
(is (= (vec (unfold binary*  0)) []))
(is (= (vec (unfold binary* 13)) [1 0 1 1]))      ; 1 + 4 + 8
(is (= (vec (unfold binary* 42)) [0 1 0 1 0 1]))  ; 2 + 8 + 32

(is (= (take 5 (iterate #(* % %) 2))
       '(2 4 16 256 65536)))

(is (= (take 10 (cycle [1 2 3]))
       '(1 2 3 1 2 3 1 2 3 1)))
(is (= (take 10 (cycle []))
       '()))

(is (= (take 5 (infinite-range))
       '(0 1 2 3 4)))
(is (= (take 3 (infinite-range 2))
       '(2 3 4)))
(is (= (take 3 (infinite-range 2 -4))
       '(2 -2 -6)))

(is (= (take 5 (lazy-map inc (infinite-range)))
       '(1 2 3 4 5)))

(is (= (take 5 (lazy-filter odd? (infinite-range)))
       '(1 3 5 7 9)))

(is (= (take 10 (lazy-concat (range 5) "abc" (infinite-range -1 -1)))
       '(0 1 2 3 4 \a \b \c -1 -2)))

(is (= (take 3 (lazy-partition 2 (infinite-range)))
       '((0 1) (2 3) (4 5))))
(is (= (take 3 (lazy-partition 2 3 (infinite-range)))
       '((0 1) (3 4) (6 7))))
(is (= (take 3 (lazy-partition 2 3 (infinite-range 10) (range 7)))
       '((0 1) (3 4) (6 10))))
(is (= (take 3 (lazy-partition 2 3 (infinite-range 10) (range 6)))
       '((0 1) (3 4))))


(defn- *side-effects! [f]
  (let [xs [],  side-effect! (fn [x] (.push! xs x) x),  res (f side-effect!)]
    [xs (and res (take 2 res))]))       ; taking more would affect test results

(is (= (*side-effects! #(take 0 (lazy-map % (range 3))))
       [[] nil])
    "take 0 won't evaluate the lazy sequence")

(is (= (*side-effects! #(take 1 (lazy-concat (lazy-map % (range 5))
                                             (lazy-map % "abc")
                                             (lazy-map % (infinite-range -1 -1)))))
       [[0] '(0)]))
(is (= (*side-effects! #(take 6 (lazy-concat (lazy-map % (range 5))
                                             (lazy-map % "abc")
                                             (lazy-map % (infinite-range -1 -1)))))
       [[0 1 2 3 4 :a] '(0 1)]))
(is (= (*side-effects! #(take 9 (lazy-concat (lazy-map % (range 5))
                                             (lazy-map % "abc")
                                             (lazy-map % (infinite-range -1 -1)))))
       [[0 1 2 3 4 :a :b :c -1] '(0 1)]))

(is (= (*side-effects! #(run! % (range 3)))
       [[0 1 2] nil])
    "run! implements the for-each operation")

(is (= (*side-effects! #(dorun 3 (lazy-map % (infinite-range))))
       [[0 1 2] nil])
    "dorun forces evaluation of up to given number of elements and returns nil")
(is (= (*side-effects! #(dorun (lazy-map % (range 3))))
       [[0 1 2] nil])
    "dorun works on finite collections")
(is (= (*side-effects! #(dorun 5 (lazy-map % (range 3))))
       [[0 1 2] nil])
    "dorun works on finite collections")

(is (= (*side-effects! #(doall 3 (lazy-map % (infinite-range))))
       [[0 1 2] '(0 1)])
    "doall forces evaluation of up to given number of elements and returns the coll")
(is (= (*side-effects! #(doall (lazy-map % (range 3))))
       [[0 1 2] '(0 1)])
    "doall works on finite collections")
(is (= (*side-effects! #(doall 5 (lazy-map % (range 3))))
       [[0 1 2] '(0 1)])
    "doall works on finite collections")
