(ns wisp.compiler
  "wisp language compiler"
  (:require [wisp.reader :refer [read-from-string]]
            [wisp.ast :refer [meta with-meta symbol? symbol keyword? keyword
                              namespace unquote? unquote-splicing? quote?
                              syntax-quote? name gensym pr-str]]
            [wisp.sequence :refer [empty? count list? list first second third
                                   rest cons conj reverse reduce vec last
                                   repeat map filter take concat seq seq?]]
            [wisp.runtime :refer [odd? dictionary? dictionary merge keys vals
                                  contains-vector? map-dictionary string?
                                  number? vector? boolean? subs re-find true?
                                  false? nil? re-pattern? inc dec str char
                                  int = ==]]
            [wisp.string :refer [split join upper-case replace]]
            [wisp.backend.javascript.writer :refer [write-reference
                                                    write-re-pattern
                                                    write-if
                                                    write-keyword-reference
                                                    write-keyword write-symbol
                                                    write-instance?
                                                    write-nil write-comment
                                                    write-number write-string
                                                    write-number write-boolean]]))

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

(defn compile-special
  "Expands special form"
  [form]
  (let [write (get **specials** (first form))
        metadata (meta form)
        expansion (map (fn [form] form) form)]
    (write (with-meta form metadata))))



(defn opt [argument fallback]
  (if (or (nil? argument) (empty? argument)) fallback (first argument)))

