;; List of built in macros for LispyScript. This file is included by
;; default by the LispyScript compiler.

(defmacro set!
  "Assignment special form.
  When the first operand is a field member access form,
  the assignment is to the corresponding field. If it is
  an instance field, the instance expression will be evaluated,
  then the expr. In all cases the value of expression is returned."
  [binding expression]
  `(js* "~{} = ~{}" ~binding ~expression))

(defmacro get
  "Returns the value mapped to key, not-found or nil if key not present."
  ([map key] (js* "~{}[~{}]" ~map ~key))
  ([map key not-found]
     (js* "~{} in ~{} ? ~{}[~{}] : ~{}" ~key ~map ~map ~key ~not-found)))

(defmacro def-macro-alias [name alias]
  `(defmacro ~alias '[& body]
     (~name '(unquote @body))))

(defmacro def
  "Defines a varible with given initial value or undefined"
  ([name] `(def ~name (void)))
  ([name value] (js* "var ~{}" (set! ~name ~value))))

(def-macro-alias def var)

(defmacro void [] `(js* "void 0"))


(defmacro statements
  ([body] `(js* "~{}" ~body))
  ([first & rest] `(js* "~{};\n~{};" ~first (statements ~@rest))))

(defmacro expressions
  ([body] `(js* "return ~{}" ~body))
  ([first & rest] `(js* "~{};\n~{}" ~first (expressions ~@rest))))

(defmacro fn
  [params & body]
  `(js* "function(~{}) {\n  ~{};\n}"
        (symbols-join (symbol ", ") ~@params)
        (expressions ~@body)))

(defmacro fn-scope
  [& body]
  `(js* "function() {\n  ~{};\n}"
        (statements ~@body)))

(def-macro-alias fn function)
(def-macro-alias fn lambda)
(defmacro if
  ([condition then] `(if ~condition ~then (void)))
  ([condition then else]
   `(js* "~{} ?\n  ~{} :\n  ~{}" ~condition ~then ~else)))

(defmacro defn
  ([name params & body]
     `(def ~name
        (fn ~params ~@body)))
  ([name doc params & body]
     `(def ~name
        (fn ~params ~@body))))

(def-macro-alias defn defn-)

(defmacro new
  "The args, if any, are evaluated from left to right, and passed to the
  constructor. The constructed object is returned."
  [& body]
  (js* "new ~{}" ~body))

(defmacro throw
  "The expression is evaluated and thrown."
  [expression]
  `((function [] (js* "throw ~{}" ~expression))))

(defmacro try
  ([expression]
   `(try ~expression (catch 'ignore (void))))
  ([expression catch-clause]
   `((fn-scope
      (js* "try {\n  ~{}\n} ~{}" (expressions ~expression) ~catch-clause))))
  ([expression catch-clause finally-clause]
   `((fn-scope
       (js* "try {\n  ~{}\n} ~{} ~{}"
            (expressions ~expression) ~catch-clause ~finally-clause)))))

(defmacro catch
  ([type error & body]
   `(js* "catch (~{}) {\n  ~{}\n}"
         ~error (expressions ~@body))))

(defmacro finally [& body]
  `(js* "finally {\n  ~{}\n}" (statements ~@body)))

(defmacro dispatch
 ([body] `(js* "/~{}/" (symbol ~body))))

(defmacro re-pattern
 ([body] `(js* "/~{}/" (symbol ~body))))

(defmacro Array
  ;; TODO improve it and avoid (symbols-join)
  ([]
    (js* "[]"))
  ([& body]
    (js* "[ ~{} ]" (symbols-join (symbol ", ") ~@body))))

(defmacro def-operator [operator]
  `(defmacro ~operator [left right]
     (js* "~{} ~{} ~{}" '(unquote left) ~operator '(unquote right))))

(def-operator ===)
(def-operator ==)
(def-operator !=)
(def-operator !==)
(def-operator >)
(def-operator >=)
(def-operator <)
(def-operator <=)

(def-macro-alias === identical?)
(def-macro-alias === =)

(defmacro ! [expression] (js* "!~{}" ~expression))
(def-macro-alias ! not)

(defmacro nil? [value]
  `(== ~value 'null))
(defmacro true? [value]
  `(identical? ~value 'true))
(defmacro false? [value]
  `(identical? ~value 'false))

(defmacro def-type-predicate [name type]
  `(defmacro ~name [expression]
     (=== (.call Object.prototype.toString '(unquote expression))
           (js* "'[object ~{}]'" ~type))))

(def-type-predicate object? Object)
(def-type-predicate null? Null)
(def-type-predicate undefined? Undefined)
(def-type-predicate array? Array)
(def-type-predicate string? String)
(def-type-predicate regexp? Regexp)
(def-type-predicate date? Date)
(def-type-predicate number? Number)
(def-type-predicate boolean? Boolean)
(def-type-predicate function? Function)


(defmacro do (& body)
  `((fn [] ~@body)))

(defmacro when [condition & body]
  `(if ~condition (do ~@body)))

(defmacro unless [condition & body]
  `(when (! ~condition) (do ~@body)))

(defmacro each [& body]
  `(Array.prototype.forEach.call ~@body))

(defmacro map [& body]
  `(Array.prototype.map.call ~@body))

(defmacro filter [& body]
  `(Array.prototype.filter.call ~@body))

(defmacro some [& body]
  `(Array.prototype.some.call ~@body))

(defmacro every [& body]
  `(Array.prototype.every.call ~@body))

(defmacro reduce [& body]
  `(Array.prototype.reduce.call ~@body))

(defmacro template [params & body](def-operator -)
  `(fn ~params
             (str ~@body)))

(defmacro def-operator [operator]
  `(defmacro ~operator
     ([x y] (js* "~{} ~{} ~{}" '(unquote x) ~operator '(unquote y)))
     ([x & rest] (~operator '(unquote  x) (~operator '(unquote @rest))))))

(def-operator -)
(def-operator +)
(def-operator *)
(def-operator %)
(def-operator ||)
(def-operator &&)

(def-macro-alias || or)
(def-macro-alias && and)

(defmacro dec [x]
  `(- ~x 1))

(defmacro inc [x]
  `(+ ~x 1))

(defmacro zero? [x]
  `(=== ~x 0))

(defmacro pos? [x]
  `(> ~x 0))

(defmacro neg? [x]
  `(< ~x 0))


(defmacro comment
  "Comments are ignored"
  [& comments] `(js* ""))