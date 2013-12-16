(ns wisp.test.util
  "Kind of ugly hack for defining *failures* globals"
  (:require [wisp.sequence :refer [count]]
            [wisp.ast :refer [pr-str symbol]]))

(def ^:dynamic *passed* [])
(def ^:dynamic *failed* [])
;; Since macros so far don't bind scope we need this hack.
(set! global.*failed* *failed*)
(set! global.*passed* *passed*)
(set! global.symbol symbol)
(set! global.pr-str pr-str)

(.once process :exit (fn []
                       (print "\nPassed: " (count *passed*)
                              " Failed: " (count *failed*))
                       (if (> (count *failed*) 0)
                         (.exit process 1))))

(defmacro is
  "Generic assertion macro. 'form' is any predicate test.
  'msg' is an optional message to attach to the assertion.
  Example: (is (= 4 (+ 2 2)) \"Two plus two should be 4\")

  Special forms:

  (is (thrown? c body)) checks that an instance of c is thrown from
  body, fails if not; then returns the thing thrown.

  (is (thrown-with-msg? c re body)) checks that an instance of c is
  thrown AND that the message on the exception matches (with
  re-find) the regular expression re."
  ([form] `(is ~form ""))
  ([form msg]
   (let [op (first form)
         actual (second form)
         expected (third form)]
     `(if ~form
       (do
         (.push *passed* ~msg)
         true)
       (do
         (.push *failed* '~form)
         (console.error (str "Fail: " ~msg "\n"
                     "expected: "
                     (pr-str '~form) "\n"
                     "  actual: "
                     (pr-str (list '~op
                                   (try ~actual (catch error (list 'throw (list 'Error (.-message error)))))
                                   (try '~expected (catch error error))))))
         false)))))

(defmacro thrown?
  [expression pattern]
  `(try
     (do
       ~expression
       false)
    (catch error
      (if (re-find ~pattern (str error))
        true
        false))))
