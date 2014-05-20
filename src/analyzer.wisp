(ns wisp.analyzer
  (:require [wisp.ast :refer [meta with-meta symbol? keyword?
                              quote? symbol namespace name pr-str
                              unquote? unquote-splicing?]]
            [wisp.sequence :refer [list? list conj partition seq
                                   empty? map vec every? concat
                                   first second third rest last
                                   butlast interleave cons count
                                   some assoc reduce filter seq?]]
            [wisp.runtime :refer [nil? dictionary? vector? keys
                                  vals string? number? boolean?
                                  date? re-pattern? even? = max
                                  dec dictionary subs inc dec]]
            [wisp.expander :refer [macroexpand]]
            [wisp.string :refer [split join]]))

(defn syntax-error
  [message form]
  (let [metadata (meta form)
        line (:line (:start metadata))
        uri (:uri metadata)
        column (:column (:start metadata))
        error (SyntaxError (str message "\n"
                                "Form: " (pr-str form) "\n"
                                "URI: " uri "\n"
                                "Line: " line "\n"
                                "Column: " column))]
    (set! error.lineNumber line)
    (set! error.line line)
    (set! error.columnNumber column)
    (set! error.column column)
    (set! error.fileName uri)
    (set! error.uri uri)
    (throw error)))


(defn analyze-keyword
  "Example:
  (analyze-keyword {} :foo) => {:op :constant
                                :form ':foo
                                :env {}}"
  [env form]
  {:op :constant
   :form form})

(def **specials** {})

(defn install-special!
  [op analyzer]
  (set! (get **specials** (name op)) analyzer))

(defn analyze-special
  [analyzer env form]
  (let [metadata (meta form)
        ast (analyzer env form)]
    (conj {:start (:start metadata)
           :end (:end metadata)}
          ast)))

(defn analyze-if
  "Example:
  (analyze-if {} '(if monday? :yep :nope)) => {:op :if
                                               :form '(if monday? :yep :nope)
                                               :env {}
                                               :test {:op :var
                                                      :form 'monday?
                                                      :info nil
                                                      :env {}}
                                               :consequent {:op :constant
                                                            :form ':yep
                                                            :type :keyword
                                                            :env {}}
                                               :alternate {:op :constant
                                                           :form ':nope
                                                           :type :keyword
                                                           :env {}}}"
  [env form]
  (let [forms (rest form)
        test (analyze env (first forms))
        consequent (analyze env (second forms))
        alternate (analyze env (third forms))]
    (if (< (count forms) 2)
      (syntax-error "Malformed if expression, too few operands" form))
    {:op :if
     :form form
     :test test
     :consequent consequent
     :alternate alternate}))

(install-special! :if analyze-if)

(defn analyze-throw
  "Example:
  (analyze-throw {} '(throw (Error :boom))) => {:op :throw
                                                :form '(throw (Error :boom))
                                                :throw {:op :invoke
                                                        :callee {:op :var
                                                                 :form 'Error
                                                                 :info nil
                                                                 :env {}}
                                                        :params [{:op :constant
                                                                  :type :keyword
                                                                  :form ':boom
                                                                  :env {}}]}}"
  [env form]
  (let [expression (analyze env (second form))]
    {:op :throw
     :form form
     :throw expression}))

(install-special! :throw analyze-throw)

