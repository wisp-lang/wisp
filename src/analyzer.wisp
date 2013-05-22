(import [symbol symbol? keyword? meta name namespace] "./ast")
(import [seq? seq conj map every? interleave empty?
         list* list first last rest count] "./sequence")
(import [vector? dictionary? string? keys vals =
         nil? merge] "./runtime")
(import [split] "./string")

(defn get-in
  "Returns the value in a nested associative structure,
  where ks is a sequence of keys. Returns nil if the key
  is not present, or the not-found value if supplied."
  [dictionary keys not-found]
  (loop [target dictionary
         sentinel {}
         keys keys]
    (if (empty? keys)
      target
      (let [result (get target (first keys) sentinel)]
        (if (identical? result sentinel)
          not-found
          (recur result sentinel (rest keys)))))))

(defn empty-env [ns]
  "Utility function that creates empty namespaces"
  {:ns ns;(@namespaces *cljs-ns*)
   :namespaces {}
   :context :statement
   :locals {}})

(defn- local-binding [env form]
  (get (:locals env) form))

(defn core-name?
  "Is sym visible from core in the current compilation namespace?"
  [env sym]
  false)

(defn resolve-ns-alias [env name]
  (let [sym (symbol name)]
    (get (:requires (:ns env)) sym sym)))

