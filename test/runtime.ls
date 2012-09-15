(include "./macros")
(import read-from-string "../src/reader")
(import [dictionary? vector?] "../src/runtime")

(def read read-from-string)

(test
 ("dictionary?"
  (assert (not (dictionary? 2)) "2 is not dictionary")
  (assert (not (dictionary? ;[])) "[] is not dictionary")
                            (read "[]"))) "[] is not dictionary")
  (assert (not (dictionary? ;())) "() is not dictionary")
                            (read "()"))) "() is not dictionary")
  (assert (dictionary? {}) "{} is dictionary"))
 
  ("vector?"
    (assert (not (vector? 2)) "2 is not vector")
    (assert (not (vector? {})) "{} is not vector")
    (assert (not (vector? ;())) "() is not vector")
                          (read "()"))) "() is not vector")

    (assert (vector? ;[]) "[] is vector")
                     (read "[]")) "[] is vector")))

