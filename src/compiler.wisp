(import [read-from-string] "./reader")
(import [meta with-meta symbol? symbol keyword? keyword
         unquote? unquote-splicing? quote? syntax-quote? name gensym] "./ast")
(import [empty? count list? list first second third rest cons
         reverse map-list concat-list reduce-list list-to-vector] "./list")
(import [odd? dictionary? dictionary merge keys vals contains-vector?
         map-dictionary string? number? vector? boolean?
         true? false? nil? re-pattern? inc dec str] "./runtime")

(defn ^boolean self-evaluating?
  "Returns true if form is self evaluating"
  [form]
  (or (number? form)
      (and (string? form)
           (not (symbol? form))
           (not (keyword? form)))
      (boolean? form)
      (nil? form)
      (re-pattern? form)))


;; Macros

(def __macros__ {})

(defn execute-macro
  "Applies macro registered with given `name` to a given `form`"
  [name form]
  (apply (get __macros__ name)
         (list-to-vector form)))

(defn install-macro
  "Registers given `macro` with a given `name`"
  [name macro-fn]
  (set! (get __macros__ name) macro-fn))

(defn macro?
  "Returns true if macro with a given name is registered"
  [name]
  (and (symbol? name)
       (get __macros__ name)
       true))


(defn make-macro
  "Makes macro"
  [pattern body]
  (let [macro-fn `(fn ~pattern ~@body)]
        ;; compile the macro into native code and use the host's native
        ;; eval to eval it into a function.
        (eval (str "(" (compile (macroexpand macro-fn)) ")"))))


(install-macro
 'defmacro
 (fn
  "Like defn, but the resulting function name is declared as a
  macro and will be used as a macro by the compiler when it is
  called."
  [name signature & body]
  (install-macro name (make-macro signature body))))


;; special forms
;;
;; special forms are like macros for generating source code. It allows the
;; generator to customize how certain forms look in the final output.
;; these could have been macros that expand into basic forms, but we
;; want readable output. Special forms are responsible for integrity
;; checking of the form.

(def __specials__ {})

(defn install-special
  "Installs special function"
  [name f validator]
  (set! (get __specials__ name)
        (fn [form]
          (if validator (validator form))
          (f (rest form)))))

(defn special?
  "Returns true if special form"
  [name]
  (and (symbol? name)
       (get __specials__ name)
       true))

(defn execute-special
  "Expands special form"
  [name form]
  ((get __specials__ name) form))


(defn opt [argument fallback]
  (if (or (nil? argument) (empty? argument)) fallback (first argument)))

(defn apply-form
  "Take a form that has a list of children and make a form that
  applies the children to the function `fn-name`"
  [fn-name form quoted?]
  (cons fn-name
        (if quoted?
            (map-list form (fn [e] (list 'quote e))) form)
            form))

(defn apply-unquoted-form
  "Same as apply-form, but respect unquoting"
  [fn-name form]
  (cons fn-name ;; ast.prepend ???
        (map-list
          form
          (fn [e]
              (if (unquote? e)
                  (second e)
                  (if (and (list? e)
                           (keyword? (first e)))
                      (list 'syntax-quote (second e))
                      (list 'syntax-quote e)))))))

(defn split-splices
  ""
  [form fn-name]

  (defn make-splice
    ""
    [form]
    (if (or (self-evaluating? form)
            (symbol? form))
        (apply-unquoted-form fn-name (list form))
        (apply-unquoted-form fn-name form)))

  (loop [nodes form
         slices '()
         acc '()]
   (if (empty? nodes)
       (reverse
        (if (empty? acc)
            slices
            (cons (make-splice (reverse acc)) slices)))
       (let [node (first nodes)]
        (if (unquote-splicing? node)
            (recur (rest nodes)
                   (cons (second node)
                         (if (empty? acc)
                             slices
                             (cons (make-splice (reverse acc)) slices)))
                   '())
            (recur (rest nodes)
                   slices
                   (cons node acc)))))))


(defn syntax-quote-split
  [append-name fn-name form]
  (let [slices (split-splices form fn-name)]
    (if (= (count slices) 1)
      (first slices)
      (apply-form append-name slices))))


;; compiler


(defn compile-object
  ""
  [form quoted?]
  ;; TODO: Add regexp to the list.
  (cond
    (keyword? form) (compile-keyword form)
    (symbol? form) (compile-symbol form)
    (number? form) (compile-number form)
    (string? form) (compile-string form)
    (boolean? form) (compile-boolean form)
    (nil? form) (compile-nil form)
    (re-pattern? form) (compile-re-pattern form)
    (vector? form) (compile (apply-form 'vector
                                        (apply list form)
                                        quoted?))
    (list? form) (compile (apply-form 'list
                                      form
                                      quoted?))
    (dictionary? form) (compile-dictionary
                        (if quoted?
                          (map-dictionary form (fn [x] (list 'quote x)))
                          form))))

(defn compile-reference
  "Translates references from clojure convention to JS:

  **macros**      __macros__
  list->vector    listToVector
  set!            set
  foo_bar         foo_bar
  number?         isNumber
  create-server   createServer"
  [form]
  (def id (name form))
  ;; **macros** ->  __macros__
  (set! id (.join (.split id "*") "_"))
  ;; list->vector ->  listToVector
  (set! id (.join (.split id "->") "-to-"))
  ;; set! ->  set
  (set! id (.join (.split id "!") ""))
  (set! id (.join (.split id "%") "$"))
  ;; number? -> isNumber
  (set! id (if (identical? (.substr id -1) "?")
             (str "is-" (.substr id 0 (- (.-length id) 1)))
             id))
  ;; create-server -> createServer
  (set! id (.reduce
            (.split id "-")
            (fn [result key]
              (str result
                   (if (and (not (empty? result))
                            (not (empty? key)))
                     (str (.to-upper-case (get key 0)) (.substr key 1))
                     key)))
            ""))
  id)

(defn compile-keyword-reference
  [form]
  (str "\"" (name form) "\""))

(defn compile-syntax-quoted
  ""
  [form]
  (cond
   (list? form) (compile (syntax-quote-split 'concat-list 'list form))
   (vector? form)
    (compile (syntax-quote-split 'concat-vector 'vector (apply list form)))
   (dictionary? form) (compile (syntax-quote-split 'merge 'dictionary form))
   :else (compile-object form)))

(defn compile
  "compiles given form"
  [form]
  (cond
   (self-evaluating? form) (compile-object form)
   (symbol? form) (compile-reference form)
   (keyword? form) (compile-keyword-reference form)
   (vector? form) (compile-object form)
   (dictionary? form) (compile-object form)
   (list? form)
    (let [head (first form)]
      (cond
       (quote? form) (compile-object (second form) true)
       (syntax-quote? form) (compile-syntax-quoted (second form))
       (special? head) (execute-special head form)
       ;; Compile keyword invoke as a property access.
       (keyword? head) (compile (list 'get (second form) head))
       :else (do
              (if (not (or (symbol? head) (list? head)))
                (throw (compiler-error
                        form
                        (str "operator is not a procedure: " head)))
              (compile-invoke form)))))))

(defn compile-program
  "compiles all expansions"
  [forms]
  (loop [result ""
         expressions forms]
    (if (empty? expressions)
      result
      (recur
        (str result
             (if (empty? result) "" ";\n\n")
             (compile (macroexpand (first expressions))))
        (rest expressions)))))

(defn macroexpand-1
  "If form represents a macro form, returns its expansion,
  else returns form."
  [form]
  (if (list? form)
    (let [op (first form)
          id (name op)]
      (cond
        (special? op) form
        (macro? op) (execute-macro op (rest form))
        (and (symbol? op)
             (not (identical? id ".")))
          ;; (.substring s 2 5) => (. s substring 2 5)
          (if (identical? (.char-at id 0) ".")
            (if (< (count form) 2)
              (throw (Error
                "Malformed member expression, expecting (.member target ...)"))
              (cons '.
                    (cons (second form)
                          (cons (symbol (.substr id 1))
                                (rest (rest form))))))

            ;; (StringBuilder. "foo") => (new StringBuilder "foo")
            (if (identical? (.char-at id (- (.-length id) 1)) ".")
              (cons 'new
                    (cons (symbol (.substr id 0 (- (.-length id) 1)))
                          (rest form)))
              form))
        :else form))
      form))

(defn macroexpand
  "Repeatedly calls macroexpand-1 on form until it no longer
  represents a macro form, then returns it."
  [form]
  (loop [original form
         expanded (macroexpand-1 form)]
    (if (identical? original expanded)
      original
      (recur expanded (macroexpand-1 expanded)))))



;; backend specific compiler hooks

(defn compile-template
  "Compiles given template"
  [form]
  (def indent-pattern #"\n *$")
  (def line-break-patter (RegExp "\n" "g"))
  (defn get-indentation [code]
    (let [match (.match code indent-pattern)]
      (or (and match (get match 0)) "\n")))

  (loop [code ""
         parts (.split (first form) "~{}")
         values (rest form)]
    (if (> (.-length parts) 1)
      (recur
       (str
        code
        (get parts 0)
        (.replace (str "" (first values))
                  line-break-patter
                  (get-indentation (get parts 0))))
       (.slice parts 1)
       (rest values))
       (.concat code (get parts 0)))))

(defn compile-def
  "Creates and interns or locates a global var with the name of symbol
  and a namespace of the value of the current namespace (*ns*). If init
  is supplied, it is evaluated, and the root binding of the var is set
  to the resulting value. If init is not supplied, the root binding of
  the var is unaffected. def always applies to the root binding, even if
  the var is thread-bound at the point where def is called. def yields
  the var itself (not its value)."
  [form]
  (compile-template
   (list "var ~{}"
         (compile (cons 'set! form)))))

(defn compile-if-else
  "Evaluates test. If not the singular values nil or false,
  evaluates and yields then, otherwise, evaluates and yields else.
  If else is not supplied it defaults to nil. All of the other
  conditionals in Clojure are based upon the same logic, that is,
  nil and false constitute logical falsity, and everything else
  constitutes logical truth, and those meanings apply throughout."
  [form]
  (let [condition (macroexpand (first form))
        then-expression (macroexpand (second form))
        else-expression (macroexpand (third form))]
    (compile-template
      (list
        (if (and (list? else-expression)
                 (identical? (first else-expression) 'if))
          "~{} ?\n  ~{} :\n~{}"
          "~{} ?\n  ~{} :\n  ~{}")
        (compile condition)
        (compile then-expression)
        (compile else-expression)))))

(defn compile-dictionary
  "Compiles dictionary to JS object"
  [form]
  (let [body
        (loop [body nil
               names (keys form)]
          (if (empty? names)
            body
            (recur
             (str
              (if (nil? body) "" (str body ",\n"))
              (compile-template
               (list
                "~{}: ~{}"
                (compile (first names))
                (compile (macroexpand
                          (get form (first names)))))))
             (rest names))))
        ]
      (if (nil? body) "{}" (compile-template (list "{\n  ~{}\n}" body)))))

(defn desugar-fn-name [form]
  (if (symbol? (first form)) form (cons nil form)))

(defn desugar-fn-doc [form]
  (if (string? (second form))
    form
    (cons (first form) ;; (name nil ... )
          (cons nil (rest form)))))

(defn desugar-fn-attrs [form]
  (if (dictionary? (third form))
    form
    (cons (first form) ;; (name nil ... )
          (cons (second form)
            (cons nil (rest (rest form)))))))

(defn desugar-body [form]
  (if (list? (third form))
    form
    (with-meta
     (cons (first form)
           (cons (second form)
                 (list (rest (rest form)))))
     (meta (third form)))))

(defn compile-fn-params
  ;"compiles function params"
  [params]
  (if (contains-vector? params '&)
    (.join (.map (.slice params 0 (.index-of params '&)) compile) ", ")
    (.join (.map params compile) ", ")))

(defn compile-desugared-fn
  ;"(fn name? [params* ] exprs*)

  ;Defines a function (fn)"
  [name doc attrs params body]
  (compile-template
    (if (nil? name)
      (list "function(~{}) {\n  ~{}\n}"
            (compile-fn-params params)
            (compile-fn-body body params))
      (list "function ~{}(~{}) {\n  ~{}\n}"
            (compile name)
            (compile-fn-params params)
            (compile-fn-body body params)))))

(defn compile-statements
  [form prefix]
  (loop [result ""
         expression (first form)
         expressions (rest form)]
    (if (empty? expressions)
      (str result
           (if (nil? prefix) "" prefix)
           (compile (macroexpand expression))
           ";")
      (recur
        (str result (compile (macroexpand expression)) ";\n")
        (first expressions)
        (rest expressions)))))

(defn compile-fn-body
  [form params]
  (if (and (vector? params) (contains-vector? params '&))
    (compile-statements
      (cons (list 'def
                  (get params (inc (.index-of params '&)))
                  (list
                    'Array.prototype.slice.call
                    'arguments
                    (.index-of params '&)))
      form)
      "return ")
    (compile-statements form "return ")))

(defn compile-fn
  "(fn name? [params* ] exprs*)

  Defines a function (fn)"
  [form]
  (let [signature (desugar-fn-attrs (desugar-fn-doc (desugar-fn-name form)))
        name (first signature)
        doc (second signature)
        attrs (third signature)
        params (third (rest signature))
        body (rest (rest (rest (rest signature))))]
    (compile-desugared-fn name doc attrs params body)))

(defn compile-invoke
  [form]
  (compile-template
   ;; Wrap functions returned by expressions into parenthesis.
   (list (if (list? (first form)) "(~{})(~{})" "~{}(~{})")
         (compile (first form))
         (compile-group (rest form)))))

(defn compile-group
  [form wrap]
  (if wrap
    (str "(" (compile-group form) ")")
    (.join (list-to-vector
            (map-list (map-list form macroexpand) compile)) ", ")))

(defn compile-do
  "Evaluates the expressions in order and returns the value of the last.
  If no expressions are supplied, returns nil."
  [form]
  (compile (list (cons 'fn (cons [] form)))))


(defn define-bindings
  "Returns list of binding definitions"
  [form]
  (loop [defs '()
         bindings form]
    (if (= (count bindings) 0)
      (reverse defs)
      (recur
        (cons
          (list 'def                ; '(def (get bindings 0) (get bindings 1))
                (get bindings 0)    ; binding name
                (get bindings 1))   ; binding value
           defs)
        (rest (rest bindings))))))

(defn compile-let
  "Evaluates the exprs in a lexical context in which the symbols in
  the binding-forms are bound to their respective init-exprs or parts
  therein."
  ; {:added "1.0", :special-form true, :forms '[(let [bindings*] exprs*)]}
  [form]
  ;; TODO: Implement destructure for bindings:
  ;; https://github.com/clojure/clojure/blob/master/src/clj/clojure/core.clj#L3937
  ;; Consider making let a macro:
  ;; https://github.com/clojure/clojure/blob/master/src/clj/clojure/core.clj#L3999
  (compile
    (cons 'do
          (concat-list
            (define-bindings (first form))
            (rest form)))))

(defn compile-throw
  "The expression is evaluated and thrown, therefore it should yield an error."
  [form]
  (compile-template
    (list "(function() { throw ~{}; })()"
          (compile (macroexpand (first form))))))

(defn compile-set
  "Assignment special form.

  When the first operand is a field member access form, the assignment
  is to the corresponding field."
  ; {:added "1.0", :special-form true, :forms '[(loop [bindings*] exprs*)]}
  [form]
  (compile-template
    (list "~{} = ~{}"
      (compile (macroexpand (first form)))
      (compile (macroexpand (second form))))))

(defn compile-vector
  "Creates a new vector containing the args"
  [form]
  (compile-template (list "[~{}]" (compile-group form))))


(defn compile-try
  "The exprs are evaluated and, if no exceptions occur, the value
  of the last is returned. If an exception occurs and catch clauses
  are provided, its exprs are evaluated in a context in which name is
  bound to the thrown exception, and the value of the last is the return
  value of the function. If there is no matching catch clause, the exception
  propagates out of the function. Before returning, normally or abnormally,
  any finally exprs will be evaluated for their side effects."
  [form]
  (loop [try-exprs '()
         catch-exprs '()
         finally-exprs '()
         exprs (reverse form)]
    (if (empty? exprs)
      (if (empty? catch-exprs)
        (compile-template
          (list
            "(function() {\ntry {\n  ~{}\n} finally {\n  ~{}\n}})()"
            (compile-fn-body try-exprs)
            (compile-fn-body finally-exprs)))
        (if (empty? finally-exprs)
          (compile-template
            (list
              "(function() {\ntry {\n  ~{}\n} catch (~{}) {\n  ~{}\n}})()"
              (compile-fn-body try-exprs)
              (compile (first catch-exprs))
              (compile-fn-body (rest catch-exprs))))
          (compile-template
            (list
              "(function() {\ntry {\n  ~{}\n} catch (~{}) {\n  ~{}\n} finally {\n  ~{}\n}})()"
              (compile-fn-body try-exprs)
              (compile (first catch-exprs))
              (compile-fn-body (rest catch-exprs))
              (compile-fn-body finally-exprs)))))
        (if (identical? (first (first exprs)) 'catch)
          (recur try-exprs
                 (rest (first exprs))
                 finally-exprs
                 (rest exprs))
          (if (identical? (first (first exprs)) 'finally)
            (recur try-exprs
                   catch-exprs
                   (rest (first exprs))
                   (rest exprs))
            (recur (cons (first exprs) try-exprs)
                   catch-exprs
                   finally-exprs
                   (rest exprs)))))))

(defn compile-property
  "(. object method arg1 arg2)

  The '.' special form that can be considered to be a method call,
  operator"
  [form]
  ;; (. object method arg1 arg2) -> (object.method arg1 arg2)
  ;; (. object -property) -> object.property
  (if (identical? (aget (name (second form)) 0) "-")
    (compile-template
      (list (if (list? (first form)) "(~{}).~{}" "~{}.~{}")
            (compile (macroexpand (first form)))
            (compile (macroexpand (symbol (.substr (name (second form)) 1))))))
    (compile-template
      (list "~{}.~{}(~{})"
            (compile (macroexpand (first form)))    ;; object name
            (compile (macroexpand (second form)))   ;; method name
            (compile-group (rest (rest form)))))))  ;; args

(defn compile-apply
  [form]
  (compile
    (list '.
          (first form)
          'apply
          (first form)
          (second form))))

(defn compile-new
  "(new Classname args*)
  Compiles new special form. The args, if any, are evaluated
  from left to right, and passed to the constructor of the
  class named by Classname. The constructed object is returned."
  ; {:added "1.0", :special-form true, :forms '[(new Classname args*)]}
  [form]
  (compile-template (list "new ~{}" (compile form))))

(defn compile-compound-accessor
  "Compiles compound property accessor"
  [form]
  (compile-template
    (list "~{}[~{}]"
          (compile (macroexpand (first form)))
          (compile (macroexpand (second form))))))

(defn compile-instance
  "Evaluates x and tests if it is an instance of the class
  c. Returns true or false"
  [form]
  (compile-template (list "~{} instanceof ~{}"
                          (compile (macroexpand (second form)))
                          (compile (macroexpand (first form))))))


(defn compile-not
  "Returns true if x is logical false, false otherwise."
  [form]
  (compile-template (list "!(~{})" (compile (macroexpand (first form))))))


(defn compile-loop
  "Evaluates the body in a lexical context in which the symbols
  in the binding-forms are bound to their respective
  initial-expressions or parts therein. Acts as a recur target."
  [form]
  (let [bindings (apply dictionary (first form))
        names (keys bindings)
        values (vals bindings)
        body (rest form)]
    ;; `((fn loop []
    ;;    ~@(define-bindings bindings)
    ;;    ~@(compile-recur body names)))
    (compile
      (cons (cons 'fn
              (cons 'loop
                (cons names
                  (compile-recur names body))))
            (apply list values)))))

(defn rebind-bindings
  "Rebinds given bindings to a given names in a form of
  (set! foo bar) expressions"
  [names values]
  (loop [result '()
         names names
         values values]
    (if (empty? names)
      (reverse result)
      (recur
       (cons (list 'set! (first names) (first values)) result)
       (rest names)
       (rest values)))))

(defn expand-recur
  "Expands recur special form into params rebinding"
  [names body]
  (map-list body
       (fn [form]
         (if (list? form)
           (if (identical? (first form) 'recur)
             (list 'raw*
                   (compile-group
                    (concat-list
                      (rebind-bindings names (rest form))
                      (list 'loop))
                    true))
             (expand-recur names form))
           form))))

(defn compile-recur
  "Eliminates tail calls in form of recur and rebinds the bindings
  of the recursion point to the parameters of the recur"
  [names body]
  (list
    (list 'raw*
          (compile-template
          (list "var recur = loop;\nwhile (recur === loop) {\n  recur = ~{}\n}"
                (compile-statements (expand-recur names body)))))
    'recur))

(defn compile-raw
  "returns form back since it's already compiled"
  [form]
  (first form))

(install-special 'set! compile-set)
(install-special 'get compile-compound-accessor)
(install-special 'aget compile-compound-accessor)
(install-special 'def compile-def)
(install-special 'if compile-if-else)
(install-special 'do compile-do)
(install-special 'do* compile-statements)
(install-special 'fn compile-fn)
(install-special 'let compile-let)
(install-special 'throw compile-throw)
(install-special 'vector compile-vector)
(install-special 'try compile-try)
(install-special '. compile-property)
(install-special 'apply compile-apply)
(install-special 'new compile-new)
(install-special 'instance? compile-instance)
(install-special 'not compile-not)
(install-special 'loop compile-loop)
(install-special 'raw* compile-raw)


(defn compile-keyword [form] (str "\"" "\uA789" (name form) "\""))
(defn compile-symbol [form] (str "\"" "\uFEFF" (name form) "\""))
(defn compile-nil [form] "void(0)")
(defn compile-number [form] form)
(defn compile-boolean [form] (if (true? form) "true" "false"))
(defn compile-string
  [form]
  (set! form (.replace form (RegExp "\\\\" "g") "\\\\"))
  (set! form (.replace form (RegExp "\n" "g") "\\n"))
  (set! form (.replace form (RegExp "\r" "g") "\\r"))
  (set! form (.replace form (RegExp "\t" "g") "\\t"))
  (set! form (.replace form (RegExp "\"" "g") "\\\""))
  (str "\"" form "\""))

(defn compile-re-pattern
  [form]
  (str form))

(defn install-native
  "Creates an adapter for native operator"
  [alias operator validator fallback]
  (install-special
   alias
   (fn [form]
    (reduce-list
      (map-list form
                (fn [operand]
                  (compile-template
                    (list (if (list? operand) "(~{})" "~{}")
                      (compile (macroexpand operand))))))
      (fn [left right]
        (compile-template
          (list "~{} ~{} ~{}"
                left
                (name operator)
                right)))
      (if (empty? form) fallback nil)))
    validator))

(defn install-operator
  "Creates an adapter for native operator that does comparison in
  monotonical order"
  [alias operator]
  (install-special
   alias
   (fn [form]
    (loop [result ""
           left (first form)
           right (second form)
           operands (rest (rest form))]
      (if (empty? operands)
        (str result
             (compile-template (list "~{} ~{} ~{}"
                                     (compile (macroexpand left))
                                     (name operator)
                                     (compile (macroexpand right)))))
        (recur
          (str result
              (compile-template (list "~{} ~{} ~{} && "
                                      (compile (macroexpand left))
                                      (name operator)
                                      (compile (macroexpand right)))))
          right
          (first operands)
          (rest operands)))))
   verify-two))


(defn compiler-error
  [form message]
  (let [error (Error (str message))]
    (set! error.line 1)
    (throw error)))


(defn verify-two
  [form]
  (if (or (empty? (rest form))
          (empty? (rest (rest form))))
    (throw
      (compiler-error
        form
        (str (first form) " form requires at least two operands")))))

;; Arithmetic Operators
(install-native '+ '+ nil 0)
(install-native '- '- nil "NaN")
(install-native '* '* nil 1)
(install-native '/ '/ verify-two)
(install-native 'mod (symbol "%") verify-two)

;; Logical Operators
(install-native 'and '&&)
(install-native 'or '||)

;; Comparison Operators

(install-operator '= '==)
(install-operator 'not= '!=)
(install-operator '== '==)
(install-operator 'identical? '===)
(install-operator '> '>)
(install-operator '>= '>=)
(install-operator '< '<)
(install-operator '<= '<=)

;; Bitwise Operators

(install-native 'bit-and '& verify-two)
(install-native 'bit-or '| verify-two)
(install-native 'bit-xor (symbol "^"))
(install-native 'bit-not (symbol "~") verify-two)
(install-native 'bit-shift-left '<< verify-two)
(install-native 'bit-shift-right '>> verify-two)
(install-native 'bit-shift-right-zero-fil '>>> verify-two)

(install-macro
 'cond
 (fn cond
   "Takes a set of test/expr pairs. It evaluates each test one at a
   time.  If a test returns logical true, cond evaluates and returns
   the value of the corresponding expr and doesn't evaluate any of the
   other tests or exprs. (cond) returns nil."
   {:added "1.0"}
   [& clauses]
   (if (not (empty? clauses))
     (list 'if (first clauses)
           (if (empty? (rest clauses))
             (throw (Error "cond requires an even number of forms"))
             (second clauses))
           (cons 'cond (rest (rest clauses)))))))

(install-macro
 'defn
 (fn defn
   "Same as (def name (fn [params* ] exprs*)) or
   (def name (fn ([params* ] exprs*)+)) with any doc-string or attrs added
   to the var metadata"
   {:added "1.0" :special-form true }
   [name & body]
   `(def ~name (fn ~name ~@body))))


(install-macro
 'assert
 (fn assert
   "Evaluates expr and throws an exception if it does not evaluate to
   logical true."
   {:added "1.0"}
   [x message]
   (if (nil? message)
     `(assert ~x "")
     `(if (not ~x)
        (throw (Error. (.concat "Assert failed: " ~message "\n" '~x)))))))

(install-macro
 'export
 (fn
   "Helper macro for exporting multiple / single value"
   [& names]
   (if (empty? names)
     nil
     (if (empty? (rest names))
       `(set! module.exports ~(first names))
       (loop [form '() exports names]
         (if (empty? exports)
           `(do* ~@form)
           (recur (cons `(set!
                          (~(symbol (str ".-" (name (first exports))))
                            exports)
                          ~(first exports))
                        form)
                  (rest exports))))))))

(install-macro
 'import
 (fn
   "Helper macro for importing node modules"
   [imports path]
   (if (nil? path)
     `(require ~imports)
     (if (symbol? imports)
       `(def ~imports (require ~path))
       (loop [form '() names imports]
         (if (empty? names)
           `(do* ~@form)
           (let [alias (first names)
                 id (symbol (str ".-" (name alias)))]
             (recur (cons `(def ~alias
                             (~id (require ~path))) form)
                    (rest names)))))))))
;; TODO:
;; - alength
;; - defn with metadata in front of name
;; - declare




(defn map
  [f sequence]
  (if (vector? sequence)
    (map-vector f sequence)
    (map-list2 f sequence)))

(defn map-vector
  [f sequence]
  (.map sequence f))


(defn map-list2
  [f sequence]
  (loop [result '()
         items sequence]
    (if (empty? items)
      (reverse result)
      (recur (cons (f (first items) result) (rest items))))))

(defn filter
  [f sequence]
  (if (vector? sequence)
    (filter-vector f sequence)
    (filter-list f sequence)))

(defn filter-vector
  [f vector]
  (.filter vector f))

(defn filter-list
  [f? list]
  (loop [result '()
         items list]
    (if (empty? items)
      (reverse result)
      (recur (if (f? (first items))
              (cons (first items) result)
              result)
              (rest items)))))



(defn take-vector
  [n vector]
  (.slice vector 0 n))

(defn take-list
  [n list]
  (loop [taken '()
         items list
         n n]
    (if (or (= n 0) (empty? items))
      (reverse taken)
      (recur (cons (first items) taken)
             (rest items)
             (dec n)))))

(defn take
  [n sequence]
  (if (vector? sequence)
    (take-vector n sequence)
    (take-list n sequence)))



(defn variadic?
  "Returns true if function signature is variadic"
  [params]
  (>= (.index-of params '&) 0))

(defn overload-arity
  "Returns aritiy of the expected arguments for the
  overleads signature"
  [params]
  (if (variadic?)
    (.index-of params '&)
    (.-length params)))


(defn analyze-overloaded-fn
  "Compiles function that has overloads defined"
  [name doc attrs overloads]
  (map (fn [overload]
         (let [params (first overload)
               variadic (variadic? params)
               fixed-arity (if variadic
                              (- (count params) 2)
                              (count params))]
           {:variadic variadic
            :rest (if variadic? (get params (dec (count params))) nil)
            :fixed-arity fixed-arity
            :params (take fixed-arity params)
            :body (rest overload)}))
       overloads))

(defn compile-overloaded-fn
  [name doc attrs overloads]
  (let [methods (analyze-overloaded-fn name doc attrs overloads)
        fixed-methods (filter (fn [method] (not (:variadic method))) methods)
        variadic (first (filter (fn [method] (:variadic method)) methods))
        names (reduce-list methods
                           (fn [a b]
                            (if (> (count a) (count (get b :params)))
                              a
                              (get b :params))) [])]
    (list 'fn name doc attrs names
          (list 'raw*
                (compile-switch
                  'arguments.length
                  (map (fn [method]
                    (cons (:fixed-arity method)
                          (list 'raw*
                                (compile-fn-body
                                  (concat-list
                                    (compile-rebind names (:params method))
                                    (:body method))))))
                    fixed-methods)
                  (if (nil? variadic)
                    '(throw (Error "Invalid arity"))
                    (list 'raw*
                          (compile-fn-body
                            (concat-list
                              (compile-rebind
                                (cons `(Array.prototype.slice.call
                                        arguments
                                        ~(:fixed-arity variadic))
                                      names)
                                (cons (:rest variadic)
                                      (:params variadic)))
                              (:body variadic)))))))
          nil)))


(defn compile-rebind
  "Takes vector of bindings and a vector of names this binding needs to
  get bound to and returns list of def expressions that bind bindings to
  a new names. If names matches associated binding it will be ignored."
  [bindings names]
  ;; Loop through the given names and bindings and assembling a `form`
  ;; list containing set expressions.
  (loop [form '()
         bindings bindings
         names names]
    ;; If all the names have bing iterated return reversed form. Form is
    ;; reversed since later bindings will be cons-ed later, appearing in
    ;; inverse order.
    (if (empty? names)
      (reverse form)
      (recur
       ;; If name and binding are identical then rebind is unnecessary
       ;; and it's skipped. Also not skipping such rebinds could be
       ;; problematic as definitions may shadow bindings.
       (if (identical? (first names) (first bindings))
         form
         (cons (list 'def (first names) (first bindings)) form))
       (rest bindings)
       (rest names)))))

(defn compile-switch-cases
  [cases]
  (reduce-list
   cases
   (fn [form case-expression]
     (str form
          (compile-template
           (list "case ~{}:\n  ~{}\n"
                 (compile (macroexpand (first case-expression)))
                 (compile (macroexpand (rest case-expression)))))))
   ""))


(defn compile-switch
  [value cases default-case]
  (compile-template
   (list "switch (~{}) {\n  ~{}\n  default:\n    ~{}\n}"
         (compile (macroexpand value))
         (compile-switch-cases cases)
         (compile (macroexpand default-case)))))

(install-macro
  'fn*
  (fn
  "Defines function form"
  [name doc attrs & body]
  ;; If second argument is a vector than function does not defiens
  ;; any overloads so we just create reguralr `fn`.
  (if (vector? (first body))
    `(fn ~name ~doc ~attrs ~@body)
    ;; Otherwise we iterate over each overlead forming a relevant
    ;; conditions.
    (compile-overloaded-fn name doc attrs body))))


(export
  self-evaluating?
  compile
  compile-program
  macroexpand
  macroexpand-1)
