(ns wisp.test.string
  (:require [wisp.test.util :refer [is thrown?]]
            [wisp.src.string :refer [join split replace]]
            [wisp.src.sequence :refer [list]]
            [wisp.src.runtime :refer [str =]]))


(is (= (join nil) ""))
(is (= (join "-" nil) ""))

(is (= (join "") ""))
(is (= (join "-" "") ""))
(is (= (join "-" "h") "h"))
(is (= (join "hello") "hello"))
(is (= (join "-" "hello") "h-e-l-l-o"))

(is (= (join []) ""))
(is (= (join "-" []) ""))
(is (= (join "-" [1]) "1"))
(is (= (join "-" [1 2 3]) "1-2-3"))

(is (= (join '()) ""))
(is (= (join "-" '()) ""))
(is (= (join "-" '(1)) "1"))
(is (= (join "-" '(1 2 3)) "1-2-3"))

(is (= (join {})) "")
(is (= (join {:a 1}) (str [:a 1])))
(is (= (join "," {:a 1}) (str [:a 1])))
(is (= (join {:a 1 :b 2}) (str [:a 1] [:b 2])))
(is (= (join "," {:a 1 :b 2}) (str [:a 1] "," [:b 2])))

(is (= (split "" #"\s") [""]))
(is (= (split "hello" #"world") ["hello"]))
(is (= (split "q1w2e3r4t5y6u7i8o9p" #"\d+")
       ["q" "w" "e" "r" "t" "y" "u" "i" "o" "p"]))

(is (= (split "q1w2e3r4t5y6u7i8o9p0" #"\d+" 5)
       ["q" "w" "e" "r" "t5y6u7i8o9p0"]))
(is (= (split "q1w2e3r4t5y6u7i8o9p" #"\d+" 20)
       ["q" "w" "e" "r" "t" "y" "u" "i" "o" "p"]))
(is (= (split "q1w2e3r4t5y6u7i8o9p0" #"\d+" 20)
       ["q" "w" "e" "r" "t" "y" "u" "i" "o" "p" ""]))
(is (= (split "qwertyuiop" #"" 20)
       ["" "q" "w" "e" "r" "t" "y" "u" "i" "o" "p" ""]))

(is (= (split "Some words to split" " ")
       ["Some" "words" "to" "split"]))

;; corner cases (borne from Java VM implementation): Wisp vs Clojure output
(is (= (split ""     #"-")    [""]))             ; [""]
(is (= (split "-"    #"-")    ["" ""]))          ; []
(is (= (split "--+-" #"-")    ["" "" "+" ""]))   ; ["" "" "+"]
(is (= (split "----" #"-"  0) ["" "" "" "" ""])) ; []
(is (= (split "----" #"-"  3) ["" "" "--"]))     ; ["" "" "--"]
(is (= (split "----" #"-"  9) ["" "" "" "" ""])) ; ["" "" "" "" ""]
(is (= (split "----" #"-" -1) ["" "" "" "" ""])) ; ["" "" "" "" ""]


; replace tests
; basic test
(is (= (replace "string" "s" "w") "wtring"))
; testing 'g' flag for replace
(is (= (replace "hello" "l" "w") "hewwo"))
; basic regex
(is (= (replace "10ten" #"[0-9]+" "ten") "tenten"))
; g flag on basic regex
(is (= (replace "19ten10" #"[0-9]+" "ten") "tententen"))
