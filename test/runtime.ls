(import [dictionary? vector?] "../src/runtime")
(import [list] "../src/list")

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
