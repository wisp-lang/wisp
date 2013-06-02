(ns wisp.analyzer
  (:require [wisp.ast :refer [meta with-meta symbol? keyword?
                              quote? symbol]]
            [wisp.sequence :refer [list? list conj partition seq
                                   empty? map vec every? concat
                                   first second third rest last
                                   butlast interleave cons count]]
            [wisp.compiler :refer [macroexpand]]
            [wisp.runtime :refer [nil? dictionary? vector? keys
                                  vals string? number? boolean?
                                  date? re-pattern? =]]))

(defn conj-meta
  [value metadata]
  (with-meta value
    (conj metadata (meta value))))

(defn analyze-symbol
  "Finds the var associated with sym"
  [env form]
  {:op :var
   :env env
   :form form
   :meta (meta form)
   :info (get (:locals env) form)})

(defn analyze-keyword
  [env form]
  {:op :constant
   :type :keyword
   :env env
   :form form})

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
    {:env env
     :op :if
     :form form
     :test test
     :consequent consequent
     :alternate alternate}))

(install-special :if analyze-if)

(defn analyze-throw
  [env form name]
  (let [expression (analyze env (second form))]
    {:env env
     :op :throw
     :form form
     :throw expression}))

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
     :env env
     :form form
     :body body
     :handler handler
     :finalizer finalizer}))

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
     :value value}))
(install-special :set! analyze-set!)

(defn analyze-new
  [env form _]
  (let [body (rest form)
        constructor (analyze env (first body))
        params (vec (map #(analyze env %) (rest body)))]
    {:op :new
     :env env
     :form form
     :constructor constructor
     :params params}))
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
     :env env
     :form form
     :target target
     :computed (not field)
     :property property}))
(install-special :aget analyze-aget)

(defn analyze-def
  [env form _]
  (let [pfn (fn
              ([_ sym] {:sym sym})
              ([_ sym init] {:sym sym :init init})
              ([_ sym doc init] {:sym sym :doc doc :init init}))

        args (apply pfn (vec form))
        sym (:sym args)
        sym-metadata (meta sym)

        export? (and (:top sym-metadata)
                     (not (:private sym-metadata)))

        tag (:tag sym-metadata)
        protocol (:protocol sym-metadata)
        dynamic (:dynamic sym-metadata)
        ns-name (:name (:ns env))

        name (:name (resolve-var (dissoc env :locals) sym))

        init-expr (if (not (nil? (args :init)))
                    (analyze env (:init args) sym))

        fn-var? (and init-expr
                     (= :fn (:op init-expr)))

        doc (or (:doc args)
                (:doc sym-metadata))]
    {:op :def
     :env env
     :form form
     :name name
     :doc doc
     :init init-expr
     :tag tag
     :dynamic true
     :export true}))
(install-special :def analyze-def)

(defn analyze-do
  [env form _]
  (let [expressions (rest form)
        body (analyze-block env expressions)]
    (conj body {:op :do
                :env env
                :form form})))
(install-special :do analyze-do)

(defn analyze-binding
  [form]
  (let [name (first form)
        init (analyze env (second form))
        init-meta (meta init)
        fn-meta (if (= (:op init-meta))
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
    (assert (not (or namespace)
                 (< 1 (count (split \. (str name))))))
    (conj-meta form (conj binding-meta fn-meta))))

(defn analyze-recur-frame
  [form env recur-frame bindings]
  (let [*recur-frames* (if recur-frame
                         (cons recur-frame *recur-frames*)
                         *recur-frames*)
        *loop-lets* (cond is-loop (or *loop-lets* '())
                          *loop-lets* (cons {:params bindings}
                                            *loop-lets*))]
    (analyze-block env form)))


(defn analyze-let
  "Takes let form and enhances it's metadata via analyzed
  info:
  '(let [x 1
         y 2]
    (+ x y)) ->
  "
  [env form is-loop]
  (let [expressions (rest form)
        bindings (first expressions)
        body (rest expressions)

        valid-bindings? (and (vector? bindings)
                             (even? (count bindings)))

        _ (assert valid-bindings?
                  "bindings must be vector of even number of elements")

        context (:context env)

        defs (map analyze-binding bindings)

        recur-frame (if is-loop
                      {:params defs
                       :flag {}})

        expressions (analyze-recur-frame env
                                         body
                                         recur-frame
                                         defs)]
    (conj-meta form
               {:op :let
                :loop is-loop
                :bindings bindings
                :statements expressions
                :ret ret})))

(defn analyze-let*
  [env form _]
  (analyze-let env form false))
(install-special :let* analyze-let*)

(defn analyze-loop*
  [env form _]
  (analyze-let env form true))
(install-special :loop* analyze-loop*)


(defn analyze-recur
  [env form _]
  (let [context (:context env)
        expressions (vec (map #(analyze env %) (rest form)))]
    (conj-meta form
               {:op :recur
                :expressions expressions})))
(install-special :recur analyze-recur)

(defn analyze-quote
  [env form _]
  {:op :constant
   :env :env
   :form (second form)})



(defn analyze-block
  "returns {:statements .. :ret ..}"
  [env form]
  (let [statements (seq (map #(analyze env %)
                             (butlast form)))
        result (if (<= (count form) 1)
                 (analyze env (first form))
                 (analyze env (last form)))]
    {:env env
     :statements (vec statements)
     :result result}))


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
     :env env
     :meta (meta form)
     :form form
     :items items}))

(defn hash-key?
  [form]
  (or (string? form) (keyword? form)))

(defn analyze-dictionary
  [env form name]
  (let [hash? (every? hash-key? (keys form))
        names (vec (map #(analyze env % name) (keys form)))
        values (vec (map #(analyze env % name) (vals form)))]
    {:op :dictionary
     :env env
     :form form
     :keys names
     :values values
     :hash? hash?}))

(defn analyze-invoke
  [env form]
  (let [callee (analyze env (first form))
        params (vec (map #(analyze env %) (rest form)))]
    {:op :invoke
     :callee callee
     :form form
     :env env
     :params params
     :tag (or (:tag (:info callee))
              (:tag (meta form)))}))

(defn analyze-constant
  [env form type]
  {:op :constant
   :type type
   :env env
   :form form
   :type (cond (nil? form) :nil
               (string? form) :string
               (number? form) :number
               (boolean? form) :boolean
               (date? form) :date
               (re-pattern? form) :re-pattern
               (list? form) :list
               :else :unknown)})

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
