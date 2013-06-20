(ns wisp.expander
  "wisp syntax and macro expander module"
  (:require [wisp.ast :refer [meta with-meta symbol? keyword?
                              quote? symbol namespace name
                              unquote? unquote-splicing?]]
            [wisp.sequence :refer [list? list conj partition seq
                                   empty? map vec every? concat
                                   first second third rest last
                                   butlast interleave cons count
                                   some assoc reduce filter seq?]]
            [wisp.runtime :refer [nil? dictionary? vector? keys
                                  vals string? number? boolean?
                                  date? re-pattern? even? = max
                                  dec dictionary subs]]
            [wisp.string :refer [split]]))


(def **macros** {})

(defn- expand
  "Applies macro registered with given `name` to a given `form`"
  [expander form]
  (let [expansion (apply expander (vec (rest form)))
        metadata (conj {} (meta form) (meta expansion))]
    (with-meta expansion metadata)))


(defn install-macro!
  "Registers given `macro` with a given `name`"
  [op expander]
  (set! (get **macros** (name op)) expander))

(defn- macro
  "Returns true if macro with a given name is registered"
  [op]
  (and (symbol? op)
       (get **macros** (name op))))


(defn method-syntax?
  [op]
  (let [id (and (symbol? op) (name op))]
    (and id
         (identical? \. (first id))
         (not (identical? \- (second id)))
         (not (identical? \. id)))))

(defn field-syntax?
  [op]
  (let [id (and (symbol? op) (name op))]
    (and id
         (identical? \. (first id))
         (identical? \- (second id)))))

(defn new-syntax?
  [op]
  (let [id (and (symbol? op) (name op))]
    (and id
         (identical? \. (last id))
         (not (identical? \. id)))))

(defn method-syntax
  "Example:
  '(.substring string 2 5) => '((aget string 'substring) 2 5)"
  [op target & params]
  (let [member (symbol (subs (name op) 1))]
    (if (nil? target)
      (throw (Error "Malformed method expression, expecting (.method object ...)"))
      `((aget ~target (quote ~member)) ~@params))))

(defn field-syntax
  "Example:
  '(.-field object) => '(aget object 'field)"
  [op target & more]
  (let [member (symbol (subs (name op) 2))]
    (if (or (nil? target)
            (count more))
      (throw (Error "Malformed member expression, expecting (.-member target)"))
      `(aget ~target (quote ~member)))))

(defn new-syntax
  "Example:
  '(Point. x y) => '(new Point x y)"
  [op & params]
  (let [id (name op)
        constructor (symbol (subs id 0 (dec (count id))))]
    `(new ~constructor ~@params)))

(defn keyword-invoke
  "Calling a keyword desugars to property access with that
  keyword name on the given argument:
  '(:foo bar) => '(get bar :foo)"
  [keyword target]
  `(get ~target ~keyword))

(defn- desugar
  [expander form]
  (let [desugared (apply expander (vec form))
        metadata (conj {} (meta form) (meta desugared))]
    (with-meta desugared metadata)))

(defn macroexpand-1
  "If form represents a macro form, returns its expansion,
  else returns form."
  [form]
  (let [op (and (list? form)
                (first form))
        expander (macro op)]
    (cond expander (expand expander form)
          ;; Calling a keyword compiles to getting value from given
          ;; object associted with that key:
          ;; '(:foo bar) => '(get bar :foo)
          (keyword? op) (desugar keyword-invoke form)
          ;; '(.-field object) => (aget object 'field)
          (field-syntax? op) (desugar field-syntax form)
          ;; '(.substring string 2 5) => '((aget string 'substring) 2 5)
          (method-syntax? op) (desugar method-syntax form)
          ;; '(Point. x y) => '(new Point x y)
          (new-syntax? op) (desugar new-syntax form)
          :else form)))

(defn macroexpand
  "Repeatedly calls macroexpand-1 on form until it no longer
  represents a macro form, then returns it."
  [form]
  (loop [original form
         expanded (macroexpand-1 form)]
    (if (identical? original expanded)
      original
      (recur expanded (macroexpand-1 expanded)))))


;; Define core macros

(install-macro!
 :print
 (fn [& more]
   "Prints the object(s) to the output for human consumption."
   `(.log console ~@more)))

(defn syntax-quote [form]
  (cond (symbol? form) (list 'quote form)
        (keyword? form) (list 'quote form)
        (or (number? form)
            (string? form)
            (boolean? form)
            (nil? form)
            (re-pattern? form)) form

        (unquote? form) (second form)
        (unquote-splicing? form) (reader-error "Illegal use of `~@` expression, can only be present in a list")

        (empty? form) form

        ;;
        (dictionary? form) (list 'apply
                                 'dictionary
                                 (cons '.concat
                                       (sequence-expand (apply concat
                                                               (seq form)))))
        ;; If a vector form expand all sub-forms and concatinate
        ;; them togather:
        ;;
        ;; [~a b ~@c] -> (.concat [a] [(quote b)] c)
        (vector? form) (cons '.concat (sequence-expand form))

        ;; If a list form expand all the sub-forms and apply
        ;; concationation to a list constructor:
        ;;
        ;; (~a b ~@c) -> (apply list (.concat [a] [(quote b)] c))
        (list? form) (if (empty? form)
                       (cons 'list nil)
                       (list 'apply
                             'list
                             (cons '.concat (sequence-expand form))))

        :else (reader-error "Unknown Collection type")))
(def syntax-quote-expand syntax-quote)

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
               :else [(syntax-quote-expand form)]))
       forms))
(install-macro! :syntax-quote syntax-quote)

(defn apply
  [f & params]
  (let [prefix (vec (butlast params))]
    (if (empty? prefix)
      `(.apply ~f nil ~@params)
      `(.apply ~f nil (.concat ~prefix ~(last params))))))
(install-macro! :apply apply)