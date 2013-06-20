(ns wisp.analyzer
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
            [wisp.expander :refer [macroexpand]]
            [wisp.string :refer [split]]))

(defn analyze-symbol
  "Finds the var associated with symbol
  Example:

  (analyze-symbol {} 'foo) => {:op :var
                               :form 'foo
                               :info nil
                               :env {}}"
  [env form]
  {:op :var
   :form form
   :info (get (:locals env) (name form))
   :env env})

(defn analyze-keyword
  "Example:
  (analyze-keyword {} :foo) => {:op :constant
                                :form ':foo
                                :env {}}"
  [env form]
  {:op :constant
   :form form
   :env env})

(def **specials** {})

(defn install-special!
  [op f]
  (set! (get **specials** (name op)) f))

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
    {:op :if
     :form form
     :test test
     :consequent consequent
     :alternate alternate
     :env env}))

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
     :throw expression
     :env env}))

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
                  (conj {:name (analyze env
                                        (first handler-form))}
                        (analyze-block env (rest handler-form))))

        ;; Try
        body (if handler-form
               (analyze-block env (butlast body-form))
               (analyze-block env body-form))]
    {:op :try
     :form form
     :body body
     :handler handler
     :finalizer finalizer
     :env env}))

(install-special! :try analyze-try)

(defn analyze-set!
  [env form]
  (let [body (rest form)
        left (first body)
        right (second body)
        target (cond (symbol? left) (analyze-symbol env left name)
                     (list? left) (analyze-list env left name)
                     :else left)
         value (analyze env right)]
    {:op :set!
     :target target
     :value value
     :form form
     :env env}))
(install-special! :set! analyze-set!)

