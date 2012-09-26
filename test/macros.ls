(include "./macros")
(defmacro define-suite
  ([title suite]
   `(set! (get exports (js* "'test ~{}'" (symbol* ~title))) ~suite))
  ([title suite & rest]
   `(statements* (define-suite ~title ~suite)
                 (define-suite ~@rest))))

(defmacro test-if-main []
  `(if (identical? require.main module)
     (.run (require "test") exports)))

(defmacro test-suite
  ([] `(test-if-main))
  ([& body]
   `(statements* (define-suite ~@body)
                 (test-if-main))))

(defmacro define-test
  [title & assertions]
  `(set! (get exports (js* "'test ~{}'" (symbol* ~title)))
         (fn [assert] ~@assertions null)))

(defmacro define-test*
  ([descriptor]
   `(define-test ~@descriptor))
  ([first & rest]
    `(statements* (define-test ~@first)
                  (define-test* ~@rest))))

(defmacro test [& body]
  `(statements* (define-test* ~@body)
                (test-if-main)))

(defmacro define-assertion
  "Defines assertion macro"
  ([name alias]
   `(defmacro ~alias [& args]
              ((js* "assert.~{}" ~name) '(unquote @args))))
  ([name]
   `(define-assertion ~name ~name)))

(define-assertion deep-equal deep-equal?)
(define-assertion not-deep-equal not-deep-equal?)
(define-assertion equal equal?)
(define-assertion not-equal not-equal?)
(define-assertion strict-equal strict-equal?)
(define-assertion not-strict-equal not-strict-equal?)
(define-assertion ok assert)
(define-assertion pass)
(define-assertion pass)

(defmacro throws?
  ([form] `(assert.throws (fn [] ~form)))
  ([form & args] `(assert.throws (fn [] ~form) ~@args)))
