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
                                  inc dec dictionary subs]]
            [wisp.string :refer [split]]))


(def **macros** {})

(defn- expand
  "Applies macro registered with given `name` to a given `form`"
  [expander form env]
  (let [metadata (or (meta form) {})
        parmas (rest form)
        implicit (map #(cond (= :&form %) form
                             (= :&env %) env
                             :else %)
                      (or (:implicit (meta expander)) []))
        params (vec (concat implicit (vec (rest form))))

        expansion (apply expander params)]
    (if expansion
      (with-meta expansion (conj metadata (meta expansion)))
      expansion)))

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
  (let [op-meta (meta op)
        form-start (:start op-meta)
        target-meta (meta target)
        member (with-meta (symbol (subs (name op) 1))
                 ;; Include metadat from the original symbol just
                 (conj op-meta
                       {:start {:line (:line form-start)
                                :column (inc (:column form-start))}}))
        ;; Add metadata to aget symbol that will map to the first `.`
        ;; character of the method name.
        aget (with-meta 'aget
               (conj op-meta
                     {:end {:line (:line form-start)
                            :column (inc (:column form-start))}}))

        ;; First two forms (.substring string ...) expand to
        ;; ((aget string 'substring) ...) there for expansion gets
        ;; position metadata from start of the first `.substring` form
        ;; to the end of the `string` form.
        method (with-meta `(~aget ~target (quote ~member))
                 (conj op-meta
                       {:end (:end (meta target))}))]
    (if (nil? target)
      (throw (Error "Malformed method expression, expecting (.method object ...)"))
      `(~method ~@params))))

(defn field-syntax
  "Example:
  '(.-field object) => '(aget object 'field)"
  [field target & more]
  (let [metadata (meta field)
        start (:start metadata)
        end (:end metadata)
        member (with-meta (symbol (subs (name field) 2))
                 (conj metadata
                       {:start {:line (:line start)
                                :column (+ (:column start) 2)}}))]
    (if (or (nil? target)
            (count more))
      (throw (Error "Malformed member expression, expecting (.-member target)"))
      `(aget ~target (quote ~member)))))

(defn new-syntax
  "Example:
  '(Point. x y) => '(new Point x y)"
  [op & params]
  (let [id (name op)
        id-meta (:meta id)
        rename (subs id 0 (dec (count id)))
        ;; constructur symbol inherits metada from the first `op` form
        ;; it's just it's end column info is updated to reflect subtraction
        ;; of `.` character.
        constructor (with-meta (symbol rename)
                      (conj id-meta
                            {:end {:line (:line (:end id-meta))
                                   :column (dec (:column (:end id-meta)))}}))
        operator (with-meta 'new
                   (conj id-meta
                         {:start {:line (:line (:end id-meta))
                                  :column (dec (:column (:end id-meta)))}}))]
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
  [form env]
  (let [op (and (list? form)
                (first form))
        expander (macro op)]
    (cond expander (expand expander form env)
          ;; Calling a keyword compiles to getting value from given
          ;; object associated with that key:
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
  [form env]
  (loop [original form
         expanded (macroexpand-1 form env)]
    (if (identical? original expanded)
      original
      (recur expanded (macroexpand-1 expanded env)))))


;; Define core macros


;; TODO make this language independent

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
        ;; If a vector form expand all sub-forms and concatenate
        ;; them together:
        ;;
        ;; [~a b ~@c] -> (.concat [a] [(quote b)] c)
        (vector? form) (cons '.concat (sequence-expand form))

        ;; If a list form expand all the sub-forms and apply
        ;; concatenation to a list constructor:
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

;; TODO: New reader translates not= correctly
;; but for the time being use not-equal name
(defn not-equal
  [& body]
  `(not (= ~@body)))
(install-macro! :not= not-equal)

(defn if-not [condition truthy alternative]
  "Complements the `if` exclusive conditional branch."
  (if (not condition) truthy, alternative))
(install-macro! :if-not if-not)

(defn expand-comment
  "Ignores body, yields nil"
  [& body])
(install-macro! :comment expand-comment)

(defn expand-thread-first
  "Thread first macro"
  [& operations]
  (reduce
   (fn [form operation]
     (cons (first operation)
           (cons form (rest operation))))
   (first operations)
   (rest operations)))
(install-macro! :-> expand-thread-first)

(defn expand-cond
  "Takes a set of test/expr pairs. It evaluates each test one at a
  time.  If a test returns logical true, cond evaluates and returns
  the value of the corresponding expr and doesn't evaluate any of the
  other tests or exprs. (cond) returns nil."
  [& clauses]
  (if (not (empty? clauses))
    (list 'if (first clauses)
          (if (empty? (rest clauses))
            (throw (Error "cond requires an even number of forms"))
            (second clauses))
          (cons 'cond (rest (rest clauses))))))
(install-macro! :cond expand-cond)

(defn expand-defn
  "Same as (def name (fn [params* ] exprs*)) or
  (def name (fn ([params* ] exprs*)+)) with any doc-string or attrs added
  to the var metadata"
  [&form name & doc+meta+body]
  (let [doc (if (string? (first doc+meta+body))
              (first doc+meta+body))

        ;; If docstring is found it's not part of body.
        meta+body (if doc (rest doc+meta+body) doc+meta+body)

        ;; defn may contain attribute list after
        ;; docstring or a name, in which case it's
        ;; merged into name metadata.
        metadata (if (dictionary? (first meta+body))
                   (conj {:doc doc} (first meta+body)))

        ;; If metadata map is found it's not part of body.
        body (if metadata (rest meta+body) meta+body)

        ;; Combine all the metadata and add to a name.
        id (with-meta name (conj (or (meta name) {}) metadata))

        fn (with-meta `(fn ~id ~@body) (meta &form))]
    `(def ~id ~fn)))
(install-macro! :defn (with-meta expand-defn {:implicit [:&form]}))


(defn expand-private-defn
  "Same as (def name (fn [params* ] exprs*)) or
  (def name (fn ([params* ] exprs*)+)) with any doc-string or attrs added
  to the var metadata"
  [name & body]
  (let [metadata (conj (or (meta name) {})
                       {:private true})
        id (with-meta name metadata)]
    `(defn ~id ~@body)))
(install-macro :defn- expand-private-defn)
