(import [meta with-meta symbol? symbol keyword? keyword
         unquote? unquote unquote-splicing? unquote-splicing
         quote? quote syntax-quote? syntax-quote
         name gensym deref set atom? symbol-identical?] "./ast")
(import [empty? count list? list first second third
         rest cons reverse map-list list-concat list-to-vector] "./list")
(import [odd? dictionary? dictionary merge
         map-dictionary] "./runtime")


(defn ^boolean self-evaluating?
  "Returns true if form is self evaluating"
  [form]
  (or (number? form)
      (string? form)
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
  (let [x (gensym)]
    ;; compile the macro into native code and use the host's native
    ;; eval to eval it into a function.
    (eval (compile
            (macroexpand
              ; `(fn [~x] (apply (fn ~pattern ~@body) (rest ~x)))
              (read-from-string
                "`(fn [~x] (apply (fn ~pattern ~@body) (rest ~x)))"))
            ))))


;; system macros
(install-macro
 (symbol "define-macro")
 (fn [form]
   (let [signature (rest form)]
     (let [name (first signature)
           pattern (second signature)
           body (rest (rest signature))]

       ;; install it during expand-time
       (install-macro name (make-macro pattern body))
       false))))


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
                  (rest (rest e))
                  (if (and (list? e)
                           (keyword? (first e)))
                      (list syntax-quote (rest (rest e)))
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
      (apply-node append-name slices))))


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
    (dictionary? (compile (apply-form (symbol "dictionary") form)))))

(defn compile-reference
  ""
  [form]
  (compile (list (symbol "::compile:reference") form)))

(defn compile-syntax-quoted
  ""
  [form]
  (cond
   (list? form)
    (compile
      (syntax-quote-split (symbol "list-append") (symbol "list") form))
   (vector? form)
    (compile
      (syntax-quote-split (symbol "vector-concat") (symbol "vector") form)
      generator
      expr?)
   (dictionary? form)
    (compile
      (syntax-quote-split (symbol "dictionary-merge") (symbol "dictionary") form))
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
       ;(symbol-identical? head (symbol "if")) (compile-if form)
       ;(symbol-identical? head (symbol "fn")) (compile-fn form)
       ;(symbol-identical? head (symbol "set!")) (compile-set form)
       ;(symbol-identical? head (symbol "def")) (compile-define form)
       ;(symbol-identical? head (symbol "%raw")) (second form)
       (special? head) (execute-special head form)
       :else (do
              (if (not (or (symbol? head) (list? head)))
                (throw (str "operator is not a procedure: " head))
              (compile (list (symbol "::compile:invoke") head (rest form)))))))))

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
          (compile (first form))    ; condition
          (compile (second form))   ; then
          (compile (third form))))) ; else or nil

(defn compile-fn
  "(fn name? [params* ] exprs*)

  Defines a function (fn)"
  [form]
  (compile-template
    (if (symbol? (first form))
      (list "function ~{}(~{}) {\n  ~{}\n}"
            (name (first form))
            (.join (second form) ", ")
            (compile-fn-body (rest (rest form))))
      (list "function(~{}) {\n  ~{}\n}"
            (.join (first form) ", ")
            (compile-fn-body (rest form))))))

(defn compile-fn-body
  [form]
  (loop [result ""
         expression (first form)
         expressions (rest form)]
    (if (empty? expressions)
      (str result "return " (compile expression) ";")
      (recur
        (str result (compile expression) ";" "\n")
        (first expressions)
        (rest expressions)))))


(defn compile-fn-invoke
  [form]
  (compile-template
   (list "(~{})(~{})"
         (compile (first form))
         (compile-group (second form)))))

(defn compile-group
  [form]
  (.join (list-to-vector (map-list form compile)) ", "))

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
      (compile (first form))
      (compile (second form)))))

(defn compile-vector
  "Creates a new vector containing the args"
  [form]
  (compile-template (list "[~{}]" (compile-group form))))

(install-special (symbol "set!") compile-set)
(install-special (symbol "def") compile-def)
(install-special (symbol "if") compile-if-else)
(install-special (symbol "do") compile-do)
(install-special (symbol "fn") compile-fn)
(install-special (symbol "let") compile-let)
(install-special (symbol "throw") compile-throw)
(install-special (symbol "vector") compile-vector)
(install-special (symbol "::compile:invoke") compile-fn-invoke)







(install-special (symbol "::compile:keyword")
  ;; Note: Intentionally do not prefix keywords (unlike clojurescript)
  ;; so that they can be used with regular JS code:
  ;; (.add-event-listener window :load handler)
  (fn [form] (str "\"" (name (first form)) "\"")))

(install-special (symbol "::compile:reference")
  (fn [form] (name (first form))))

(install-special (symbol "::compile:symbol")
  (fn [form] (str "\"" "\uFEFF" (name (first form)) "\"")))

(install-special (symbol "::compile:nil")
  (fn [form] "void 0"))

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

(export
  self-evaluating?
  compile
  macroexpand
  macroexpand-1)
