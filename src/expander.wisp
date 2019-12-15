(ns wisp.expander
  "wisp syntax and macro expander module"
  (:require [wisp.ast :refer [meta with-meta symbol? keyword? keyword
                              quote? symbol namespace name gensym
                              unquote? unquote-splicing?]]
            [wisp.sequence :refer [list? list conj partition seq repeatedly
                                   empty? map mapv vec set every? concat
                                   first second third rest last mapcat nth
                                   butlast interleave cons count take dissoc
                                   some assoc reduce filter seq? zipmap
                                   lazy-seq range reverse dorun map-indexed]]
            [wisp.runtime :refer [nil? dictionary? vector? keys get
                                  vals string? number? boolean?
                                  date? re-pattern? even? = max
                                  inc dec dictionary merge subs]]
            [wisp.string :refer [split join capitalize]]))


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


(defn dot-syntax?
  [op]
  (and (symbol? op) (identical? \. (name op))))

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

(defn dot-syntax
  "Example:
  '(. object -field) => '(aget object 'field)
  '(. string substring 2 5) => '((aget string 'substring) 2 5)"
  [op target field & params]
  (if-not (symbol? field)
    (throw (Error "Malformed . form")))
  (let [*field (name field)]
    (apply (if (identical? \- (first *field)) field-syntax method-syntax)
           (symbol (str \. *field)) target params)))

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
  ([keyword target]
    `(get ~target ~keyword))
  ([keyword target default*]
    `(get ~target ~keyword ~default*)))

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
          ;; '(. object method foo bar) => '((aget object method) foo bar)
          (dot-syntax? op) (desugar dot-syntax form)
          ;; '(.-field object) => '(aget object 'field)
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
  ((unquote-splicing a)) -> (a)
  (a) -> ([(quote b)])
  ((unquote a) b (unquote-splicing a)) -> ([a] [(quote b)] c)"
  [forms]
  (map (fn [form]
         (cond (unquote? form) [(second form)]
               (unquote-splicing? form) (unquote-splicing-expand (second form))
               :else [(syntax-quote-expand form)]))
       forms))
(install-macro! :syntax-quote syntax-quote-expand)

;; TODO: New reader translates not= correctly
;; but for the time being use not-equal name
(defn expand-not-equal
  [& body]
  `(not (= ~@body)))
(install-macro! :not= expand-not-equal)

(defn expand-if-not
  "Complements the `if` exclusive conditional branch."
  [condition truthy alternative]
  `(if (not ~condition) ~truthy ~alternative))
(install-macro! :if-not expand-if-not)

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
    (map #(if (list? %) % `(~%))
         (rest operations))))
(install-macro! :-> expand-thread-first)

(defn expand-thread-last
  "Thread last macro"
  [& operations]
  (reduce
    (fn [form operation] (concat operation [form]))
    (first operations)
    (map #(if (list? %) % `(~%))
         (rest operations))))
(install-macro! :->> expand-thread-last)

(defn expand-dots
  "form => fieldName-symbol or (instanceMethodName-symbol args*)
  Expands into a member access (.) of the first member on the first
  argument, followed by the next member on the result, etc. For
  instance:
  (.. document -body (get-attribute :class))
  expands to:
  (. (. document -body) get-attribute :class)
  but is easier to write, read, and understand."
  [x & forms]
  `(-> ~x ~@(map #(if (list? %) (cons '. %) (list '. %))
                 forms)))
(install-macro! :.. expand-dots)


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


(defn expand-lazy-seq
  "Takes a body of expressions that returns an ISeq or nil, and yields
  a Seqable object that will invoke the body only the first time seq
  is called, and will cache the result and return it on all subsequent
  seq calls. See also - realized?

  Depends on lazy-seq"
  {:added "1.0"}
  [& body]
  `(.call lazy-seq nil false (fn [] ~@body)))
(install-macro :lazy-seq expand-lazy-seq)


(defn expand-when
  "Evaluates test. If logical true, evaluates body in an implicit do."
  [test & body]
  `(if ~test (do ~@body)))
(install-macro :when expand-when)

(defn expand-when-not
  "Evaluates test. If logical false, evaluates body in an implicit do."
  [test & body]
  `(when (not ~test) ~@body))
(install-macro :when-not expand-when-not)


