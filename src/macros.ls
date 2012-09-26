;; List of built in macros for LispyScript. This file is included by
;; default by the LispyScript compiler.

(defmacro str
  ""
  ([& strings] `(js* "''.concat(~{})" (group* ~@strings))))

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
  ([map key] `(js* "~{}[~{}]" ~map ~key))
  ([map key not-found]
     `(js* "~{} in ~{} ? ~{}[~{}] : ~{}" ~key ~map ~map ~key ~not-found)))

(defmacro def-macro-alias [name alias]
  `(defmacro ~alias '[& body]
     (~name '(unquote @body))))

(defmacro def
  "Defines a varible with given initial value or undefined"
  ([name] `(def ~name (void)))
  ([name value] (js* "var ~{}" (set! ~name ~value))))

(def-macro-alias def var)

(defmacro void [] `(js* "void 0"))

(defmacro def-bindings*
  "Defines bindings"
  ([name value] `(def ~name ~value))
  ([name value & bindings]
   `(statements*
     (def ~name ~value)
     (def-bindings* ~@bindings))))

(defmacro let [bindings & body]
  `((fn []
      (def-bindings* ~@bindings)
      ~@body)))

(defmacro invoke-method*
  ([name target]
    `(js* "~{}.~{}()" ~target ~name))
  ([name target & args]
    `(js* "~{}.~{}(~{})" ~target ~name (group* ~@args))))

(defmacro get-property*
  ([target name] `(js* "~{}.~{}" ~target ~name)))

(defmacro statements*
  ([body] `(js* "~{}" ~body))
  ([first & rest] `(js* "~{};\n~{}" ~first (statements* ~@rest))))

(defmacro group*
  "Expands each expression & groups with `,` delimiter"
  ([] `(js* "" ""))
  ([expression] `(js* "~{}" ~expression))
  ([expression & expressions]
    `(js* "~{}, ~{}" ~expression (group* ~@expressions))))

(defmacro group-statements*
  "Expands each expression a JS statement & groups them via `,` delimiter"
  ([single] `(js* "~{}" ~single))
  ([first & rest] `(js* "~{},\n~{}" ~first (group-statements* ~@rest))))

(defmacro grouped-statements*
  "Expands each expression to a JS statement, gropus them via `,` delimiter
  and wraps group into parentheses"
  ([single] `(js* "~{}" ~single))
  ([first & rest] `(js* "(~{},\n ~{})" ~first (group-statements* ~@rest))))

(defmacro expressions*
  ([body] `(js* "return ~{}" ~body))
  ([first & rest] `(js* "~{};\n~{}" ~first (expressions* ~@rest))))

(defmacro named-fn*
  [name params & body]
  `(js* "function ~{}(~{}) {\n  ~{};\n}"
        ~name
        (symbols-join (symbol* ", ") ~@params)
        (expressions* ~@body)))

(defmacro fn
  [params & body]
  `(js* "function(~{}) {\n  ~{};\n}"
        (symbols-join (symbol* ", ") ~@params)
        (expressions* ~@body)))

(defmacro fn-scope*
  [& body]
  `(js* "function() {\n  ~{};\n}"
        (statements* ~@body)))

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
  `(js* "new ~{}" ~body))

(defmacro throw
  "The expression is evaluated and thrown."
  [expression]
  `((fn-scope* (js* "throw ~{}" ~expression))))

(defmacro try
  ([expression]
   `(try ~expression (catch 'ignore (void))))
  ([expression catch-clause]
   `((fn-scope*
      (js* "try {\n  ~{}\n} ~{}" (expressions* ~expression) ~catch-clause))))
  ([expression catch-clause finally-clause]
   `((fn-scope*
       (js* "try {\n  ~{}\n} ~{} ~{}"
            (expressions* ~expression) ~catch-clause ~finally-clause)))))

(defmacro catch
  ([type error & body]
   `(js* "catch (~{}) {\n  ~{}\n}"
         ~error (expressions* ~@body))))

(defmacro finally [& body]
  `(js* "finally {\n  ~{}\n}" (statements* ~@body)))

(defmacro dispatch*
 ([body] `(js* "/~{}/" (symbol* ~body))))

(defmacro array
  ;; TODO improve it and avoid (symbols-join)
  ([]
     `(js* "[]"))
  ([item]
     `(js* "[ ~{} ]" ~item))
  ([& body]
    `(js* "[ ~{} ]" (symbols-join (symbol* ", ") ~@body))))

(defmacro def-operator [operator]
  `(defmacro ~operator
     ([x y] (js* "(~{} ~{} ~{})" '(unquote x) ~operator '(unquote y)))
     ([x & rest] (~operator '(unquote  x) (~operator '(unquote @rest))))))

(def-operator -)
(def-operator +)
(def-operator *)
(def-operator /)
(def-operator %)
(def-operator ||)
(def-operator &&)

(def-operator ===)
(def-operator ==)
(def-operator !=)
(def-operator !==)
(def-operator >)
(def-operator >=)
(def-operator <)
(def-operator <=)

(def-macro-alias === identical?)
(def-macro-alias == =)

(defmacro ! [expression] `(js* "!~{}" ~expression))
(def-macro-alias ! not)

(defmacro nil? [value]
  `(= ~value 'null))
(defmacro null? [value]
  `(identical? ~value 'null))
(defmacro undefined? [value]
  `(identical? ~value 'undefined))
(defmacro true? [value]
  `(identical? ~value 'true))
(defmacro false? [value]
  `(identical? ~value 'false))
(defmacro object? [value]
  `(and ~value (type-of? ~value "object")))
(defmacro fn? [value]
  `(and ~value (type-of? ~value "function")))


(defmacro type-of? [value type]
  `(identical? (typeof ~value) ~type))

(defmacro def-typeof-predicate [name type]
  `(defmacro ~name [expression]
    (type-of? '(unquote expression) ~type)))

(defmacro def-type-predicate [name type]
  `(defmacro ~name [expression]
     (identical? (.call Object.prototype.toString '(unquote expression))
           (js* "'[object ~{}]'" ~type))))

(def-typeof-predicate boolean? "boolean")
(def-typeof-predicate function? "function")

(def-type-predicate string? String)
(def-type-predicate array? Array)
(def-type-predicate vector? Array)
(def-type-predicate regexp? Regexp)
(def-type-predicate date? Date)
(def-type-predicate number? Number)
(def-type-predicate arguments? Arguments)

(defmacro do (& body)
  `((fn [] ~@body)))

(defmacro when [condition & body]
  `(if ~condition (do ~@body)))

(defmacro unless [condition & body]
  `(when (! ~condition) (do ~@body)))

(defmacro apply [f params]
  `(.apply ~f ~f ~params))

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

(def-macro-alias || or)
(def-macro-alias && and)

(defmacro dec [x]
  `(- ~x 1))

(defmacro inc [x]
  `(+ ~x 1))

(defmacro zero? [x]
  `(identical? ~x 0))

(defmacro pos? [x]
  `(> ~x 0))

(defmacro neg? [x]
  `(< ~x 0))


(defmacro comment
  "Comments are ignored"
  [& comments] `(js* ""))

(defmacro while*
 "Internal special macro for generating while loops"
 [condition & body]
 `(js* "while (~{}) {\n  ~{}\n}" ~condition (statements* ~@body)))

(defmacro loop*
  "Internal special macro for generating tail optimized recursive loops"
  [names values body]
  `((named-fn* 'loop [~@names]
    (def recur 'loop)
    (while* (identical? 'recur 'loop)
      (set! 'recur (grouped-statements* ~@body)))
    'recur) ~@values))

(defmacro cond
  "Takes a set of test/expr pairs. It evaluates each test one at a
  time.  If a test returns logical true, cond evaluates and returns
  the value of the corresponding expr and doesn't evaluate any of the
  other tests or exprs."
  ([] (void))
  ([condition then]
   `(cond ~condition ~then (void)))
  ([condition then else]
   `(js* "~{} ? (~{}) :\n~{}" ~condition ~then ~else))
  ([condition then & rest]
   (cond ~condition ~then (cond ~@rest))))

(def-macro-alias get aget)

;; Defining helper macros to simplify module import / exports.
(defmacro destructure*
  "Helper macro for destructuring object"
  ([source name] `(def ~name (js* "~{}.~{}" ~source ~name)))
  ([source name & names]
   `(statements*
     (destructure* ~source ~name)
     (destructure* ~source ~@names))))

(defmacro import
  "Helper macro for importing node modules"
  ([path]
   `(require ~path))
  ([names path]
   `(destructure* (import ~path) ~@names)))

(defmacro export*
  ([source name]
   `(set! (js* "~{}.~{}" ~source ~name) ~name))
  ([source name & names]
   `(statements*
     (export* ~source ~name)
     (export* ~source ~@names))))

(defmacro export
  ([name]
   `(set! module.exports ~name))
  ([& names]
   `(export* 'exports ~@names)))
