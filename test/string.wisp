(import [join split] "../src/string")
(import [list] "../src/sequence")
(import [str =] "../src/runtime")

(.log console "test join")

(assert (= "" (join nil)))
(assert (= "" (join "-" nil)))

(assert (= "" (join "")))
(assert (= "" (join "-" "")))
(assert (= "h" (join "-" "h")))
(assert (= "hello" (join "hello")))
(assert (= "h-e-l-l-o" (join "-" "hello")))

(assert (= "" (join [])))
(assert (= "" (join "-" [])))
(assert (= "1" (join "-" [1])))
(assert (= "1-2-3" (join "-" [1 2 3])))

(assert (= "" (join '())))
(assert (= "" (join "-" '())))
(assert (= "1" (join "-" '(1))))
(assert (= "1-2-3" (join "-" '(1 2 3))))

(assert (= "" (join {})))
(assert (= (str [:a 1]) (join {:a 1})))
(assert (= (str [:a 1]) (join "," {:a 1})))
(assert (= (str [:a 1] [:b 2]) (join {:a 1 :b 2})))
(assert (= (str [:a 1] "," [:b 2]) (join "," {:a 1 :b 2})))

(.log console "test split")

(assert (= [""] (split "" #"\s")))
(assert (= ["hello"] (split "hello" #"world")))
(assert (= ["q" "w" "e" "r" "t" "y" "u" "i" "o" "p"]
           (split "q1w2e3r4t5y6u7i8o9p" #"\d+")))

(assert (= ["q" "w" "e" "r" "t"]
           ; TODO: In clojure => ["q" "w" "e" "r" "t5y6u7i8o9p0"]
           (split "q1w2e3r4t5y6u7i8o9p0" #"\d+" 5)))

(assert (= ["Some" "words" "to" "split"]
           (split "Some words to split" " ")))