(defn analyze-new
  [env form]
  (let [body (rest form)
        constructor (analyze env (first body))
        params (vec (map #(analyze env %) (rest body)))]
    {:op :new
     :constructor constructor
     :form form
     :params params
     :env env}))
(install-special! :new analyze-new)

(defn analyze-aget
  [env form]
  (let [body (rest form)
        target (analyze env (first body))
        attribute (second body)
        field (and (quote? attribute)
                   (symbol? (second attribute))
                   (second attribute))
        property (analyze env (or field attribute))]
    {:op :member-expression
     :computed (not field)
     :form form
     :target target
     :property property
     :env env}))
(install-special! :aget analyze-aget)

(defn parse-def
  ([symbol] {:symbol symbol})
  ([symbol init] {:symbol symbol :init init})
  ([symbol doc init] {:symbol symbol
                      :doc doc
                      :init init}))

(defn analyze-def
  [env form _]
  (let [params (apply parse-def (vec (rest form)))
        symbol (:symbol params)
        metadata (meta symbol)

        export? (and (not (nil? (:parent env)))
                     (not (:private metadata)))

        tag (:tag metadata)
        protocol (:protocol metadata)
        dynamic (:dynamic metadata)
        ns-name (:name (:ns env))

        ;name (:name (resolve-var (dissoc env :locals) sym))

        init (analyze env (:init params) symbol)
        variable (analyze env symbol)

        doc (or (:doc params)
                (:doc metadata))]
    {:op :def
     :form form
     :doc doc
     :var variable
     :init init
     :tag tag
     :dynamic dynamic
     :export export?
     :env env}))
(install-special! :def analyze-def)

(defn analyze-do
  [env form _]
  (let [expressions (rest form)
        body (analyze-block env expressions)]
    (conj body {:op :do
                :form form
                :env env})))
(install-special! :do analyze-do)

(defn analyze-binding
  [env form]
  (let [name (first form)
        init (analyze env (second form))
        init-meta (meta init)
        fn-meta (if (= 'fn (:op init-meta))
                  {:fn-var true
                   :variadic (:variadic init-meta)
                   :max-fixed-arity (:max-fixed-arity init-meta)
                   :method-params (map #(:params %)
                                       (:methods init-meta))}
                  {})
        binding-meta {:name name
                      :init init
                      :tag (or (:tag (meta name))
                               (:tag init-meta)
                               (:tag (:info init-meta)))
                      :local true
                      :shadow (get (:locals env) name)}]
    (assert (not (or (namespace name)
                     (< 1 (count (split \. (str name)))))))
    (conj binding-meta fn-meta)))


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

        context (:context env)

        locals (map #(analyze-binding env %)
                    (partition 2 bindings))

        params (or (if is-loop locals)
                   (:params env))

        scope (conj {:parent env
                     :bindings locals}
                    (if params {:params params}))

        expressions (analyze-block scope body)]

    {:op :let
     :form form
     :loop is-loop
     :bindings locals
     :statements (:statements expressions)
     :result (:result expressions)
     :env env}))

(defn analyze-let
  [env form _]
  (analyze-let* env form false))
(install-special! :let analyze-let)

(defn analyze-loop
  [env form _]
  (conj (analyze-let* env form true)
        {:op :loop}))
(install-special! :loop analyze-loop)


(defn analyze-recur
  [env form _]
  (let [context (:context env)
        params (:params env)
        forms (vec (map #(analyze env %) (rest form)))]

    (assert (identical? (count params)
                        (count forms))
            "Recurs with unexpected number of arguments")

    {:op :recur
     :form form
     :env env
     :params forms}))
(install-special! :recur analyze-recur)

(defn analyze-quoted-list
  [form]
  {:op :list
   :items (map analyze-quoted (vec form))
   :form form})

(defn analyze-quoted-vector
  [form]
  {:op :vector
   :items (map analyze-quoted form)
   :form form})

(defn analyze-quoted-dictionary
  [form]
  (let [names (vec (map analyze-quoted (keys form)))
        values (vec (map analyze-quoted (vals form)))]
    {:op :dictionary
     :form form
     :keys names
     :values values}))

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
  [env form _]
  (analyze-quoted (second form)))
(install-special! :quote analyze-quote)


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
  (let [statements (if (> (count form) 1)
                     (vec (map #(analyze env %)
                               (butlast form))))
        result (analyze env (last form))]
    {:statements statements
     :result result
     :env env}))

(defn analyze-fn-param
  [env id]
  (let [locals (:locals env)
        param {:name id
               :tag (:tag (meta id))
               :shadow (aget locals (name id))}]
    (conj env
          {:locals (assoc locals (name id) param)
           :params (conj (:params env)
                         param)})))

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
  (let [signature (first form)
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
        bindings (reduce analyze-fn-param
                         {:locals (:locals env)
                          :params []}
                         params)

        scope (conj env {:locals (:locals bindings)})]
    (conj (analyze-block scope body)
          {:op :overload
           :variadic variadic
           :arity arity
           :params (:params bindings)
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

        ;; Make sure that fn definition is strucutered
        ;; in method overload style:
        ;; (fn a [x] y) -> (([x] y))
        ;; (fn a ([x] y)) -> (([x] y))
        overloads (if (vector? (second forms))
                    (list (rest forms))
                    (rest forms))

        ;; Hash map of local bindings
        locals (or (:locals env) {})


        scope {:parent env
               :locals (if id
                         (assoc locals
                           (name id)
                           {:op :var
                            :fn-var true
                            :form id
                            :env env
                            :shadow (get locals (name id))})
                         locals)}

        methods (map #(analyze-fn-method scope %)
                     (vec overloads))

        arity (apply max (map #(:arity %) methods))
        variadic (some #(:variadic %) methods)]
    {:op :fn
     :name id
     :variadic variadic
     :methods methods
     :form form
     :env env}))
(install-special! :fn analyze-fn)

(defn parse-references
  "Takes part of namespace difinition and creates hash
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
                             :rename (get renames (name reference))
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
     :form form
     :env env}))
(install-special! :ns analyze-ns)


(defn analyze-list
  [env form]
  (let [expansion (macroexpand form)
        operator (first expansion)
        analyze-special (and (symbol? operator)
                             (get **specials** (name operator)))]
    (if analyze-special
      (analyze-special env expansion name)
      (analyze-invoke env expansion))))

(defn analyze-vector
  [env form name]
  (let [items (vec (map #(analyze env % name) form))]
    {:op :vector
     :form form
     :items items
     :env env}))

(defn hash-key?
  [form]
  (or (and (string? form)
           (not (symbol? form)))
      (keyword? form)))

(defn analyze-dictionary
  [env form name]
  (let [names (vec (map #(analyze env % name) (keys form)))
        values (vec (map #(analyze env % name) (vals form)))]
    {:op :dictionary
     :form form
     :keys names
     :values values
     :env env}))

(defn analyze-invoke
  [env form]
  (let [callee (analyze env (first form))
        params (vec (map #(analyze env %) (rest form)))]
    {:op :invoke
     :callee callee
     :form form
     :params params
     :env env}))

(defn analyze-constant
  [env form]
  {:op :constant
   :form form
   :env env})

(defn analyze
  "Given an environment, a map containing {:locals (mapping of names to bindings), :context
  (one of :statement, :expr, :return), :ns (a symbol naming the
  compilation ns)}, and form, returns an expression object (a map
  containing at least :form, :op and :env keys). If expr has any (immediately)
  nested exprs, must have :children [exprs...] entry. This will
  facilitate code walking without knowing the details of the op set."
  ([env form] (analyze env form nil))
  ([env form name]
   (cond (nil? form) (analyze-constant env form)
         (symbol? form) (analyze-symbol env form)
         (and (list? form)
              (not (empty? form))) (analyze-list env form name)
         (dictionary? form) (analyze-dictionary env form name)
         (vector? form) (analyze-vector env form name)
         ;(set? form) (analyze-set env form name)
         (keyword? form) (analyze-keyword env form)
         :else (analyze-constant env form))))
