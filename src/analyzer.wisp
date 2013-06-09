(ns wisp.analyzer
  (:require [wisp.ast :refer [meta with-meta symbol? keyword?
                              quote? symbol namespace name]]
            [wisp.sequence :refer [list? list conj partition seq
                                   empty? map vec every? concat
                                   first second third rest last
                                   butlast interleave cons count
                                   some assoc reduce filter]]
            [wisp.compiler :refer [macroexpand]]
            [wisp.runtime :refer [nil? dictionary? vector? keys
                                  vals string? number? boolean?
                                  date? re-pattern? even? = max
                                  dec]]
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
   :info (get (:locals env) form)
   :env env})

(defn analyze-keyword
  "Example:
  (analyze-keyword {} :foo) => {:op :constant
                                :type :keyword
                                :form ':foo
                                :env {}}"
  [env form]
  {:op :constant
   :type :keyword
   :form form
   :env env})

(def specials {})

(defn install-special
  [name f]
  (set! (get specials name) f))

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

(install-special :if analyze-if)

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
  [env form name]
  (let [expression (analyze env (second form))]
    {:op :throw
     :form form
     :throw expression
     :env env}))

(install-special :throw analyze-throw)

(defn analyze-try
  [env form name]
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
    {:op :try*
     :form form
     :body body
     :handler handler
     :finalizer finalizer
     :env env}))

(install-special :try* analyze-try)

(defn analyze-set!
  [env form name]
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
(install-special :set! analyze-set!)

(defn analyze-new
  [env form _]
  (let [body (rest form)
        constructor (analyze env (first body))
        params (vec (map #(analyze env %) (rest body)))]
    {:op :new
     :constructor constructor
     :form form
     :params params
     :env env}))
(install-special :new analyze-new)

(defn analyze-aget
  [env form _]
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
     :env env}
    ))
(install-special :aget analyze-aget)

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
(install-special :def analyze-def)

(defn analyze-do
  [env form _]
  (let [expressions (rest form)
        body (analyze-block env expressions)]
    (conj body {:op :do
                :form form
                :env env})))
(install-special :do analyze-do)

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


(defn analyze-let
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

(defn analyze-let*
  [env form _]
  (analyze-let env form false))
(install-special :let* analyze-let*)

(defn analyze-loop*
  [env form _]
  (conj (analyze-let env form true)
        {:op :loop*}))
(install-special :loop* analyze-loop*)


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
(install-special :recur analyze-recur)

(defn analyze-quote
  "Examples:
   (analyze-quote {} '(quote foo)) => {:op :constant
                                       :form 'foo
                                       :env env}"
  [env form _]
  {:op :constant
   :form (second form)
   :env :env})



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
  [env name]
  (let [locals (:locals env)
        param {:name name
               :tag (:tag (meta name))
               :shadow (aget locals name)}]
    (conj env
          {:locals (assoc locals name param)
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

        name (first forms)

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
               :locals (if name
                         (assoc locals name {:op :var
                                             :fn-var true
                                             :form name
                                             :env env
                                             :shadow (get locals name)})
                         locals)}

        methods (map #(analyze-fn-method scope %)
                     (vec overloads))

        arity (apply max (map #(:arity %) methods))
        variadic (some #(:variadic %) methods)]
    {:op :fn
     :name name
     :variadic variadic
     :methods methods
     :form form
     :env env}))
(install-special :fn analyze-fn)


(defn analyze-list
  [env form name]
  (let [expansion (macroexpand form)
        operator (first expansion)
        analyze-special (get specials operator)]
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
  (or (string? form) (keyword? form)))

(defn analyze-dictionary
  [env form name]
  (let [hash? (every? hash-key? (keys form))
        names (vec (map #(analyze env % name) (keys form)))
        values (vec (map #(analyze env % name) (vals form)))]
    {:op :dictionary
     :hash? hash?
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
     :tag (or (:tag (:info callee))
              (:tag (meta form)))
     :env env}))

(defn analyze-constant
  [env form]
  {:op :constant
   :form form
   :type (cond (nil? form) :nil
               (string? form) :string
               (number? form) :number
               (boolean? form) :boolean
               (date? form) :date
               (re-pattern? form) :re-pattern
               (list? form) :list
               :else :unknown)
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
