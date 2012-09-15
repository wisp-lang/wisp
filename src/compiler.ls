(import (meta with-meta symbol? symbol keyword? keyword
         unquote? unquote unquote-splicing? unquote-splicing
         quote? quote syntax-quote? syntax-quote name deref set) "./ast"
(import (empty? count list? list first second third rest cons reverse) "./list")
(import (odd? dictionary merge gensym) "./runtime")


(comment
  (test
   ("gensym"
    (assert (symbol? (gensym))
            "gensym generates symbol")
    (assert (.substr (name (gensym)) 0 3) "G__"
            "global symbols are prefixed with 'G__'")
    (assert (not (identical? (name (gensym)) (name (gensym))))
            "gensym generates unique symbol each time")
    (assert (.substr (name (gensym "foo")) 0 3) "foo"
            "if prefix is given symbol is prefixed with it")
    (assert (not (identical? (name (gensym "p")) (name (gensym "p"))))
            "gensym generates unique symbol even if prefixed"))))


(defn ^boolean self-evaluating?
  "Returns true if form is self evaluating"
  [form]
  (or (number? form)
      (string? form)
      (boolean? form)
      (nil? form)
      (keyword? form)))

(comment
  (test
   ("self evaluating forms"
    (assert (self-evaluating? 1) "number is self evaluating")
    (assert (self-evaluating? "string") "string is self evaluating")
    (assert (self-evaluating? true) "true is boolean => self evaluating")
    (assert self-evaluating? false) "false is boolean => self evaluating")
    (assert (self-evaluating?) "no args is nil => self evaluating")
    (assert (self-evaluating? nil) "nil is self evaluating")
    (assert (self-evaluating? :keyword) "keyword is self evaluating")
    (assert (self-evaluating? ()) "list is not self evaluating")
    (assert (self-evaluating? self-evaluating?) "fn is not self evaluating")
    (assert (self-evaluating? (symbol "symbol")) "symbol is not self evaluating")))

(defn ^boolean list?
  "Returns true if list"
  [value]
  (.prototype-of? List.prototype value))

(comment
  (test
   ("list?"
    (assert (list? ()) "() is list")
    (assert (not (list? 2)) "2 is not list")
    (assert (not (list? {})) "{} is not list")
    (assert (not (list? [])) "[] is not list"))))

(defn ^boolean dictionary?
  "Returns true if dictionary"
  [form]
  (and (object? form)
       ;; Inherits right form Object.prototype
       (object? (.get-prototype-of Object form))
       (nil? (.get-prototype-of Object (.get-prototype-of Object form)))))

(comment
  (test
   ("dictionary?"
    (assert (not (dictionary? 2)) "2 is not dictionary")
    (assert (not (dictionary? [])) "[] is not dictionary")
    (assert (not (dictionary? ())) "() is not dictionary")
    (assert (dictionary? {}) "{} is dictionary"))))

(defn ^boolean vector?
  "Returns true if vector"
  [form]
  (array? form))

(comment
  (test
   ("vector?"
    (assert (not (dictionary? 2)) "2 is not vector")
    (assert (not (dictionary? [])) "{} is not vector")
    (assert (not (dictionary? ())) "() is not vector")
    (assert (vector? []) "[] is vector"))))

(defn ^boolean quote?
  "Returns true if it's quote form: 'foo '(foo)"
  [form]
  (and (list? form) (identical? (first form) quote)))

(comment
  (test
   ("quote?"
    (assert (quote? '()) "'() is quoted list")
    (assert (not (quote? `())) "'() is not quoted list")
    (assert (not (quote? ())) "'() is quoted list")
    (assert (quote? 'foo) "'foo is quoted symbol")
    (assert (not (quote? foo)) "foo symbol is not quoted"))))

(defn ^boolean syntax-quote?
  "Returns true if it's syntax quote form: `foo `(foo)"
  [form]
  (and (list? form) (identical? (first form) syntax-quote)))

(comment
  (test
   ("syntax-quote?"
    (assert (syntax-quote? `()) "`() is syntax quoted list")
    (assert (not (syntax-quote? '())) "'() is not syntax quoted list")
    (assert (not (syntax-quote? ())) "() is not syntax quoted list")
    (assert (syntax-quote? `foo) "`foo is syntax quoted symbol")
    (assert (not (syntax-quote? 'foo)) "'foo symbol is not syntax quoted")
    (assert (not (syntax-quote? foo)) "foo symbol is not syntax quoted"))))

(defn atom?
 "Returns true if the form passed is of atomic type"
 [form]
 (or
  (number? form)
  (string? form)
  (boolean? form)
  (nil? form)
  (keyword? form)
  (symbol? form)
  (and (list? form)
       (empty? form))))


;; Macros

(defn map-dictionary
  "Maps dictionary values by applying `f` to each one"
  [source f]
  (dictionary
    (reduce (.keys Object source)
            (fn [target key]
                (set! (get target key) (f (get source key))))
            {})))

(defn map-list
  "Maps list by applying `f` to each item"
  [source f]
  (if (empty? source) source
      (cons (f (first source))
            (map-list (rest source) f))))

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
            (map form (fn [e] (list quote e))) form)
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
    (vector? form) (compile (apply-form (symbol "vector") form))
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

(install-special "fn"
  (fn [form]
    (compile (list (symbol "::compile")
              "function(~{}) {\n  ~{}\n}\n"
              (.join (first form) ", ")
              (compile (list "::compile:statements" (rest form)))))))

(install-special (symbol "def")
  (fn [form]
    (compile (list
      (symbol "::compile") "var ~{} = ~{}"
        (first form)
        (compile (second form))))))


(install-special (symbol "::compile")
  (fn [form]
   (loop [code ""
          parts (.split (first form) "~{}")
          values (rest form)]
     (if (> (.-length parts) 1)
      (recur
        (.concat code (get parts 0) (first values))
        (.slice parts 1)
        (rest values))
      (.concat code (get parts 0))))))


(install-special (symbol "::compile:invoke")
  (fn [form]
    (compile
      ;; TODO: Get rid of assumption that list serializes to `(...)`
      (list (symbol "::compile") "(~{})(~{})"
            (first form)
            (compile (list (symbol "::compile:group") (second form)))))))

(defn list-to-vector [source]
  (loop [vector (Array)
         list source]
    (if (empty? list)
      vector
      (recur
        (.concat vector (first list))
        (rest list)))))

(install-special (symbol "::compile:statements")
  (fn [form]
    (.join (list-to-vector
            (map-list (first form) compile))
            ";\n")))

(install-special (symbol "::compile:group")
  (fn [form]
    (.join (list-to-vector
            (map-list (first form) compile))
            ", ")))



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
