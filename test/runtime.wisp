(import [dictionary? vector? subs] "../src/runtime")
(import [list concat] "../src/sequence")
(import [equivalent?] "./utils")


(.log console "test dictionary?")

(assert (not (dictionary? 2)) "2 is not dictionary")
(assert (not (dictionary? [])) "[] is not dictionary")
(assert (not (dictionary? '())) "() is not dictionary")
(assert (dictionary? {}) "{} is dictionary")

(.log console "test vector?")

(assert (not (vector? 2)) "2 is not vector")
(assert (not (vector? {})) "{} is not vector")
(assert (not (vector? '())) "() is not vector")
(assert (vector? []) "[] is vector")

(assert (equivalent?
          '(1 2 3 4 5)
          `(1 ~@'(2 3) 4 ~@'(5))))

(.log console "subs")

(assert (= "lojure" (subs "Clojure" 1)))
(assert (= "lo" (subs "Clojure" 1 3)))
