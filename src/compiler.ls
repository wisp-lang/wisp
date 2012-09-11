(defn gensym
  "Returns a new symbol with a unique name. If a prefix string is
  supplied, the name is prefix# where # is some unique number. If
  prefix is not supplied, the prefix is 'G__'."
  [prefix]
  (symbol (str (if (nil? prefix) "G__" prefix)
               (set! gensym.base (+ gensym.base 1)))))
(set! gensym.base 0)

(defn symbol-identical?
  ;; We can not use `identical?` or `=` since in JS we can not
  ;; make `==` or `===` on object which we use to implement symbols.
  "Returns true if symbol is identical"
  [actual expected]
  (and
    (symbol? actual)
    (symbol? expected)
    (identical? (name actual) (name expected))))

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

(defn expand
  "Expands given form"
  [form]
  (cond
   (atom? form) form
   ;; If vector expand it's elements
   (vector? form) (map form expand)
   ;; If dictionary expand it's values
   (dictionary? form) (map-dictionary form expand)
   (or (quote? form)
       (syntax-quote? form)) form
   ;; If function form expand it's body.
   (symbol-identical? (first form) (symbol "fn"))
    (cons (first form)
          (cons (second form)
                (map-list (rest (rest form)) expand)))
   ;; If first item in the form is registered macro
   ;; execute macro and sourcify form back.
   (macro? (first form))
    (expand (execute-macro (first form) form))
   ;; Otherwise it's a list form and we expand each item in it.
   :else (map-list form expand)))


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

(def macro-generator false)

(defn make-macro
  "Makes macro"
  [pattern body]
  (let [x (gensym)]
    ;; compile the macro into native code and use the host's native
    ;; eval to eval it into a function.
    (let [macro `(fn [~x] (apply (fn ~pattern ~@body) (rest ~x)))]
      (eval (compile-program macro (macro-generator.make-fresh))))))


;; system macros
(install-macro
 (symbol "define-macro")
 (fn [form]
   (let [signature (second form)]
     (let [name (first signature)
           pattern (rest signature)
           body (rest (rest form))]

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
        (fn [form generator expr? compile_]
          (validator form)
          ((get generator f) (rest form) expr? compile_))))

(defn special?
  "Returns true if special form"
  [name]
  (and (symbol? name)
       (get __specials__ name)
       true))

(defn execute-special
  "Expands special form"
  [name form generator expr? compile_]
  ((get __specials__ name) form generator expr? compile_))




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
  [form generator quoted? expr?]
  ;; TODO: Add regexp to the list.
  (cond
    (keyword? form) (generator.write-keyword form expr?)
    (symbol? form) (generator.write-symbol form expr?)
    (number? form) (generator.write-number form expr?)
    (string? form) (generator.write-string form expr?)
    (boolean? form) (generator.write-boolean form expr?)
    (nil? form) (generator.write-nil form expr?)
    (vector? form) (compile (apply-form (symbol "vector") form quoted?)
                            generator expr?)
    (list? form) (compile (apply-form (symbol "list") form quoted?)
                          generator expr?)
    (dictionary? (compile (apply-form (symbol "dictionary") form quoted?)
                            generator expr?))))

(defn compile-syntax-quoted
  ""
  [form generator expr?]
  (cond
   (list? form)
    (compile
      (syntax-quote-split (symbol "list-append") (symbol "list") form)
      generator
      expr?)
   (vector? form)
    (compile
      (syntax-quote-split (symbol "vector-concat") (symbol "vector") form)
      generator
      expr?)
   (dictionary? form)
    (compile
      (syntax-quote-split (symbol "dictionary-merge") (symbol "dictionary") form)
      generator
      expr?)
   :else
    (compile-object form generator true expr?)))

(defn compile-reference
  ""
  [form generator expr?]
  (generator.write-term form (opt expr? false)))

(defn compile-if
  ""
  [form generator expr? compile_]
  (generator.write-if
    (first form)
    (second form)
    (if (nil? (third form)) false (third form))
    expr?
    compile_))

(defn compile-fn
  ""
  [form generator expr? compile_]
  (generator.write-fn form expr? compile_))

(defn compile-set
  ""
  [form generator compile_]
  (generator.write-set
    (second form)
    (compile_ (third form))
    compile_))

(defn compile-define
  ""
  [form generator compile_]
  (generator.write-define
    (second form)
    (compile_ (third form))
    compile_))


(defn compile
  "compiles given form"
  [form generator expr?]

  (defn compile_ [form expr?]
    (compile form generator (opt expr? false)))

  (let [expr? (opt expr? false)]
    (cond
     (self-evaluating? form)
      (compile-object form generator false expr?)
     (symbol? form)
      (compile-reference form generator expr?)
     (vector? form)
      (compile-object form generator false expr?)
     (dictionary? form)
      (compile-object form generator false expr?)
     (list? form)
      (let [head (first form)]
        (cond
         (quote? form)
          (compile-object (second form) generator true expr?)
         (syntax-quote? form)
          (compile-syntax-quoted (second form) generator expr?)
         (symbol-identical? head (symbol "if"))
          (compile-if form generator expr? compile_)
         (symbol-identical? head (symbol "fn"))
          (compile-fn form generator expr? compile_)
         (symbol-identical? head (symbol "set!"))
          (compile-set form generator compile_)
         (symbol-identical? head (symbol "def"))
          (compile-define form generator compile_)
         (symbol-identical? head (symbol "%raw"))
          (generator.write-raw-code (second form))
         (special? head)
          (execute-native head form generator expr? compile_)
         :else
          (do
            (if (not (or (symbol? (first form))
                         (list? (first form))))
              (throw (str "operator is not a procedure: " (first form))))
            (generator.write-func-call (first form)
                                       (rest form)
                                       expr?
                                       compile_)))))))

