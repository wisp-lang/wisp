(import [read-from-string] "./reader")
(import [meta with-meta symbol? symbol keyword? keyword namespace
         unquote? unquote-splicing? quote? syntax-quote? name gensym pr-str] "./ast")
(import [empty? count list? list first second third rest cons conj
         reverse reduce vec last
         map filter take concat] "./sequence")
(import [odd? dictionary? dictionary merge keys vals contains-vector?
         map-dictionary string? number? vector? boolean? subs re-find
         true? false? nil? re-pattern? inc dec str char int = ==] "./runtime")
(import [split join upper-case replace] "./string")

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

(def **macros** {})

(defn execute-macro
  "Applies macro registered with given `name` to a given `form`"
  [name form]
  (apply (get **macros** name)
         (vec form)))

(defn install-macro
  "Registers given `macro` with a given `name`"
  [name macro-fn]
  (set! (get **macros** name) macro-fn))

(defn macro?
  "Returns true if macro with a given name is registered"
  [name]
  (and (symbol? name)
       (get **macros** name)
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

(def **specials** {})

(defn install-special
  "Installs special function"
  [name f validator]
  (set! (get **specials** name)
        (fn [form]
          (if validator (validator form))
          (f (with-meta (rest form) (meta form))))))

(defn special?
  "Returns true if special form"
  [name]
  (and (symbol? name)
       (get **specials** name)
       true))

(defn execute-special
  "Expands special form"
  [name form]
  ((get **specials** name) form))


(defn opt [argument fallback]
  (if (or (nil? argument) (empty? argument)) fallback (first argument)))

(defn apply-form
  "Take a form that has a list of children and make a form that
  applies the children to the function `fn-name`"
  [fn-name form quoted?]
  (cons fn-name
        (if quoted?
            (map (fn [e] (list 'quote e)) form) form)
            form))

(defn apply-unquoted-form
  "Same as apply-form, but respect unquoting"
  [fn-name form]
  (cons fn-name ;; ast.prepend ???
        (map
          (fn [e]
              (if (unquote? e)
                  (second e)
                  (if (and (list? e)
                           (keyword? (first e)))
                      (list 'syntax-quote (second e))
                      (list 'syntax-quote e))))
          form)))

(defn split-splices "" [form fn-name]
  (defn make-splice "" [form]
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
  (let [slices (split-splices form fn-name)
        n (count slices)]
    (cond (identical? n 0) (list fn-name)
          (identical? n 1) (first slices)
          :default (apply-form append-name slices))))


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
  (set! id (cond (identical? id  "*") "multiply"
                 (identical? id "/") "divide"
                 (identical? id "+") "sum"
                 (identical? id "-") "subtract"
                 (identical? id "=") "equal?"
                 (identical? id "==") "strict-equal?"
                 (identical? id "<=") "not-greater-than"
                 (identical? id ">=") "not-less-than"
                 (identical? id ">") "greater-than"
                 (identical? id "<") "less-than"
                 :else id))

  ;; **macros** ->  __macros__
  (set! id (join "_" (split id "*")))
  ;; list->vector ->  listToVector
  (set! id (join "-to-" (split id "->")))
  ;; set! ->  set
  (set! id (join (split id "!")))
  (set! id (join "$" (split id "%")))
  ;; foo= -> fooEqual
  ;(set! id (join "-equal-" (split id "="))
  ;; foo+bar -> fooPlusBar
  (set! id (join "-plus-" (split id "+")))
  (set! id (join "-and-" (split id "&")))
  ;; number? -> isNumber
  (set! id (if (identical? (last id) "?")
             (str "is-" (subs id 0 (dec (count id))))
             id))
  ;; create-server -> createServer
  (set! id (reduce
            (fn [result key]
              (str result
                   (if (and (not (empty? result))
                            (not (empty? key)))
                     (str (upper-case (get key 0)) (subs key 1))
                     key)))
            ""
            (split id "-")))
  id)

(defn compile-keyword-reference
  [form]
  (str "\"" (name form) "\""))

(defn compile-syntax-quoted-vector
  [form]
  (let [concat-form (syntax-quote-split 'concat 'vector (apply list form))]
    (compile (if (> (count concat-form) 1)
              (list 'vec concat-form)
              concat-form))))

(defn compile-syntax-quoted
  ""
  [form]
  (cond
   (list? form) (compile (syntax-quote-split 'concat 'list form))
   (vector? form) (compile-syntax-quoted-vector form)
   ; Disable dictionary form as we can't fully support it yet.
   ; (dictionary? form) (compile (syntax-quote-split 'merge 'dictionary form))
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
       (empty? form) (compile-object form true)
       (quote? form) (compile-object (second form) true)
       (syntax-quote? form) (compile-syntax-quoted (second form))
       (special? head) (execute-special head form)
       ;; Compile keyword invoke as a property access.
       (keyword? head) (compile `(get (or ~(second form) 0) ~head))
       :else (do
              (if (not (or (symbol? head) (list? head)))
                (throw (compiler-error
                        form
                        (str "operator is not a procedure: " head)))
              (compile-invoke form)))))))

(defn compile-program
  "compiles all expansions"
  [forms]
  (loop [result []
         expressions forms]
    (if (empty? expressions)
      (join ";\n\n" result)
      (let [expression (first expressions)
            form (macroexpand expression)
            expanded (if (list? form)
                       (with-meta form (conj {:top true}
                                             (meta form)))
                       form)]
        (recur (conj result (compile expanded))
               (rest expressions))))))

(defn macroexpand-1
  "If form represents a macro form, returns its expansion,
  else returns form."
  [form]
  (if (list? form)
    (let [op (first form)
          id (if (symbol? op) (name op))]
      (cond
        (special? op) form
        (macro? op) (execute-macro op (rest form))
        (and (symbol? op)
             (not (identical? id ".")))
          ;; (.substring s 2 5) => (. s substring 2 5)
          (if (identical? (first id) ".")
            (if (< (count form) 2)
              (throw (Error
                "Malformed member expression, expecting (.member target ...)"))
              (cons '.
                    (cons (second form)
                          (cons (symbol (subs id 1))
                                (rest (rest form))))))

            ;; (StringBuilder. "foo") => (new StringBuilder "foo")
            (if (identical? (last id) ".")
              (cons 'new
                    (cons (symbol (subs id 0 (dec (count id))))
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
  (let [indent-pattern #"\n *$"
        line-break-patter (RegExp "\n" "g")
        get-indentation (fn [code] (or (re-find indent-pattern code) "\n"))]
    (loop [code ""
           parts (split (first form) "~{}")
           values (rest form)]
      (if (> (count parts) 1)
        (recur
         (str
          code
          (first parts)
          (replace (str "" (first values))
                    line-break-patter
                    (get-indentation (first parts))))
         (rest parts)
         (rest values))
         (str code (first parts))))))

(defn compile-comment
  [form]
  (compile-template (list "//~{}\n" (first form))))

(defn compile-def
  "Creates and interns or locates a global var with the name of symbol
  and a namespace of the value of the current namespace (*ns*). If init
  is supplied, it is evaluated, and the root binding of the var is set
  to the resulting value. If init is not supplied, the root binding of
  the var is unaffected. def always applies to the root binding, even if
  the var is thread-bound at the point where def is called. def yields
  the var itself (not its value)."
  [form]
  (let [id (first form)
        export? (and (:top (or (meta form) {}))
                     (not (:private (or (meta id) {}))))
        attribute (symbol (namespace id)
                          (str "-" (name id)))]
    (if export?
      (compile-template (list "var ~{};\n~{}"
                               (compile (cons 'set! form))
                               (compile `(set! (. exports ~attribute) ~id))))
      (compile-template (list "var ~{}"
                              (compile (cons 'set! form)))))))

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
                 (= (first else-expression) 'if))
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


;; Function parser / compiler


(defn desugar-fn-name [form]
  (if (or (symbol? (first form))
          (nil? (first form)))
    form
    (cons nil form)))

(defn desugar-fn-doc [form]
  (if (or (string? (second form))
          (nil? (second form)))
    form
    (cons (first form) ;; (name nil ... )
          (cons nil (rest form)))))

(defn desugar-fn-attrs [form]
  (if (or (dictionary? (third form))
          (nil? (third form)))
    form
    (cons (first form) ;; (name nil ... )
          (cons (second form)
                (cons nil (rest (rest form)))))))

(defn compile-desugared-fn
  ;"(fn name? [params* ] exprs*)
  ;Defines a function (fn)"
  [name doc attrs params body]
  (compile-template
    (if (nil? name)
      (list "function(~{}) {\n  ~{}\n}"
            (join ", " (map compile (:names params)))
            (compile-fn-body (map macroexpand body) params))
      (list "function ~{}(~{}) {\n  ~{}\n}"
            (compile name)
            (join ", " (map compile (:names params)))
            (compile-fn-body (map macroexpand body) params)))))

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
  (if (and (dictionary? params) (:rest params))
    (compile-statements
      (cons (list 'def
                  (:rest params)
                  (list
                    'Array.prototype.slice.call
                    'arguments
                    (:arity params)))
      form)
      "return ")

    ;; Optimize functions who's body only contains `let` form to avoid
    ;; function call overhead.
    (if (and (identical? (count form) 1)
             (list? (first form))
             (= (first (first form)) 'do))
      (compile-fn-body (rest (first form)) params)
      (compile-statements form "return "))))

(defn desugar-params
  "Returns map like `{:names ['foo 'bar] :rest 'baz}` if takes non-variadic
  number of params `:rest` is `nil`"
  [params]
  (loop [names []
         params params]
    (cond (empty? params) {:names names :arity (count names) :rest nil}
          (= (first params) '&)
            (cond (= (count params) 1) {:names names
                                        :arity (count names)
                                        :rest nil}
                  (= (count params) 2) {:names names
                                        :arity (count names)
                                        :rest (second params)}
                  :else (throw (TypeError
                                "Unexpected number of parameters after &")))
          :else (recur (conj names (first params)) (rest params)))))

(defn analyze-overloaded-fn
  "Compiles function that has overloads defined"
  [name doc attrs overloads]
  (map (fn [overload]
         (let [params (desugar-params (first overload))]
           {:rest (:rest params)
            :names (:names params)
            :arity (:arity params)
            :body (rest overload)}))
       overloads))

(defn compile-overloaded-fn
  [name doc attrs overloads]
  (let [methods (analyze-overloaded-fn name doc attrs overloads)
        fixed-methods (filter (fn [method] (not (:rest method))) methods)
        variadic (first (filter (fn [method] (:rest method)) methods))
        names (reduce (fn [names params]
                        (if (> (count names) (:arity params))
                              names
                              (:names params)))
                      []
                      methods)]
    (list 'fn name doc attrs names
          (list 'raw*
                (compile-switch
                  'arguments.length
                  (map (fn [method]
                        (cons (:arity method)
                          (list 'raw*
                                (compile-fn-body
                                  (concat
                                    (compile-rebind names (:names method))
                                    (:body method))))))
                        fixed-methods)
                  (if (nil? variadic)
                    '(throw (Error "Invalid arity"))
                    (list 'raw*
                          (compile-fn-body
                            (concat
                              (compile-rebind
                                (cons `(Array.prototype.slice.call
                                        arguments
                                        ~(:arity variadic))
                                      names)
                                (cons (:rest variadic)
                                      (:names variadic)))
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
       (if (= (first names) (first bindings))
         form
         (cons (list 'def (first names) (first bindings)) form))
       (rest bindings)
       (rest names)))))

(defn compile-switch-cases
  [cases]
  (reduce
   (fn [form case-expression]
     (str form
          (compile-template
           (list "case ~{}:\n  ~{}\n"
                 (compile (macroexpand (first case-expression)))
                 (compile (macroexpand (rest case-expression)))))))
   ""
   cases))


(defn compile-switch
  [value cases default-case]
  (compile-template
   (list "switch (~{}) {\n  ~{}\n  default:\n    ~{}\n}"
         (compile (macroexpand value))
         (compile-switch-cases cases)
         (compile (macroexpand default-case)))))

(defn compile-fn
  "(fn name? [params* ] exprs*)

  Defines a function (fn)"
  [form]
  (let [signature (desugar-fn-attrs (desugar-fn-doc (desugar-fn-name form)))
        name (first signature)
        doc (second signature)
        attrs (third signature)]
    (if (vector? (third (rest signature)))
      (compile-desugared-fn name doc attrs
                            (desugar-params (third (rest signature)))
                            (rest (rest (rest (rest signature)))))
      (compile
        (compile-overloaded-fn name doc attrs (rest (rest (rest signature))))))))

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
    (join ", " (vec (map compile (map  macroexpand form))))))

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
    (if (identical? (count bindings) 0)
      (reverse defs)
      (recur
        (cons
          (list 'def                ; '(def (get bindings 0) (get bindings 1))
                (get bindings 0)    ; binding name
                (get bindings 1))   ; binding value
           defs)
        (rest (rest bindings))))))

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
        (if (= (first (first exprs)) 'catch)
          (recur try-exprs
                 (rest (first exprs))
                 finally-exprs
                 (rest exprs))
          (if (= (first (first exprs)) 'finally)
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
            (compile (macroexpand (symbol (subs (name (second form)) 1))))))
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
  (let [target (macroexpand (first form))
        attribute (macroexpand (second form))
        template (if (list? target) "(~{})[~{}]" "~{}[~{}]")]
    (compile-template
     (list template (compile target) (compile attribute)))))

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
  (let [bindings (loop [names []
                        values []
                        tokens (first form)]
                  (if (empty? tokens)
                    {:names names :values values}
                    (recur (conj names (first tokens))
                           (conj values (second tokens))
                           (rest (rest tokens)))))
        names (:names bindings)
        values (:values bindings)
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
  (map (fn [form]
         (if (list? form)
           (if (= (first form) 'recur)
             (list 'raw*
                   (compile-group
                    (concat
                      (rebind-bindings names (rest form))
                      (list 'loop))
                    true))
             (expand-recur names form))
           form))
        body))

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
(install-special 'comment compile-comment)


(defn compile-keyword [form] (str "\"" "\uA789" (name form) "\""))
(defn compile-symbol [form]
  (compile (list 'symbol (namespace form) (name form))))
(defn compile-nil [form] "void(0)")
(defn compile-number [form] form)
(defn compile-boolean [form] (if (true? form) "true" "false"))
(defn compile-string
  [form]
  (set! form (replace form (RegExp "\\\\" "g") "\\\\"))
  (set! form (replace form (RegExp "\n" "g") "\\n"))
  (set! form (replace form (RegExp "\r" "g") "\\r"))
  (set! form (replace form (RegExp "\t" "g") "\\t"))
  (set! form (replace form (RegExp "\"" "g") "\\\""))
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
    (if (empty? form)
      fallback
      (reduce
        (fn [left right]
          (compile-template
            (list "~{} ~{} ~{}"
                  left
                  (name operator)
                  right)))
        (map (fn [operand]
              (compile-template
                (list (if (list? operand) "(~{})" "~{}")
                  (compile (macroexpand operand)))))
             form))))
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

(install-operator 'not= '!=)
(install-operator '== '===)
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
 'str
 (fn str
   "str inlining and optimization via macros"
   [& forms]
   `(+ "" ~@forms)))

(install-macro
  'let
  (fn let-macro
    "Evaluates the exprs in a lexical context in which the symbols in
    the binding-forms are bound to their respective init-exprs or parts
    therein."
    {:added "1.0" :special-form true :forms '[(let [bindings*] exprs*)]}
    [bindings & body]
    ;; TODO: Implement destructure for bindings:
    ;; https://github.com/clojure/clojure/blob/master/src/clj/clojure/core.clj#L3937
    ;; Consider making let a macro:
    ;; https://github.com/clojure/clojure/blob/master/src/clj/clojure/core.clj#L3999
    (cons 'do
      (concat (define-bindings bindings) body))))

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
 'defn-
 (fn defn
   "Same as (def name (fn [params* ] exprs*)) or
   (def name (fn ([params* ] exprs*)+)) with any doc-string or attrs added
   to the var metadata"
   {:added "1.0" :special-form true }
   [name & body]
   `(defn ~(with-meta name (conj {:private true} (meta name))) ~@body)))

(install-macro
 'assert
 (fn assert
   "Evaluates expr and throws an exception if it does not evaluate to
   logical true."
   {:added "1.0"}
   [x message]
   (let [title (or message "")
         assertion (pr-str x)
         uri (:uri x)
         form (if (list? x) (second x) x)]
     `(do
        (if (and (not (identical? (typeof **verbose**) "undefined"))
                 **verbose**)
          (.log console "Assert:" ~assertion))
        (if (not ~x)
          (throw (Error. (str "Assert failed: "
                              ~title
                              "\n\nAssertion:\n\n"
                              ~assertion
                              "\n\nActual:\n\n"
                              ~form
                              "\n--------------\n")
                         ~uri)))))))

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

(export
  self-evaluating?
  compile
  compile-program
  macroexpand
  macroexpand-1)