(defn resolve-existing-var [env form]
  (if (= (namespace form) "js")
    {:name form :ns 'js}
    (let [namespaces (:namespaces env)
          s (str form)
          binding (local-binding env form)]
      (cond
       binding binding
       ;; Attempt to resolve symbol in the namespace it's from
       (namespace form) (let [ns (namespace form)
                              ns (if (= "clojure.core" ns) "cljs.core" ns)
                              full-ns (resolve-ns-alias env ns)
                              id (symbol (name form))]
       ;                   (confirm-var-exists env full-ns id)
                          (merge (get-in namespaces [full-ns :defs id])
                                 {:name (symbol (str full-ns) (str (name form)))
                                  :ns full-ns}))

       ; Attempt to resolve java thingy
       ;(and (not (= ".." s))
       ;     (< 1 (count (split s ".")))) (let [prefix (symbol (first (split s ".")))
       ;                                        suffix (symbol (second (split s "." 2)))
       ;                                        binding (local-binding env prefix)]
       ;                                    (if binding
       ;                                      {:name (symbol (str (:name binding) suffix))}
       ;                                      (do
       ;                                        (confirm-var-exists env prefix suffix)
       ;                                        (merge (get-in @namespaces [prefix :defs suffix])
       ;                                               {:name (if (= "" (name prefix))
       ;                                                        suffix
       ;                                                        (symbol (str prefix) (str suffix)))
       ;                                                :ns prefix}))))

       ;; Attempt to resolve by module env namespace
       ;(get-in @namespaces
       ;        [(:name (:ns env)) :uses form]) (let [ns (:name (:ns env))
       ;                                              full-ns (get-in @namespaces
       ;                                                              [ns :uses form])]
       ;                                         (merge
       ;                                          (get-in @namespaces [full-ns :defs form])
       ;                                          {:name (symbol (str full-ns) (str form))
       ;                                           :ns ns}))

       ;; Attempt to resolve by imports ?
       ;(get-in @namespaces [(:name (:ns env)) :imports sym]) (recur env
       ;                                                             (get-in @namespaces
       ;                                                                     [(:name (:ns env))
       ;                                                                      :imports
       ;                                                                      form]))

       :else (let [full-ns (if (core-name? env form)
                             'cljs.core
                             (:name (:ns env)))]
               ;(confirm-var-exists env full-ns form)
               (merge (get-in namespaces [full-ns :defs form])
                      {:name (symbol (str full-ns) (str form))
                       :ns full-ns}))))))

(defn special?
  [op]
  (or (= op 'if)
      (= op 'def)
      (= op 'fn*)
      (= op 'do)
      (= op 'let*)
      (= op 'loop*)
      (= op 'letfn*)
      (= op 'throw)
      (= op 'try*)
      (= op 'recur)
      (= op 'new)
      (= op 'set!)
      (= op 'ns)
      (= op 'deftype*)
      (= op 'defrecord*)
      (= op '.)
      (= op 'js*)
      (= op '&)
      (= op 'quote)))

(defn analyze-seq
  [env form name]
  (let [env (conj env {:line
                       (or (:line (meta form))
                           (:line env))})]
    (let [op (first form)]
      (assert (not (nil? op)) "Can't call nil")
      (let [expansion (macroexpand form)]
        (if (special? op)
          (parse op env form name)
          (parse-invoke env form))))))

(defn- method-call? [form]
  (= (first form) \.))

(defn- instantiation? [form]
  (= (last form) \.))

(defn- get-ns-exclude [env sym]
  (get (:excludes (:ns env)) sym))

(defn- get-ns-name [env]
  (:name (:ns env)))

(defn- get-macro-uses [env sym]
  (get (:uses-macros (:ns env)) sym))

(defn macro-sym? [env sym]
  (let [namespaces (:namespaces env)
        local (local-binding env sym)
        ns-id (get-ns-name env)]
    (not (or local ;locals shadow macros
             (and (or (get-ns-exclude env sym)
                      (get-in namespaces [ns-id :excludes sym]))
                  (not (or (get-macro-uses env sym)
                           (get-in namespaces [ns-id :uses-macros sym]))))))))

(defn get-expander [sym env]
  ;; TODO: Finish
  (let [op (and (macro-sym? env sym)
                (resolve-existing-var (empty-env) sym))]
    (if (and op (:macro op))
      ;; TODO: Get rid of eval
      (js/eval (str (cljs.compiler/munge (:name op)))))))

(defn sugar?
  [op]
  (let [id (str op)]
  (or (identical? (first id) \.)
      (identical? (last id) \.))))

(defn macro? [op]
  false)

(defn desugar-1
 [form]
 (let [id (str form)
        params (rest form)
        metadata (meta form)]
    (cond
     (method-call? id) (with-meta
                         (list* '. (first param) (symbol (subs id 1)) (rest params))
                         metadata)
     (instantiation? id) (with-meta
                           (list* 'new
                                  (symbol (subs opname 0 (dec (count opname))))
                                  params)
                           metadata)
     :else form)))



(defn macroexpand-1 [form]
  (let [op (first form)]
    (cond (special? op) form
          (sugar? op) (desugar-1 form)
          (macro? op) (apply (get-expander op)
                             form
                             (rest form))
          :else form)))

(defn macroexpand
  "Repeatedly calls macroexpand-1 on form until it no longer
  represents a macro form, then returns it.  Note neither
  macroexpand-1 nor macroexpand expand macros in subforms."
  [form]
  (loop [form form
         expansion (macroexpand-1 form)]
    (if (identical? form expansion)
      form
      (recur expansion (macroexpand-1 expansion)))))



(defn analyze-symbol
  "Finds the var associated with sym"
  [env symbol]
  (let [result {:env env :form symbol}
        locals (:locals env)
        local (get locals symbol)]
    (conj result {:op :var
                  :info (if local
                          local
                          (resolve-existing-var env symbol))})))

;; TODO: for now we just define *reader-ns-name* so that code below
;; wil pass. In a future we should just use `module.id` or name
;; defined under ns form.
(def ^:private *reader-ns-name* 'clojure.reader/reader)
(defn analyze-keyword
  [env form]
  ;; When not at the REPL, *ns-sym* is not set so the reader did not
  ;; know the namespace of the keyword
  {:op :constant :env env
   :form (if (= (namespace form) (name *reader-ns-name*))
           (keyword (name (:name (:ns env))) (name form))
           form)})

(defn simple-key?
  [x]
  (or (string? x)
      (keyword? x)))

(defn analyze-dictionary
  [env form name]
  (let [expr-env (conj env {:context :expr})
        names (keys form)
        simple-keys? (every? simple-key? names)
        ks (disallowing-recur (vec (map #(analyze expr-env % name) names)))
        vs (disallowing-recur (vec (map #(analyze expr-env % name) (vals form))))]
    (analyze-wrap-meta {:op :map :env env :form form
                        :keys ks :vals vs :simple-keys? simple-keys?
                        :children (vec (interleave ks vs))}
                       name)))

(defn analyze-vector
  [env form name]
  (let [expr-env (conj env {:context :expr})
        items (disallowing-recur (vec (map #(analyze expr-env % name) form)))]
    (analyze-wrap-meta {:op :vector :env env :form form :items items :children items} name)))

(defn analyze-wrap-meta [expr name]
  (let [form (:form expr)
        metadata (meta form)
        env (:env expr) ; take on expr's context
        expr (if metadata (assoc-in expr [:env :context] :expr)) ; change expr to :expr
        meta-expr (if metadata (analyze-map env metadata name))]
    (if metadata
      {:op :meta :env env :form form
       :meta meta-expr :expr expr :children [meta-expr expr]}
      expr)))

(defn analyze-map
  [env form name]
  (let [expr-env (conj env {:context :expr})
        simple-keys? (every? #(or (string? %) (keyword? %))
                             (keys form))
        ks (disallowing-recur (vec (map #(analyze expr-env % name) (keys form))))
        vs (disallowing-recur (vec (map #(analyze expr-env % name) (vals form))))]
    (analyze-wrap-meta {:op :map :env env :form form
                        :keys ks :vals vs :simple-keys? simple-keys?
                        :children (vec (interleave ks vs))}
                       name)))

(defn analyze
  "Given an environment, a map containing {:locals (mapping of names to bindings), :context
  (one of :statement, :expr, :return), :ns (a symbol naming the
  compilation ns)}, and form, returns an expression object (a map
  containing at least :form, :op and :env keys). If expr has any (immediately)
  nested exprs, must have :children [exprs...] entry. This will
  facilitate code walking without knowing the details of the op set."
  ([env form] (analyze env form nil))
  ([env form name]
   ;; (load-core) TODO: Find out what that's for
   (cond
    (symbol? form) (analyze-symbol env form)
    (keyword? form) (analyze-keyword env form)

    (and (seq? form)
         (not (empty? form))) (analyze-seq env form name)
    ;(map? form) (analyze-map env form name)
    (dictionary? form) (analyze-dictionary env form name)
    (vector? form) (analyze-vector env form name)
    ;(set? form) (analyze-set env form name)

    :else {:op :constant :env env :form form})))