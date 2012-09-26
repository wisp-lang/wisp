(import [read-from-string] "./reader")
(import [meta with-meta symbol? symbol keyword? keyword
         unquote? unquote unquote-splicing? unquote-splicing
         quote? quote syntax-quote? syntax-quote
         name gensym deref set atom? symbol-identical?] "./ast")
(import [empty? count list? list first second third rest cons
         reverse map-list concat-list reduce-list list-to-vector] "./list")
(import [odd? dictionary? dictionary merge keys contains-vector?
         map-dictionary nil string? number? vector? boolean?
         true? false? nil?] "./runtime")

(defn ^boolean self-evaluating?
  "Returns true if form is self evaluating"
  [form]
  (or (number? form)
      (and (string? form)
           (not (symbol? form)))
      (boolean? form)
      (nil? form)
      (keyword? form)))



;; Macros

(def __macros__ {})

(defn execute-macro
  "Applies macro registered with given `name` to a given `form`"
  [name form]
  ((get __macros__ name) form))

(defn install-macro
  "Registers given `macro` with a given `name`"
  [name macro]
  (set! (get __macros__ name) macro))

(defn macro?
  "Returns true if macro with a given name is registered"
  [name]
  (and (symbol? name)
       (get __macros__ name)
       true))


(defn make-macro
  "Makes macro"
  [pattern body]
  (let [x (gensym)
        program (compile
                  (macroexpand
                    ; `(fn [~x] (apply (fn ~pattern ~@body) (rest ~x)))
                    (cons (symbol "fn")
                      (cons pattern body))))
        ;; compile the macro into native code and use the host's native
        ;; eval to eval it into a function.
        macro (eval (str "(" program ")"))
        ]
    (fn [form]
      (try
        (apply macro (list-to-vector (rest form)))
        (catch Error error
          (throw (compiler-error form error.message)))))))


;; system macros
(install-macro
 (symbol "defmacro")
 (fn [form]
   (let [signature (rest form)]
     (let [name (first signature)
           pattern (second signature)
           body (rest (rest signature))]

       ;; install it during expand-time
       (install-macro name (make-macro pattern body))))))


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
            (map-list form (fn [e] (list quote e))) form)
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
                      (list syntax-quote (second e))
                      (list syntax-quote e)))))))

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
         slices (list)
         acc (list)]
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
                   (list))
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
  [form]
  ;; TODO: Add regexp to the list.
  (cond
    (keyword? form) (compile (list (symbol "::compile:keyword") form))
    (symbol? form) (compile (list (symbol "::compile:symbol") form))
    (number? form) (compile (list (symbol "::compile:number") form))
    (string? form) (compile (list (symbol "::compile:string") form))
    (boolean? form) (compile (list (symbol "::compile:boolean") form))
    (nil? form) (compile (list (symbol "::compile:nil") form))
    (vector? form) (compile (apply-form (symbol "vector") (apply list form)))
    (list? form) (compile (apply-form (symbol "list") form))
    (dictionary? form) (compile-dictionary form)))

(defn compile-reference
  "Translates references from clojure convention to JS:

  **macros**      __macros__
  list->vector    listToVector
  set!            set
  raw%            raw$
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
  ;; raw% -> raw$
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

(defn compile-syntax-quoted
  ""
  [form]
  (cond
   (list? form)
    (compile
      (syntax-quote-split
        (symbol "concat-list")
        (symbol "list")
        form))
   (vector? form)
    (compile
      (syntax-quote-split
        (symbol "concat-vector")
        (symbol "vector")
        (apply list form)))
   (dictionary? form)
    (compile
      (syntax-quote-split
        (symbol "merge")
        (symbol "dictionary")
        form))
   :else
    (compile-object form)))

(defn compile
  "compiles given form"
  [form]
  (cond
   (self-evaluating? form) (compile-object form)
   (symbol? form) (compile-reference form)
   (vector? form) (compile-object form)
   (dictionary? form) (compile-object form)
   (list? form)
    (let [head (first form)]
      (cond
       (quote? form) (compile-object (second form))
       (syntax-quote? form) (compile-syntax-quoted (second form))
       (special? head) (execute-special head form)
       :else (do
              (if (not (or (symbol? head) (list? head)))
                (throw (str "operator is not a procedure: " head))
              (compile (list (symbol "::compile:invoke") head (rest form)))))))))

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
        (macro? op) (execute-macro op form)
        (and (symbol? op)
             (not (identical? id ".")))
          ;; (.substring s 2 5) => (. s substring 2 5)
          (if (identical? (.char-at id 0) ".")
            (if (< (count form) 2)
              (throw (Error
                "Malformed member expression, expecting (.member target ...)"))
              (cons (symbol ".")
                    (cons (second form)
                          (cons (symbol (.substr id 1))
                                (rest (rest form))))))

            ;; (StringBuilder. "foo") => (new StringBuilder "foo")
            (if (identical? (.char-at id (- (.-length id) 1)) ".")
              (cons (symbol "new")
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
         (compile (cons (symbol "set!") form)))))

(defn compile-if-else
  "Evaluates test. If not the singular values nil or false,
  evaluates and yields then, otherwise, evaluates and yields else.
  If else is not supplied it defaults to nil. All of the other
  conditionals in Clojure are based upon the same logic, that is,
  nil and false constitute logical falsity, and everything else
  constitutes logical truth, and those meanings apply throughout."
  [form]
  (compile-template
    (list "~{} ?\n  ~{} :\n  ~{}"
          (compile (macroexpand (first form)))    ; condition
          (compile (macroexpand (second form)))   ; then
          (compile (macroexpand (third form)))))) ; else or nil

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
                (name (first names))
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
  (if (contains-vector? params (symbol "&"))
    (.join (.map (.slice params 0 (.index-of params (symbol "&"))) compile) ", ")
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
  (if (and (vector? params) (contains-vector? params (symbol "&")))
    (compile-statements
      (cons (list (symbol "def")
                  (get params (inc (.index-of params (symbol "&"))))
                  (list
                    (symbol "Array.prototype.slice.call")
                    (symbol "arguments")
                    (.index-of params (symbol "&"))))
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

(defn compile-fn-invoke
  [form]
  (compile-template
   ;; Wrap functions returned by expressions into parenthesis.
   (list (if (list? (first form)) "(~{})(~{})" "~{}(~{})")
         (compile (first form))
         (compile-group (second form)))))

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
  (compile (list (cons (symbol "fn") (cons (Array) form)))))


(defn define-bindings
  "Returns list of binding definitions"
  [bindings]
  (loop [defs (list)
         bindings bindings]
    (if (= (.-length bindings) 0)
      (reverse defs)
      (recur
        (cons
          (list (symbol "def")      ; '(def (get bindings 0) (get bindings 1))
                (get bindings 0)    ; binding name
                (get bindings 1))   ; binding value
           defs)
        (.slice bindings 2)))))

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
    (cons (symbol "do")
          (concat-list
            (define-bindings (first form))
            (rest form)))))

(defn compile-throw
  "The expression is evaluated and thrown, therefore it should yield an error."
  [form]
  (compile-template
    (list "(function() { throw ~{}; })()"
          (compile (first form)))))

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
  (loop [try-exprs (list)
         catch-exprs (list)
         finally-exprs (list)
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
        (if (symbol-identical? (first (first exprs))
                               (symbol "catch"))
          (recur try-exprs
                 (rest (first exprs))
                 finally-exprs
                 (rest exprs))
          (if (symbol-identical? (first (first exprs))
                                 (symbol "finally"))
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
    (compile
      (cons (symbol (str (compile (macroexpand (first form)))  ;; object name
                    "."
                    (compile (macroexpand (second form)))))    ;; method name
            (rest (rest form))))))               ;; args

(defn compile-apply
  [form]
  (compile
    (list (symbol ".")
          (first form)
          (symbol "apply")
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

(defn compile-str
  "Compiles str special form"
  [form]
  (if (empty? form)
    (compile-str (list ""))
    (compile (cons (symbol "+") form))))

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
  (compile-template (list "!~{}" (compile (macroexpand (first form))))))


(defn compile-loop
  "Evaluates the body in a lexical context in which the symbols
  in the binding-forms are bound to their respective
  initial-expressions or parts therein. Acts as a recur target."
  [form]
  (let [bindings (first form)
        body (rest form)]
    ;; `((fn loop []
    ;;    ~@(define-bindings bindings)
    ;;    ~@(compile-recur body names)))
    (compile (list (cons (symbol "fn")
                (cons (symbol "loop")
                      (cons (Array)
                            (concat-list
                              (define-bindings bindings)
                                (compile-recur bindings body)))))))))

(defn rebind-bindings
  "Rebinds given bindings to a given names in a form of
  (set! foo bar) expressions"
  [old-bindings new-values]
  (loop [result (list)
         bindings old-bindings
         values new-values]
    (if (empty? bindings)
      (reverse result)
      (recur
       (cons (list (symbol "set!") (first bindings) (first values)) result)
       (rest (rest bindings))
       (rest values)))))


(defn expand-recur
  "Expands recur special form into params rebinding"
  [bindings body]
  (map-list body
       (fn [form]
         (if (list? form)
           (if (identical? (first form) (symbol "recur"))
             (list (symbol "::raw")
                   (compile-group
                    (concat-list
                      (rebind-bindings bindings (rest form))
                      (list (symbol "loop")))
                    true))
             (expand-recur bindings form))
           form))))

(defn compile-recur
  "Eliminates tail calls in form of recur and rebinds the bindings
  of the recursion point to the parameters of the recur"
  [bindings body]
  (list
    (list (symbol "::raw")
          (compile-template
          (list "\nvar recur = loop;\nwhile (recur === loop) {\n  recur = ~{}\n}"
                (compile-statements (expand-recur bindings body)))))
    (symbol "recur")))

(defn compile-raw
  "returns form back since it's already compiled"
  [form]
  (first form))

(install-special (symbol "set!") compile-set)
(install-special (symbol "get") compile-compound-accessor)
(install-special (symbol "aget") compile-compound-accessor)
(install-special (symbol "def") compile-def)
(install-special (symbol "if") compile-if-else)
(install-special (symbol "do") compile-do)
(install-special (symbol "do*") compile-statements)
(install-special (symbol "fn") compile-fn)
(install-special (symbol "let") compile-let)
(install-special (symbol "throw") compile-throw)
(install-special (symbol "vector") compile-vector)
(install-special (symbol "array") compile-vector)
(install-special (symbol "try") compile-try)
(install-special (symbol ".") compile-property)
(install-special (symbol "apply") compile-apply)
(install-special (symbol "new") compile-new)
(install-special (symbol "instance?") compile-instance)
(install-special (symbol "not") compile-not)
(install-special (symbol "str") compile-str)
(install-special (symbol "loop") compile-loop)
(install-special (symbol "::raw") compile-raw)
(install-special (symbol "::compile:invoke") compile-fn-invoke)




(install-special (symbol "::compile:keyword")
  ;; Note: Intentionally do not prefix keywords (unlike clojurescript)
  ;; so that they can be used with regular JS code:
  ;; (.add-event-listener window :load handler)
  (fn [form] (str "\"" (name (first form)) "\"")))

(install-special (symbol "::compile:reference")
  (fn [form] (name (compile-reference (first form)))))

(install-special (symbol "::compile:symbol")
  (fn [form]
    (compile
      (list (symbol "symbol") (name (first form))))))
  ;(fn [form] (str "\"" "\uFEFF" (name (first form)) "\"")))

(install-special (symbol "::compile:nil")
  (fn [form] "void(0)"))

(install-special (symbol "::compile:number")
  (fn [form] (first form)))

(install-special (symbol "::compile:boolean")
  (fn [form] (if (true? (first form)) "true" "false")))

(install-special (symbol "::compile:string")
  (fn [form]
    (set! string (first form))
    (set! string (.replace string (RegExp "\\\\" "g") "\\\\"))
    (set! string (.replace string (RegExp "\n" "g") "\\n"))
    (set! string (.replace string (RegExp "\r" "g") "\\r"))
    (set! string (.replace string (RegExp "\t" "g") "\\t"))
    (set! string (.replace string (RegExp "\"" "g") "\\\""))
    (str "\"" string "\"")))

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
(install-native (symbol "+") (symbol "+") nil 0)
(install-native (symbol "-") (symbol "-") nil "NaN")
(install-native (symbol "*") (symbol "*") nil 1)
(install-native (symbol "/") (symbol "/") verify-two)
(install-native (symbol "mod") (symbol "%") verify-two)
(install-native (symbol "inc") (symbol "++"))
(install-native (symbol "dec") (symbol "--"))

;; Logical Operators
(install-native (symbol "and") (symbol "&&"))
(install-native (symbol "or") (symbol "||"))

;; Comparison Operators

(install-operator (symbol "=") (symbol "=="))
(install-operator (symbol "not=") (symbol "!="))
(install-operator (symbol "==") (symbol "=="))
(install-operator (symbol "identical?") (symbol "==="))
(install-operator (symbol ">") (symbol ">"))
(install-operator (symbol ">=") (symbol ">="))
(install-operator (symbol "<") (symbol "<"))
(install-operator (symbol "<=") (symbol "<="))

;; Bitwise Operators

(install-native (symbol "bit-and") (symbol "&") verify-two)
(install-native (symbol "bit-or") (symbol "|") verify-two)
(install-native (symbol "bit-xor") (symbol "^"))
(install-native (symbol "bit-not ") (symbol "~") verify-two)
(install-native (symbol "bit-shift-left") (symbol "<<") verify-two)
(install-native (symbol "bit-shift-right") (symbol ">>") verify-two)
(install-native (symbol "bit-shift-right-zero-fil") (symbol ">>>") verify-two)

(defn defmacro-from-string
  "Installs macro by from string, by using new reader and compiler.
  This is temporary workaround until we switch to new compiler"
  [macro-source]
  (compile-program
    (macroexpand
      (read-from-string (str "(do " macro-source ")")))))

(defmacro-from-string
"
(defmacro cond
  \"Takes a set of test/expr pairs. It evaluates each test one at a
  time.  If a test returns logical true, cond evaluates and returns
  the value of the corresponding expr and doesn't evaluate any of the
  other tests or exprs. (cond) returns nil.\"
  ;{:added \"1.0\"}
  [clauses]
  (set! clauses (apply list arguments))
  (if (not (empty? clauses))
    (list 'if (first clauses)
          (if (empty? (rest clauses))
            (throw (Error \"cond requires an even number of forms\"))
            (second clauses))
          (cons 'cond (rest (rest clauses))))))

(defmacro defn
   \"Same as (def name (fn [params* ] exprs*)) or
   (def name (fn ([params* ] exprs*)+)) with any doc-string or attrs added
   to the var metadata\"
  ;{:added \"1.0\", :special-form true ]}
  [name]
  (def body (apply list (Array.prototype.slice.call arguments 1)))
  `(def ~name (fn ~name ~@body)))

(defmacro import
  \"Helper macro for importing node modules\"
  [imports path]
  (if (symbol? imports)
    `(def ~imports (require ~path))
    (loop [form '() names imports]
      (if (empty? names)
        `(do* ~@form)
        (let [alias (first names)
              id (symbol (str \".-\" (name alias)))]
          (recur (cons `(def ~alias
                          (~id (require ~path))) form)
                 (rest names)))))))

(defmacro export
  \"Helper macro for exporting multiple / single value\"
  [& names]
  (if (empty? names)
    nil
    (if (empty? (rest names))
      `(set! module.exports ~(first names))
      (loop [form '() exports names]
        (if (empty? exports)
          `(do* ~@form)
          (recur (cons `(set!
                         (~(symbol (str \".-\" (name (first exports))))
                           exports)
                         ~(first exports))
                       form)
               (rest exports)))))))
")

;; TODO:
;; - alength
;; - defn with metadata in front of name
;; - declare

(export
  self-evaluating?
  compile
  compile-program
  macroexpand
  macroexpand-1)