(defn analyze-try
  [env form]
  (let [forms (vec (rest form))

        ;; Finally
        tail (last forms)
        finalizer-form (if (and (list? tail)
                                (= 'finally (first tail)))
                         (rest tail))
        finalizer (if finalizer-form
                    (analyze-block env finalizer-form))

        ;; catch
        body-form (if finalizer
                    (butlast forms)
                    forms)

        tail (last body-form)
        handler-form (if (and (list? tail)
                              (= 'catch (first tail)))
                       (rest tail))
        handler (if handler-form
                  (conj {:name (analyze env (first handler-form))}
                        (analyze-block env (rest handler-form))))

        ;; Try
        body (if handler-form
               (analyze-block (sub-env env) (butlast body-form))
               (analyze-block (sub-env env) body-form))]
    {:op :try
     :form form
     :body body
     :handler handler
     :finalizer finalizer}))

(install-special! :try analyze-try)

(defn analyze-set!
  [env form]
  (let [body (rest form)
        left (first body)
        right (second body)
        target (cond (symbol? left) (analyze-symbol env left)
                     (list? left) (analyze-list env left)
                     :else left)
        value (analyze env right)]
    {:op :set!
     :target target
     :value value
     :form form}))
(install-special! :set! analyze-set!)

(defn analyze-new
  [env form]
  (let [body (rest form)
        constructor (analyze env (first body))
        params (vec (map #(analyze env %) (rest body)))]
    {:op :new
     :constructor constructor
     :form form
     :params params}))
(install-special! :new analyze-new)

(defn analyze-aget
  [env form]
  (let [body (rest form)
        target (analyze env (first body))
        attribute (second body)
        field (and (quote? attribute)
                   (symbol? (second attribute))
                   (second attribute))]
    (if (nil? attribute)
      (syntax-error "Malformed aget expression expected (aget object member)"
                    form)
      {:op :member-expression
       :computed (not field)
       :form form
       :target target
       ;; If field is a quoted symbol there's no need to resolve
       ;; it for info
       :property (if field
                   (conj (analyze-special analyze-identifier env field)
                         {:binding nil})
                   (analyze env attribute))})))
(install-special! :aget analyze-aget)

(defn parse-def
  ([id] {:id id})
  ([id init] {:id id :init init})
  ([id doc init] {:id id :doc doc :init init}))

(defn analyze-def
  [env form]
  (let [params (apply parse-def (vec (rest form)))
        id (:id params)
        metadata (meta id)

        binding (analyze-special analyze-declaration env id)

        init (analyze env (:init params))

        doc (or (:doc params)
                (:doc metadata))]
    {:op :def
     :doc doc
     :id binding
     :init init
     :export (and (:top env)
                  (not (:private metadata)))
     :form form}))
(install-special! :def analyze-def)

(defn analyze-do
  [env form]
  (let [expressions (rest form)
        body (analyze-block env expressions)]
    (conj body {:op :do
                :form form})))
(install-special! :do analyze-do)

(defn analyze-symbol
  "Symbol analyzer also does syntax desugaring for the symbols
  like foo.bar.baz producing (aget foo 'bar.baz) form. This enables
  renaming of shadowed symbols."
  [env form]
  (let [forms (split (name form) \.)
        metadata (meta form)
        start (:start metadata)
        end (:end metadata)
        expansion (if (> (count forms) 1)
                   (list 'aget
                         (with-meta (symbol (first forms))
                           (conj metadata
                                 {:start start
                                  :end {:line (:line end)
                                        :column (+ 1 (:column start) (count (first forms)))}}))
                         (list 'quote
                               (with-meta (symbol (join \. (rest forms)))
                                 (conj metadata
                                       {:end end
                                        :start {:line (:line start)
                                                :column (+ 1 (:column start) (count (first forms)))}})))))]
    (if expansion
      (analyze env (with-meta expansion (meta form)))
      (analyze-special analyze-identifier env form))))

(defn analyze-identifier
  [env form]
  {:op :var
   :type :identifier
   :form form
   :start (:start (meta form))
   :end (:end (meta form))
   :binding (resolve-binding env form)})

(defn unresolved-binding
  [env form]
  {:op :unresolved-binding
   :type :unresolved-binding
   :identifier {:type :identifier
                :form (symbol (namespace form)
                              (name form))}
   :start (:start (meta form))
   :end (:end (meta form))})

(defn resolve-binding
  [env form]
  (or (get (:locals env) (name form))
      (get (:enclosed env) (name form))
      (unresolved-binding env form)))

(defn analyze-shadow
  [env id]
  (let [binding (resolve-binding env id)]
    {:depth (inc (or (:depth binding) 0))
     :shadow binding}))

(defn analyze-binding
  [env form]
  (let [id (first form)
        body (second form)]
    (conj (analyze-shadow env id)
          {:op :binding
           :type :binding
           :id id
           :init (analyze env body)
           :form form})))

(defn analyze-declaration
  [env form]
  (assert (not (or (namespace form)
                   (< 1 (count (split \. (str form)))))))
  (conj (analyze-shadow env form)
        {:op :var
         :type :identifier
         :depth 0
         :id form
         :form form}))

(defn analyze-param
  [env form]
  (conj (analyze-shadow env form)
        {:op :param
         :type :parameter
         :id form
         :form form
         :start (:start (meta form))
         :end (:end (meta form))}))

(defn with-binding
  "Returns enhanced environment with additional binding added
  to the :bindings and :scope"
  [env form]
  (conj env {:locals (assoc (:locals env) (name (:id form)) form)
             :bindings (conj (:bindings env) form)}))

(defn with-param
  [env form]
  (conj (with-binding env form)
        {:params (conj (:params env) form)}))

(defn sub-env
  [env]
  {:enclosed (conj {}
                   (:enclosed env)
                   (:locals env))
   :locals {}
   :bindings []
   :params (or (:params env) [])})


(defn analyze-let*
  "Takes let form and enhances it's metadata via analyzed
  info"
  [env form is-loop]
  (let [expressions (rest form)
        bindings (first expressions)
        body (rest expressions)

        valid-bindings? (and (vector? bindings)
                             (even? (count bindings)))

        _ (assert valid-bindings?
                  "bindings must be vector of even number of elements")

        scope (reduce #(with-binding %1 (analyze-binding %1 %2))
                      (sub-env env)
                      (partition 2 bindings))

        bindings (:bindings scope)

        expressions (analyze-block (if is-loop
                                     (conj scope {:params bindings})
                                     scope)
                                   body)]

    {:op :let
     :form form
     :start (:start (meta form))
     :end (:end (meta form))
     :bindings bindings
     :statements (:statements expressions)
     :result (:result expressions)}))

(defn analyze-let
  [env form]
  (analyze-let* env form false))
(install-special! :let analyze-let)

(defn analyze-loop
  [env form]
  (conj (analyze-let* env form true) {:op :loop}))
(install-special! :loop analyze-loop)


(defn analyze-recur
  [env form]
  (let [params (:params env)
        forms (vec (map #(analyze env %) (rest form)))]

    (if (= (count params)
           (count forms))
      {:op :recur
       :form form
       :params forms}
      (syntax-error "Recurs with wrong number of arguments"
                    form))))
(install-special! :recur analyze-recur)

(defn analyze-quoted-list
  [form]
  {:op :list
   :items (map analyze-quoted (vec form))
   :form form
   :start (:start (meta form))
   :end (:end (meta form))})

(defn analyze-quoted-vector
  [form]
  {:op :vector
   :items (map analyze-quoted form)
   :form form
   :start (:start (meta form))
   :end (:end (meta form))})

(defn analyze-quoted-dictionary
  [form]
  (let [names (vec (map analyze-quoted (keys form)))
        values (vec (map analyze-quoted (vals form)))]
    {:op :dictionary
     :form form
     :keys names
     :values values
     :start (:start (meta form))
     :end (:end (meta form))}))

(defn analyze-quoted-symbol
  [form]
  {:op :symbol
   :name (name form)
   :namespace (namespace form)
   :form form})

(defn analyze-quoted-keyword
 [form]
  {:op :keyword
   :name (name form)
   :namespace (namespace form)
   :form form})

(defn analyze-quoted
  [form]
  (cond (symbol? form) (analyze-quoted-symbol form)
        (keyword? form) (analyze-quoted-keyword form)
        (list? form) (analyze-quoted-list form)
        (vector? form) (analyze-quoted-vector form)
        (dictionary? form) (analyze-quoted-dictionary form)
        :else {:op :constant
               :form form}))

(defn analyze-quote
  "Examples:
   (analyze-quote {} '(quote foo)) => {:op :constant
                                       :form 'foo
                                       :env env}"
  [env form]
  (analyze-quoted (second form)))
(install-special! :quote analyze-quote)

(defn analyze-statement
  [env form]
  (let [statements (or (:statements env) [])
        bindings (or (:bindings env) [])
        statement (analyze (conj env {:statements nil}) form)
        op (:op statement)

        defs (cond (= op :def) [(:var statement)]
                   ;; (= op :ns) (:requirement node)
                   :else nil)]

    (conj env {:statements (conj statements statement)
               :bindings (concat bindings defs)})))

(defn analyze-block
  "Examples:
  (analyze-block {} '((foo bar))) => {:statements nil
                                      :result {:op :invoke
                                               :form '(foo bar)
                                               :env {}
                                               :callee {:op :var
                                                        :form 'foo
                                                        :info nil
                                                        :env {}}
                                               :params [{:op :var
                                                         :form 'bar
                                                         :info nil
                                                         :env {}}]}
  (analyze-block {} '((beep bz)
                      (foo bar))) => {:statements [{:op :invoke
                                                    :form '(beep bz)
                                                    :env {}
                                                    :callee {:op :var
                                                             :form 'beep
                                                             :info nil
                                                             :env {}}
                                                    :params [{:op :var
                                                              :form 'bz
                                                              :info nil
                                                              :env {}}]}]
                                      :result {:op :invoke
                                               :form '(foo bar)
                                               :env {}
                                               :callee {:op :var
                                                        :form 'foo
                                                        :info nil
                                                        :env {}}
                                               :params [{:op :var
                                                         :form 'bar
                                                         :info nil
                                                         :env {}}]}"
  [env form]
  (let [body (if (> (count form) 1)
               (reduce analyze-statement
                       env
                       (butlast form)))
        result (analyze (or body env) (last form))]
    {:statements (:statements body)
     :result result}))

(defn analyze-fn-method
  "
  {} -> '([x y] (+ x y)) -> {:env {}
                             :form '([x y] (+ x y))
                             :variadic false
                             :arity 2
                             :params [{:op :var :form 'x}
                                      {:op :var :form 'y}]
                             :statements []
                             :return {:op :invoke
                                      :callee {:op :var
                                               :form '+
                                               :env {:parent {}
                                                     :locals {x {:name 'x
                                                                 :shadow nil
                                                                 :local true
                                                                 :tag nil}
                                                              y {:name 'y
                                                                 :shadow nil
                                                                 :local true
                                                                 :tag nil}}}}
                                      :params [{:op :var
                                                :form 'x
                                                :info nil
                                                :tag nil}
                                               {:op :var
                                                :form 'y
                                                :info nil
                                                :tag nil}]}}"
  [env form]
  (let [signature (if (and (list? form)
                           (vector? (first form)))
                    (first form)
                    (syntax-error "Malformed fn overload form" form))
        body (rest form)
        ;; If param signature contains & fn is variadic.
        variadic (some #(= '& %) signature)

        ;; All named params of the fn.
        params (if variadic
                 (filter #(not (= '& %)) signature)
                 signature)

        ;; Number of parameters fixed parameters fn takes.
        arity (if variadic
                (dec (count params))
                (count params))

        ;; Analyze parameters in correspondence to environment
        ;; locals to identify binding shadowing.
        scope (reduce #(with-param %1 (analyze-param %1 %2))
                      (conj env {:params []})
                      params)]
    (conj (analyze-block scope body)
          {:op :overload
           :variadic variadic
           :arity arity
           :params (:params scope)
           :form form})))


(defn analyze-fn
  [env form]
  (let [forms (rest form)
        ;; Normalize fn form so that it contains name
        ;; '(fn [x] x) -> '(fn nil [x] x)
        forms (if (symbol? (first forms))
                forms
                (cons nil forms))

        id (first forms)
        binding (if id (analyze-special analyze-declaration env id))

        body (rest forms)

        ;; Make sure that fn definition is strucutered
        ;; in method overload style:
        ;; (fn a [x] y) -> (([x] y))
        ;; (fn a ([x] y)) -> (([x] y))
        overloads (cond (vector? (first body)) (list body)
                        (and (list? (first body))
                             (vector? (first (first body)))) body
                        :else (syntax-error (str "Malformed fn expression, "
                                                 "parameter declaration ("
                                                 (pr-str (first body))
                                                 ") must be a vector")
                                            form))

        scope (if binding
                (with-binding (sub-env env) binding)
                (sub-env env))

        methods (map #(analyze-fn-method scope %)
                     (vec overloads))

        arity (apply max (map #(:arity %) methods))
        variadic (some #(:variadic %) methods)]
    {:op :fn
     :type :function
     :id binding
     :variadic variadic
     :methods methods
     :form form}))
(install-special! :fn analyze-fn)

(defn parse-references
  "Takes part of namespace definition and creates hash
  of reference forms"
  [forms]
  (reduce (fn [references form]
            ;; If not a vector than it's not a reference
            ;; form that wisp understands so just skip it.
            (if (seq? form)
              (assoc references
                (name (first form))
                (vec (rest form)))
              references))
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
        renames (get params ':rename)
        names (get params ':refer)
        alias (get params ':as)
        references (if (not (empty? names))
                     (reduce (fn [refers reference]
                      (conj refers
                            {:op :refer
                             :form reference
                             :name reference
                             ;; Look up by reference symbol and by symbol

                             ;; bit in a fuzz right now.
                             :rename (or (get renames reference)
                                         (get renames (name reference)))
                             :ns id}))
                             []
                             names))]
    {:op :require
     :alias alias
     :ns id
     :refer references
     :form form}))

(defn analyze-ns
  [env form]
  (let [forms (rest form)
        name (first forms)
        body (rest forms)
        ;; Optional docstring that follows name symbol
        doc (if (string? (first body)) (first body))
        ;; If second form is not a string than treat it
        ;; as regular reference form
        references (parse-references (if doc
                                       (rest body)
                                       body))
        requirements (if (:require references)
                       (map parse-require (:require references)))]
    {:op :ns
     :name name
     :doc doc
     :require (if requirements
                (vec requirements))
     :form form}))
(install-special! :ns analyze-ns)


(defn analyze-list
  "Takes form of list type and performs a macroexpansions until
  fully expanded. If expansion is different from a given form then
  expanded form is handed back to analyzer. If form is special like
  def, fn, let... than associated is dispatched, otherwise form is
  analyzed as invoke expression."
  [env form]
  (let [expansion (macroexpand form env)
        ;; Special operators must be symbols and stored in the
        ;; **specials** hash by operator name.
        operator (first form)
        analyzer (and (symbol? operator)
                      (get **specials** (name operator)))]
    ;; If form is expanded pass it back to analyze since it may no
    ;; longer be a list. Otherwise either analyze as a special form
    ;; (if it's such) or as function invokation form.
    (cond (not (identical? expansion form)) (analyze env expansion)
          analyzer (analyze-special analyzer env expansion)
          :else (analyze-invoke env expansion))))

(defn analyze-vector
  [env form]
  (let [items (vec (map #(analyze env %) form))]
    {:op :vector
     :form form
     :items items}))

(defn analyze-dictionary
  [env form]
  (let [names (vec (map #(analyze env %) (keys form)))
        values (vec (map #(analyze env %) (vals form)))]
    {:op :dictionary
     :keys names
     :values values
     :form form}))

(defn analyze-invoke
  "Returns node of :invoke type, representing a function call. In
  addition to regular properties this node contains :callee mapped
  to a node that is being invoked and :params that is an vector of
  paramter expressions that :callee is invoked with."
  [env form]
  (let [callee (analyze env (first form))
        params (vec (map #(analyze env %) (rest form)))]
    {:op :invoke
     :callee callee
     :params params
     :form form}))

(defn analyze-constant
  "Returns a node representing a contstant value which is
  most certainly a primitive value literal this form cantains
  no extra information."
  [env form]
  {:op :constant
   :form form})

(defn analyze
  "Takes a hash representing a given environment and `form` to be
  analyzed. Environment may contain following entries:

  :locals  - Hash of the given environments bindings mappedy by binding name.
  :context - One of the following :statement, :expression, :return. That
             information is included in resulting nodes and is meant for
             writer that may output different forms based on context.
  :ns      - Namespace of the forms being analyzed.

  Analyzer performs all the macro & syntax expansions and transforms form
  into AST node of an expression. Each such node contains at least following
  properties:

  :op   - Operation type of the expression.
  :form - Given form.

  Based on :op node may contain different set of properties."
  ([form] (analyze {:locals {}
                    :bindings []
                    :top true} form))
  ([env form]
   (cond (nil? form) (analyze-constant env form)
         (symbol? form) (analyze-symbol env form)
         (list? form) (if (empty? form)
                        (analyze-quoted form)
                        (analyze-list env form))
         (dictionary? form) (analyze-dictionary env form)
         (vector? form) (analyze-vector env form)
         ;(set? form) (analyze-set env form name)
         (keyword? form) (analyze-keyword env form)
         :else (analyze-constant env form))))
