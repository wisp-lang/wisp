nil ;; => void(0)
true ;; => true
1  ;; => 1
"Hello world"
"Hello,
My name is wisp!"
\a  ;; => "a"
:keyword  ;; => "keyword"
(window.addEventListener :load handler false)
(:bar foo) ;; => foo["bar"]
[ 1 2 3 4 ]
[ 1, 2, 3, 4]
{ "foo" bar :beep-bop "bop" 1 2 }
{ a 1, b 2 }
(foo bar baz) ; => foo(bar, baz);
(dash-delimited)   ;; => dashDelimited
(predicate?)       ;; => isPredicate
(**privates**)     ;; => __privates__
(list->vector)     ;; => listToVector
(parse-int x)
(parseInt x)
(array? x)
(isArray x)
(+ a b)        ; => a + b
(+ a b c)      ; => a + b + c
(- a b)        ; => a - b
(* a b c)      ; => a * b * c
(/ a b)        ; => a / b
(mod a b)      ; => a % 2
(identical? a b)     ;; => a === b
(= a b)              ;; => a == b
(= a b c)            ;; => a == b && b == c
(> a b)              ;; => a > b
(>= a b)             ;; => a >= b
(< a b c)            ;; => a < b && b < c
(<= a b c)           ;; => a <= b && b <= c
(and a b)            ;; => a && b
(and a b c)          ;; => a && b && c
(or a b)             ;; => a || b
(and (or a b)
     (and c d))      ;; (a || b) && (c && d)
(def a)     ; => var a = void(0);
(def b 2)   ; => var b = 2;
(set! a 1)
(if (< number 10)
  "Digit"
  "Number")
(if (monday? today) "How was your weekend")
(do
  (console.log "Computing sum of a & b")
  (+ a b))
(do)
(let [a 1
      b (+ a c)]
  (+ a b))
(fn [x] (+ x 1))
(fn increment [x] (+ x 1))
(defn incerement
  "Returns a number one greater than given."
  {:added "1.0"}
  [x] (+ x 1))
(fn [x & rest]
  (rest.reduce (fn [sum x] (+ sum x)) x))
(defn sum
  "Return the sum of all arguments"
  {:version "1.0"}
  ([] 0)
  ([x] x)
  ([x y] (+ x y))
  ([x & more] (more.reduce (fn [x y] (+ x y)) x)))
(fn
  ([x] x)
  ([x y] (- x y)))
(Type. options)
(new Class options)
(.log console "hello wisp")
(window.addEventListener "load" handler false)
(.-location window)
(get templates (.-id element))
(try (raise exception))
(try
  (raise exception)
  (catch error (.log console error)))
(try
  (raise exception)
  (catch error (recover error))
  (finally (.log console "That was a close one!")))
(fn raise [message] (throw (Error. message)))
foo
(quote foo)
'foo
'foo
':bar
'(a b)
(defn unless-fn [condition body]
  (if condition nil body))
(unless-fn true (console.log "should not print"))
(defmacro unless
  [condition form]
  (list 'if condition nil form))
(unless true (console.log "should not print"))
(syntax-quote (foo (unquote bar)))
(syntax-quote (foo (unquote bar) (unquote-splicing bazs)))
`(foo bar)
`(foo ~bar)
`(foo ~bar ~@bazs)
(defmacro define-fn
  [name & body]
  `(def ~name (fn ~@body)))
(define-fn print
  [message]
  (.log console message))
(defmacro ->
  [& operations]
  (reduce
   (fn [form operation]
     (cons (first operation)
           (cons form (rest operation))))
   (first operations)
   (rest operations)))
(->
 (open tagret :keypress)
 (filter enter-key?)
 (map get-input-text)
 (reduce render))