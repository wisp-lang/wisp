(ns wisp.analyzer
  (:require [wisp.ast :refer [meta with-meta symbol? keyword?
                              quote? symbol namespace name]]
            [wisp.sequence :refer [list? list conj partition seq
                                   empty? map vec every? concat
                                   first second third rest last
                                   butlast interleave cons count]]
            [wisp.compiler :refer [macroexpand]]
            [wisp.runtime :refer [nil? dictionary? vector? keys
                                  vals string? number? boolean?
                                  date? re-pattern? even? =]]
            [wisp.string :refer [split]]))

(defn analyze-symbol
  "Finds the var associated with sym"
  [env form]
  {:op :var
   :form form
   :meta (meta form)
   :info (get (:locals env) form)
   :env env})

(defn analyze-keyword
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
        {:op 'loop*}))
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
  [env form _]
  {:op :constant
   :form (second form)
   :env :env})



(defn analyze-block
  "returns {:statements .. :ret ..}"
  [env form]
  (let [statements (seq (map #(analyze env %)
                             (butlast form)))
        result (if (<= (count form) 1)
                 (analyze env (first form))
                 (analyze env (last form)))]
    {:statements (vec statements)
     :result result
     :env env}))


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
     :meta (meta form)
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
  [env form type]
  {:op :constant
   :type type
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

(defn analyze  "Given an environment, a map containing {:locals (mapping of names to bindings), :context
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