(defn expand-if-let
  "bindings => binding-form test
  body => [then else]
  If test is true, evaluates then with binding-form bound to the value of
  test, if not, yields else."
  [bindings then else*]
  (let [name (first bindings), test (second bindings), sym (gensym (if (symbol? name) name))]
    `(let [~sym ~test]
       (if ~sym (let [~name ~sym] ~then) ~else*))))
(install-macro :if-let expand-if-let)

(defn expand-when-let
  "bindings => binding-form test
  When test is true, evaluates body with binding-form bound to the value of test."
  [bindings & body]
  `(if-let ~bindings (do ~@body)))
(install-macro :when-let expand-when-let)


(defn expand-while
  "Repeatedly executes body while test expression is true. Presumes
  some side-effect will cause test to become false/nil. Returns nil"
  [test & body]
  `(loop []
     (when ~test ~@body (recur))))
(install-macro :while expand-while)


(defn expand-doto
  "Evaluates x then calls all of the methods and functions with the
  value of x supplied at the front of the given arguments.  The forms
  are evaluated in order.  Returns x.
  (doto (Map.) (.set :a 1) (.set :b 2))"
  [x & forms]
  (let [sym (gensym :doto-binding)]
    `(let [~sym ~x]
       ~@(map #(concat [(first %) sym] (rest %)) forms)
       ~sym)))
(install-macro :doto expand-doto)

(defn expand-dotimes
  "bindings => name n
  Repeatedly executes body (presumably for side-effects) with name
  bound to integers from 0 through n-1."
  [bindings & body]
  (let [name (first bindings),  n (second bindings),  sym (gensym :dotimes-binding)]
    `(let [~sym ~n]
       (loop [~name 0]
         (when (< ~name ~sym)
           ~@body
           (recur (inc ~name)))))))
(install-macro :dotimes expand-dotimes)


(defn- for-step [context loop & modifiers]
  (let [iter  (:iter context),  coll (:coll context),  body (:body context),  subseq (:subseq context)
        body* (if-not subseq body `(let [~subseq ~body]
                                     (if (empty? ~subseq)
                                       (recur (rest ~coll))
                                       (lazy-concat ~subseq (~iter (rest ~coll))))))
        next  (loop [mods (reverse modifiers), body body*]
                (if (empty? mods)
                  body
                  (let [m (first mods),  item (first m),  arg (second m)]
                    (recur (rest mods)
                           (cond (= item ':let)   `(let ~arg ~body)
                                 (= item ':while) `(if ~arg ~body)
                                 (= item ':when)  `(if ~arg ~body (recur (rest ~coll))))))))]
    (merge context
           {:subseq (gensym :for-subseq)
            :body   `((fn ~iter [~coll]
                        (lazy-seq (loop [~coll ~coll]
                                    (if-not (empty? ~coll)
                                      (let [~(first loop) (first ~coll)] ~next)))))
                      ~(second loop))})))

(def ^:private for-modifiers #{':let ':while ':when})

(defn- for-parts [seq-expr-pairs]
  (let [n        (count seq-expr-pairs)
        indices  (filter #(-> (aget seq-expr-pairs %) first for-modifiers not)
                         (range n))
        segments (partition 2 1 (conj indices n))]
    (map #(.slice seq-expr-pairs (first %) (second %))
         segments)))

(defn expand-for
  "List comprehension. Takes a vector of one or more
   binding-form/collection-expr pairs, each followed by zero or more
   modifiers, and yields a lazy sequence of evaluations of expr.
   Collections are iterated in a nested fashion, rightmost fastest,
   and nested coll-exprs can refer to bindings created in prior
   binding-forms.  Supported modifiers are: :let [binding-form expr ...],
   :while test, :when test.
  (take 100 (for [x (infinite-range), y (infinite-range), :while (< y x)]  [x y]))

  Depends on lazy-seq, lazy-concat, empty?, first, rest, cons"
  [seq-exprs body-expr]
  (let [iter (gensym :for-iter), coll (gensym :for-coll), parts (for-parts (partition 2 seq-exprs))]
    (:body (reduce #(apply for-step %1 %2)
                   {:iter iter, :coll coll, :body `(cons ~body-expr (~iter (rest ~coll)))}
                   (reverse parts)))))
(install-macro :for expand-for)

(defn expand-doseq
  "Repeatedly executes body (presumably for side-effects) with
  bindings and filtering as provided by 'for'. Does not retain
  the head of the sequence. Returns nil.

  Depends on lazy-seq, lazy-concat, empty?, first, rest, cons, dorun"
  [seq-exprs & body]
  `(dorun (for ~seq-exprs (do ~@body nil))))
(install-macro :doseq expand-doseq)


(defn- sym* [string]
  (let [words (split (name string) #"-")]
    (join (cons (first words) (map capitalize (rest words))))))
(defn- bind-sym* [s b]
  (assert (symbol? s) "Expected a symbol here!")
  [s b])
(defn- conj-syms* [get* result k v f quote]
  (let [k-ns (namespace k), g #(f k-ns (name %))]
    (vec (concat result (mapcat #(bind-sym* % (get* % (g %) quote))
                                v)))))
(defn- dict-get* [dict-name defaults]
  (fn [binding key quote]
    (let [s (name key)
          k (keyword (namespace key) (if (symbol? key) (sym* s) s))]
      `(get ~dict-name ~(if-not quote k `'~k) ~(and binding (aget defaults binding))))))

(defn destructure-dict [binding from]
  (let [dict-name  (or (aget binding ':as) (gensym :destructure-bind))
        dict-bind  `(if (dictionary? ~dict-name) ~dict-name (apply dictionary (vec ~dict-name)))
        get*       (dict-get* dict-name (get binding ':or {}))]
    (loop [ks (keys (dissoc binding ':as ':or)), result [dict-name from, dict-name dict-bind]]
      (if (empty? ks)
        result
        (let [k (first ks), v (get binding k), k* (and (keyword? k) (name k))]
          (assert (or (symbol? k) (and k* (#{:keys :strs :syms} k*)))
                  (str "Invalid destructure key " k))
          (recur (rest ks) (cond (= k* :strs) (conj-syms* get* result k v keyword)
                                 (= k* :syms) (conj-syms* get* result k v #(symbol %1 (sym* %2)))
                                 (= k* :keys) (conj-syms* get* result k v keyword :quote)
                                 (number? v)  (conj result k (get* k (symbol (str v))))
                                 :else        (conj result k (get* k v)))))))))

(defn destructure-seq [binding from]
  (let [as       (.find-index binding #(= % ':as))
        seq-name (if (< as 0) (gensym :destructure-bind) (nth binding (inc as)))
        binding1 (if (< as 0) binding (take as binding))
        more     (.find-index binding1 #(= % '&))
        tail     (if (>= more 0) (nth binding1 (inc more)))
        binding2 (if (< more 0) binding1 (take more binding))]
    (assert (or (< as 0) (= as (- (count binding) 2)))
            "invalid :as in seq-destructuring")
    (assert (or (< more 0) (= more (- (count binding1) 2)))
            "invalid & in seq-destructuring")
    (loop [xs binding2, i 0, result [seq-name from]]
      (let [x (first xs)]
        (cond (empty? xs) (if-not tail result (conj result tail `(drop ~more ~seq-name)))
              (= x '_)    (recur (rest xs) (inc i) result)
              :else       (recur (rest xs) (inc i) (conj result x `(nth ~seq-name ~i))))))))

(defn destructure [bindings]
  (let [pairs (partition 2 bindings)]
    (if (every? #(symbol? (first %)) pairs)
      bindings
      (destructure (vec (mapcat #(cond (vector?     (first %)) (apply destructure-seq %)
                                       (dictionary? (first %)) (apply destructure-dict %)
                                       (symbol?     (first %)) %
                                       :else                   (throw "Invalid binding"))
                                pairs))))))

(defn- bind-names* [keys]
  (zipmap keys (repeatedly (count keys) #(gensym :destructure-bind))))
(defn- bind-indices* [names]
  (filter #(not (symbol? (nth names %))) (range (count names))))

(defn expand-let
  "binding => binding-form init-expr

  Evaluates the exprs in a lexical context in which the symbols in
  the binding-forms are bound to their respective init-exprs or parts
  therein.

  Depends on dictionary?, dictionary, vec, get"
  [bindings & body]
  `(let* ~(destructure bindings) ~@body))
(install-macro :let expand-let)

(defn expand-fn
  "(fn name? [params*] exprs*)
   (fn name? ([params*] exprs*) +)

  params => positional-params* , or positional-params* & next-param
  positional-param => binding-form
  next-param => binding-form
  name => symbol

  Defines a function

  Depends on dictionary?, dictionary, vec, get"
  [& args]
  (let [name (if (symbol? (first args)) (first args))
        defs (if name (rest args) args)
        mkfn #(if name `(fn* ~name ~@%) `(fn* ~@%))
        def* (fn [args & body]
               (let [indices (bind-indices* args), names (bind-names* indices)]
                 (if (empty? names)
                   (cons args body)
                   `(~(vec (map-indexed #(get names %1 %2) args))
                      (let ~(vec (mapcat (fn [i] [(aget args i) (aget names i)])
                                         indices))
                        ~@body)))))]
    (if (vector? (first defs))
      (mkfn (apply def* defs))
      (mkfn (map #(apply def* (vec %)) defs)))))
(install-macro :fn expand-fn)

(defn expand-loop
  "Evaluates the exprs in a lexical context in which the symbols in
  the binding-forms are bound to their respective init-exprs or parts
  therein. Acts as a recur target.

  Depends on dictionary?, dictionary, vec, get"
  [bindings & body]
  (let [pairs   (partition 2 bindings)
        indices (bind-indices* (mapv first pairs))
        names   (bind-names* indices)
        get*    #(if-let [x (aget names %1)]
                   [x (second %2) (first %2) x]
                   %2)]
    (if (empty? names)
      `(loop* ~bindings ~@body)
      `(let ~(vec (apply concat (map-indexed get* pairs)))
         (loop* ~(vec (apply concat (map-indexed #(let [x (get names %1 (first %2))] [x x])
                                                 pairs)))
           (let ~(vec (mapcat (fn [i] [(first (aget pairs i)) (aget names i)])
                              indices))
             ~@body))))))
(install-macro :loop expand-loop)
