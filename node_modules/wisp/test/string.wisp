(ns wisp.test.string
  (:require [wisp.test.util :refer [is thrown?]]
            [wisp.src.string :refer [join split]]
            [wisp.src.sequence :refer [list]]
            [wisp.src.runtime :refer [str =]]))


(is (= "" (join nil)))
(is (= "" (join "-" nil)))

(is (= "" (join "")))
(is (= "" (join "-" "")))
(is (= "h" (join "-" "h")))
(is (= "hello" (join "hello")))
(is (= "h-e-l-l-o" (join "-" "hello")))

(is (= "" (join [])))
(is (= "" (join "-" [])))
(is (= "1" (join "-" [1])))
(is (= "1-2-3" (join "-" [1 2 3])))

(is (= "" (join '())))
(is (= "" (join "-" '())))
(is (= "1" (join "-" '(1))))
(is (= "1-2-3" (join "-" '(1 2 3))))

(is (= "" (join {})))
(is (= (str [:a 1]) (join {:a 1})))
(is (= (str [:a 1]) (join "," {:a 1})))
(is (= (str [:a 1] [:b 2]) (join {:a 1 :b 2})))
(is (= (str [:a 1] "," [:b 2]) (join "," {:a 1 :b 2})))

(is (= [""] (split "" #"\s")))
(is (= ["hello"] (split "hello" #"world")))
(is (= ["q" "w" "e" "r" "t" "y" "u" "i" "o" "p"]
       (split "q1w2e3r4t5y6u7i8o9p" #"\d+")))

(is (= ["q" "w" "e" "r" "t"]
       ; TODO: In clojure => ["q" "w" "e" "r" "t5y6u7i8o9p0"]
       (split "q1w2e3r4t5y6u7i8o9p0" #"\d+" 5)))

(is (= ["Some" "words" "to" "split"]
       (split "Some words to split" " ")))