(defn apply-form
  "Take a forms and produce a form that is application of
  quoted forms over `operator`.

  concat -> (a b c) -> (concat (quote a) (quote b) (quote c))"
  [operation forms]
  (cons operation (map (fn [form] (list 'quote form)) forms)))

(defn apply-unquoted-form
  "Same as apply-form, but respects unquoting
  concat -> (a (unquote b)) -> (concat (syntax-quote a) b)"
  [fn-name form]
  (cons fn-name ;; ast.prepend ???
        (map (fn [e]
               (if (unquote? e)
                 (second e)
                 (if (and (list? e)
                          (keyword? (first e)))
                   (list 'syntax-quote (second e))
                   (list 'syntax-quote e))))
             form)))

(defn make-splice
  [operator form]
  (if (or (self-evaluating? form)
          (symbol? form))
    (apply-unquoted-form operator (list form))
    (apply-unquoted-form operator form)))

(defn split-splices
  [operator form]
  (loop [nodes form
         slices '()
         acc '()]
    (if (empty? nodes)
      (reverse
       (if (empty? acc)
         slices
         (cons (make-splice operator (reverse acc)) slices)))
      (let [node (first nodes)]
        (if (unquote-splicing? node)
          (recur (rest nodes)
                 (cons (second node)
                       (if (empty? acc)
                         slices
                         (cons (make-splice operator (reverse acc)) slices)))
                 '())
          (recur (rest nodes)
                 slices
                 (cons node acc)))))))


(defn syntax-quote-split
  [concat-name operator form]
  (let [slices (split-splices operator form)
        n (count slices)]
    (cond (identical? n 0) (list operator)
          (identical? n 1) (first slices)
          :else (cons concat-name slices))))


;; compiler


(defn compile-syntax-quoted-vector
  [form]
  (let [concat-form (syntax-quote-split 'concat 'vector form)]
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
   :else (compile-quoted form)))

(defn compile
  "compiles given form"
  [form]
  (cond
   (symbol? form) (write-reference form)
   (keyword? form) (write-keyword-reference form)

   (number? form) (write-number form)
   (string? form) (write-string form)
   (boolean? form) (write-boolean form)
   (nil? form) (write-nil form)
   (re-pattern? form) (write-re-pattern form)

   (vector? form) (compile-vector form)
   (dictionary? form) (compile-dictionary form)
   (list? form) (compile-list form)))

(defn compile-quoted
  [form]
  ;; If collection (list, vector, dictionary) is quoted it
  ;; compiles to collection with it's items quoted. Compile
  ;; primitive types compile to themsef. Note that symbol
  ;; typicyally compiles to reference, and keyword to string
  ;; but if they're quoted they actually do compile to symbol
  ;; type and keyword type.
  (cond (vector? form) (compile (apply-form 'vector form))
        (list? form) (compile (apply-form 'list form))
        (dictionary? form) (compile-dictionary
                            (map-dictionary form (fn [x] (list 'quote x))))
        (keyword? form) (write-keyword form)
        (symbol? form) (write-symbol form)
        (number? form) (write-number form)
        (string? form) (write-string form)
        (boolean? form) (write-boolean form)
        (nil? form) (write-nil form)
        (re-pattern? form) (write-re-pattern form)
        :else (compiler-error form "form not supported")))

(defn compile-list
  [form]
  (let [operator (first form)]
    (cond
     ;; Empty list compiles to list construction:
     ;; () -> (list)
     (empty? form) (compile-invoke '(list))
     (quote? form) (compile-quoted (second form))
     ;(syntax-quote? form) (compile-syntax-quoted (second form))
     (special? operator) (compile-special form)
     ;; Calling a keyword compiles to getting value from given
     ;; object associted with that key:
     ;; (:foo bar) -> (get bar :foo)
     (keyword? operator) (compile (macroexpand `(get ~(second form)
                                                     ~operator)))
     (or (symbol? operator)
         (list? operator)) (compile-invoke form)
     :else (compiler-error form
                           (str "operator is not a procedure: " head)))))


(defn compile*
  "compiles all forms"
  [forms]
  (reduce (fn [result form]
            (str result
                 (if (empty? result) "" ";\n\n")
                 (compile (if (list? form)
                            (with-meta (macroexpand form)
                              (conj {:top true} (meta form)))
                            form))))
          ""
          forms))

(def compile-program compile*)

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
       ;;  (keyword? op) (list 'get (second form) op)
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

(def *line-break-pattern* #"(?m)\n(?=[^\n])")
(defn indent
  [code indentation]
  (join indentation (split code *line-break-pattern*)))

(defn compile-template
  "Compiles given template"
  [form]
  (let [indent-pattern #"\n *$"

        get-indentation (fn [code] (or (re-find indent-pattern code) "\n"))]
    (loop [code ""
           parts (split (first form) "~{}")
           values (rest form)]
      (if (> (count parts) 1)
        (recur
         (str
          code
          (first parts)
          (indent (str (first values))
                  (get-indentation (first parts))))
         (rest parts)
         (rest values))
        (str code (first parts))))))

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
  (let [test (macroexpand (first form))
        consequent (macroexpand (second form))
        alternate (macroexpand (third form))

        test-template (if (special-expression? test)
                        "(~{})"
                        "~{}")
        consequent-template (if (special-expression? consequent)
                              "(~{})"
                              "~{}")
        alternate-template (if (special-expression? alternate)
                             "(~{})"
                             "~{}")

        nested-condition? (and (list? alternate)
                               (= 'if (first alternate)))]
    (compile-template
      (list
       (str test-template " ?\n  "
            consequent-template " :\n"
            (if nested-condition? "" "  ")
            alternate-template)
        (compile test)
        (compile consequent)
        (compile alternate)))))

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
  (let [callee (macroexpand (first form))
        template (if (special-expression? callee)
                   "(~{})(~{})"
                   "~{}(~{})")]
    (compile-template
     (list template
           (compile callee)
           (compile-group (rest form))))))

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


(defn compile-apply
  [form]
  (compile
   (macroexpand
    (list '.
          (first form)
          'apply
          (first form)
          (second form)))))

(defn compile-new
  "(new Classname args*)
  Compiles new special form. The args, if any, are evaluated
  from left to right, and passed to the constructor of the
  class named by Classname. The constructed object is returned."
  ; {:added "1.0", :special-form true, :forms '[(new Classname args*)]}
  [form]
  (compile-template (list "new ~{}" (compile form))))

(defn compile-aget
  "Compiles compound property accessor"
  [form]
  (let [target (macroexpand (first form))
        attribute (macroexpand (second form))
        field? (and (quote? attribute)
                    (symbol? (second attribute)))

        not-found (third form)
        member (if field?
                 (second attribute)
                 attribute)

        target-template (if (special-expression? target)
                          "(~{})"
                          "~{}")
        attribute-template (if field?
                             ".~{}"
                             "[~{}]")
        template (str target-template attribute-template)]
    (if not-found
      (compile (list 'or
                     (list 'get (first form) (second form))
                     (macroexpand not-found)))
      (compile-template
       (list template
             (compile target)
             (compile member))))))


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
(install-special 'aget compile-aget)
(install-special 'def compile-def)
(install-special 'if compile-if-else)
(install-special 'do compile-do)
(install-special 'do* compile-statements)
(install-special 'fn compile-fn)
(install-special 'throw compile-throw)
(install-special 'vector compile-vector)
(install-special 'try compile-try)
(install-special 'apply compile-apply)
(install-special 'new compile-new)
(install-special 'instance? write-instance?)
(install-special 'not compile-not)
(install-special 'loop compile-loop)
(install-special 'raw* compile-raw)
(install-special 'comment write-comment)


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
    (compiler-error
     form
     (str (first form) " form requires at least two operands"))))

(defn special-expression?
  [form]
  (and (list? form)
       (get **operators** (first form))))

(def **operators**
  {:and :logical-expression
   :or :logical-expression
   :not :logical-expression
   ;; Arithmetic
   :+ :arithmetic-expression
   :- :arithmetic-expression
   :* :arithmetic-expression
   "/" :arithmetic-expression
   :mod :arithmetic-expression
   :not= :comparison-expression
   :== :comparison-expression
   :=== :comparison-expression
   :identical? :comparison-expression
   :> :comparison-expression
   :>= :comparison-expression
   :> :comparison-expression
   :<= :comparison-expression

   ;; Binary operators
   :bit-not :binary-expression
   :bit-or :binary-expression
   :bit-xor :binary-expression
   :bit-not :binary-expression
   :bit-shift-left :binary-expression
   :bit-shift-right :binary-expression
   :bit-shift-right-zero-fil :binary-expression

   :if :conditional-expression
   :set :assignment-expression

   :fn :function-expression
   :try :try-expression})

(def **statements**
  {:try :try-expression
   :aget :member-expression})


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




;; NS


(defn parse-references
  "Takes part of namespace difinition and creates hash
  of reference forms"
  [forms]
  (reduce (fn [references form]
            ;; If not a vector than it's not a reference
            ;; form that wisp understands so just skip it.
            (if (seq? form)
              (set! (get references (name (first form)))
                    (vec (rest form))))
            references)
          {}
          forms))

(defn parse-require
  [form]
  (let [;; require form may be either vector with id in the
        ;; head or just an id symbol. normalizing to a vector
        requirement (if (symbol? form) [form] (vec form))
        id (first requirement)
        ;; bunch of directives may follow require form but they
        ;; all come in pairs. wisp supports following pairs:
        ;; :as foo
        ;; :refer [foo bar]
        ;; :rename {foo bar}
        ;; join these pairs in a hash for key based access.
        params (apply dictionary (rest requirement))

        imports (reduce (fn [imports name]
                          (set! (get imports name)
                                (or (get imports name) name))
                          imports)
                        (conj {} (get params ':rename))
                        (get params ':refer))]
    ;; results of analyzes are stored as metadata on a given
    ;; form
    (conj {:id id :imports imports} params)))

(defn analyze-ns
  [form]
  (let [id (first form)
        params (rest form)
        ;; Optional docstring that follows name symbol
        doc (if (string? (first params)) (first params))
        ;; If second form is not a string than treat it
        ;; as regular reference form
        references (parse-references (if doc (rest params) params))]
    (with-meta form {:id id
                     :doc doc
                     :require (if (:require references)
                                (map parse-require (:require references)))})))

(defn id->ns
  "Takes namespace identifier symbol and translates to new
  simbol without . special characters
  wisp.core -> wisp*core"
  [id]
  (symbol nil (join \* (split (str id) \.))))

(defn name->field
  "Takes a requirement name symbol and returns field
  symbol.
  foo -> -foo"
  [name]
  (symbol nil (str \- name)))

(defn compile-import
  [module]
  (fn [form]
    `(def ~(second form) (. ~module ~(name->field (first form))))))

(defn compile-require
  [requirer]
  (fn [form]
    (let [id (:id form)
          requirement (id->ns (or (get form ':as) id))
          path (resolve requirer id)
          imports (:imports form)]
      (concat ['do* `(def ~requirement (require ~path))]
              (if imports (map (compile-import requirement) imports))))))

(defn resolve
  [from to]
  (let [requirer (split (str from) \.)
        requirement (split (str to) \.)
        relative? (and (not (identical? (str from)
                                        (str to)))
                       (identical? (first requirer)
                                   (first requirement)))]
    (if relative?
      (loop [from requirer
             to requirement]
        (if (identical? (first from)
                        (first to))
          (recur (rest from) (rest to))
          (join \/
                (concat [\.]
                        (repeat (dec (count from)) "..")
                        to))))
      (join \/ requirement))))


(defn compile-ns
  "Sets *ns* to the namespace named by name. Unlike clojure ns
  wisp ns is a lot more minimalistic and supports only on way
  of importing modules:

   (ns interactivate.core.main
    \"interactive code editing\"
    (:require [interactivate.host :refer [start-host!]]
              [fs]
              [wisp.backend.javascript.writer :as writer]
              [wisp.sequence
               :refer [first rest]
               :rename {first car rest cadr}]))

  First parameter `interactivate.core.main` is a name of the
  namespace, in this case it'll represent module `./core/main`
  from package `interactivate`, while this is not enforced in
  any way it's recomended to replecate filesystem path.

  Second string parameter is just a description of the module
  and is completely optional.

  Next (:require ...) form defines dependencies that will be
  imported at runtime. Given example imports multiple modules:

  1. First import will import `start-host!` function from the
     `interactivate.host` module. Which will be loaded from the
     `../host` location. That's because modules path is resolved
     relative to a name, but only if they share same root.
  2. Second form imports `fs` module and make it available under
     the same name. Note that in this case it could have being
     written without wrapping it into brackets.
  3. Third form imports `wisp.backend.javascript.writer` module
     from `wisp/backend/javascript/writer` and makes it available
     via `writer` name.
  4. Last and most advanced form imports `first` and `rest`
     functions from the `wisp.sequence` module, although it also
     renames them and there for makes available under different
     `car` and `cdr` names.

  While clojure has many other kind of reference forms they are
  not recognized by wisp and there for will be ignored."
  [& form]
  (let [metadata (meta (analyze-ns form))
        id (str (:id metadata))
        doc (:doc metadata)
        requirements (:require metadata)
        ns (if doc {:id id :doc doc} {:id id})]
    (concat
     ['do* `(def *ns* ~ns)]
     (if requirements (map (compile-require id) requirements)))))

(install-macro 'ns compile-ns)

(install-macro
 'print
 (fn [& more]
   "Prints the object(s) to the output for human consumption."
   `(.log console ~@more)))

(install-macro
 'debugger!
 (fn [] 'debugger))

(install-macro
 '.
 (fn [object field & args]
   (let [error-field (if (not (symbol? field))
                       (str "Member expression `" field "` must be a symbol"))
         field-name (str field)
         accessor? (identical? \- (first field-name))

         error-accessor (if (and accessor?
                                 (not (empty? args)))
                          "Accessor form must conatin only two members")
         member (if accessor?
                  (symbol nil (rest field-name))
                  field)

         target `(aget ~object (quote ~member))
         error (or error-field error-accessor)]
     (cond error (throw (TypeError (str "Unsupported . form: `"
                                        `(~object ~field ~@args)
                                        "`\n" error)))
           accessor? target
           :else `(~target ~@args)))))

(install-macro
 'get
 (fn
   ([object field]
    `(aget (or ~object 0) ~field))
   ([object field fallback]
    `(or (aget (or ~object 0) ~field ~fallback)))))

(install-macro
 'def
 (fn [id value]
   (let [metadata (meta id)
         export? (not (:private metadata))]
     (if export?
       `(do* (def* ~id ~value)
             (set! (aget exports (quote ~id))
                   ~value))
       `(def* ~id ~value)))))

(defn syntax-quote- [form]
  (cond ;(specila? form) (list 'quote form)
        (symbol? form) (list 'quote form)
        (keyword? form) (list 'quote form)
        (or (number? form)
            (string? form)
            (boolean? form)
            (nil? form)
            (re-pattern? form)) form

        (unquote? form) (second form)
        (unquote-splicing? form) (reader-error "Illegal use of `~@` expression, can only be present in a list")

        (empty? form) form
        (dictionary? form) (list 'apply
                                 'dictionary
                                 (cons '.concat
                                       (sequence-expand (apply concat (seq form)))))
                                 ;(list 'seq (cons 'concat
                                 ;                  (sequence-expand (apply concat
                                 ;                                          (seq form))))))
        ;; If a vctor form expand all sub-forms:
        ;; [(unquote a) b (unquote-splicing c)] -> [(a) (syntax-quote b) c]
        ;; and concatinate them
        ;; togather: [~a b ~@c] -> (concat a `b c)
        (vector? form) (cons '.concat (sequence-expand form))
                       ;(list 'vec (cons 'concat (sequence-expand form)))
                       ;(list 'apply
                       ;      'vector
                       ;      (list 'seq (cons 'concat
                       ;                        (sequence-expand form))))

        (list? form) (if (empty? form)
                       (cons 'list nil)
                       (list 'apply
                             'list
                             (cons '.concat (sequence-expand form))))
                       ;(list 'seq
                       ;      (cons 'concat (sequence-expand form)))
        :else (reader-error "Unknown Collection type")))

(defn unquote-splicing-expand
  [form]
  (if (vector? form)
    form
    (list 'vec form)))

(defn sequence-expand
  "Takes sequence of forms and expands them:

  ((unquote a)) -> ([a])
  ((unquote-splicing a) -> (a)
  (a) -> ([(quote b)])
  ((unquote a) b (unquote-splicing a)) -> ([a] [(quote b)] c)"
  [forms]
  (map (fn [form]
         (cond (unquote? form) [(second form)]
               (unquote-splicing? form) (unquote-splicing-expand (second form))
               :else [(syntax-quote- form)])) forms))


(install-macro 'syntax-quote syntax-quote-)