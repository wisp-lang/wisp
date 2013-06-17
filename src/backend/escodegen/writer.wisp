(ns wisp.backend.escodegen.writer
  (:require [wisp.reader :refer [read-from-string]]
            [wisp.ast :refer [meta with-meta symbol? symbol keyword? keyword
                              namespace unquote? unquote-splicing? quote?
                              syntax-quote? name gensym pr-str]]
            [wisp.sequence :refer [empty? count list? list first second third
                                   rest cons conj butlast reverse reduce vec
                                   last map filter take concat partition
                                   repeat interleave]]
            [wisp.runtime :refer [odd? dictionary? dictionary merge keys vals
                                  contains-vector? map-dictionary string?
                                  number? vector? boolean? subs re-find true?
                                  false? nil? re-pattern? inc dec str char
                                  int = ==]]
            [wisp.string :refer [split join upper-case replace]]
            [wisp.expander :refer [install-macro!]]
            [escodegen :refer [generate]]))


(defn translate-identifier
  "Translates references from clojure convention to JS:

  **macros**      __macros__
  list->vector    listToVector
  set!            set
  foo_bar         foo_bar
  number?         isNumber
  red=            redEqual
  create-server   createServer"
  [form]
  (def id (name form))
  (set! id (cond (identical? id  "*") "multiply"
                 (identical? id "/") "divide"
                 (identical? id "+") "sum"
                 (identical? id "-") "subtract"
                 (identical? id "=") "equal?"
                 (identical? id "==") "strict-equal?"
                 (identical? id "<=") "not-greater-than"
                 (identical? id ">=") "not-less-than"
                 (identical? id ">") "greater-than"
                 (identical? id "<") "less-than"
                 :else id))

  ;; **macros** ->  __macros__
  (set! id (join "_" (split id "*")))
  ;; list->vector ->  listToVector
  (set! id (join "-to-" (split id "->")))
  ;; set! ->  set
  (set! id (join (split id "!")))
  (set! id (join "$" (split id "%")))
  (set! id (join "-equal-" (split id "=")))
  ;; foo= -> fooEqual
  ;(set! id (join "-equal-" (split id "="))
  ;; foo+bar -> fooPlusBar
  (set! id (join "-plus-" (split id "+")))
  (set! id (join "-and-" (split id "&")))
  ;; number? -> isNumber
  (set! id (if (identical? (last id) "?")
             (str "is-" (subs id 0 (dec (count id))))
             id))
  ;; create-server -> createServer
  (set! id (reduce
            (fn [result key]
              (str result
                   (if (and (not (empty? result))
                            (not (empty? key)))
                     (str (upper-case (get key 0)) (subs key 1))
                     key)))
            ""
            (split id "-")))
  id)


;; Operators that compile to binary expressions

(defn make-binary-expression
  [operator left right]
  {:type :BinaryExpression
   :operator operator
   :left left
   :right right})


(defmacro def-binary-operator
  [id operator default-operand make-operand]
  `(set-operator! (name ~id)
                  (fn make-expression
                    ([] (write ~default-operand))
                    ([operand] (write (~make-operand operand)))
                    ([left right] (make-binary-expression ~operator
                                                          (write left)
                                                          (write right)))
                    ([left & more] (make-binary-expression ~operator
                                                          (write left)
                                                          (apply make-expression right))))))

(defn verify-one
  [operator]
  (error (str operator "form requires at least one operand")))

(defn verify-two
  [operator]
  (error (str operator "form requires at least two operands")))

;; Arithmetic operators

;(def-binary-operator :+ :+ 0 identity)
;(def-binary-operator :- :- 'NaN identity)
;(def-binary-operator :* :* 1 identity)
;(def-binary-operator (keyword "/") (keyword "/") verify-two verify-two)
;(def-binary-operator :mod (keyword "%") verify-two verify-two)

;; Comparison operators

;(def-binary-operator :not= :!= verify-one false)
;(def-binary-operator :== :=== verify-one true)
;(def-binary-operator :identical? '=== verify-two verify-two)
;(def-binary-operator :> :> verify-one true)
;(def-binary-operator :>= :>= verify-one true)
;(def-binary-operator :< :< verify-one true)
;(def-binary-operator :<= :<= verify-one true)

;; Bitwise Operators

;(def-binary-operator :bit-and :& verify-two verify-two)
;(def-binary-operator :bit-or :| verify-two verify-two)
;(def-binary-operator :bit-xor (keyword "^") verify-two verify-two)
;(def-binary-operator :bit-not (keyword "~") verify-two verify-two)
;(def-binary-operator :bit-shift-left :<< verify-two verify-two)
;(def-binary-operator :bit-shift-right :>> verify-two verify-two)
;(def-binary-operator :bit-shift-right-zero-fil :>>> verify-two verify-two)


;; Logical operators

(defn make-logical-expression
  [operator left right]
  {:type :LogicalExpression
   :operator operator
   :left left
   :right right})

(defmacro def-logical-expression
  [id operator default-operand make-operand]
  `(set-operator! (name ~id)
                  (fn make-expression
                    ([] (write ~default-operand))
                    ([operand] (write (~make-operand operand)))
                    ([left right] (make-logical-expression ~operator
                                                          (write left)
                                                          (write right)))
                    ([left & more] (make-logical-expression ~operator
                                                          (write left)
                                                          (apply make-expression right))))))

;(def-logical-expression :and :&& 'true identity)
;(def-logical-expression :and :|| 'nil identity)


(defn write-method-call
  [form]
  {:type :CallExpression
   :callee {:type :MemberExpression
            :computed false
            :object (write (first form))
            :property (write (second form))}
   :arguments (map write (vec (rest (rest params))))})

(defn write-instance?
  [form]
  {:type :BinaryExpression
   :operator :instanceof
   :left (write (second form))
   :right (write (first form))})

(defn write-not
  [form]
  {:type :UnaryExpression
   :operator :!
   :argument (write (second form))})





(defn write-location
  [form]
  (let [data (meta form)
        start (:start form)
        end (:end form)]
    (if (not (nil? start))
      {:start {:line (inc (:line start))
               :column (:column start)}
       :end {:line (inc (:line end))
             :column (inc (:column end))}})))

(def **writers** {})
(defn install-writer!
  [op writer]
  (set! (get **writers** op) writer))

(defn write-op
  [op form]
  (let [writer (get **writers** (name op))]
    (assert writer (str "Unsupported operation: " op))
    (writer form)))

(def **specials** {})
(defn install-special!
  [op writer]
  (set! (get **specials** (name op)) writer))


(defn write-nil
  [form]
  {:type :UnaryExpression
   :operator :void
   :argument {:type :Literal
              :value 0}
   :prefix true
   :loc (write-location form)})
(install-writer! :nil write-nil)

(defn write-literal
  [form]
  {:type :Literal
   :value (:form form)
   :loc (write-location form)})
(install-writer! :number write-literal)
(install-writer! :string write-literal)
(install-writer! :boolean write-literal)
(install-writer! :re-pattern write-literal)

(defn write-constant
  [form]
  (let [type (:type form)]
    (cond (= type :list)
          (write-invoke (conj form {:op :invoke
                                    :callee {:op :var
                                             :form 'list}
                                    :params []}))
          :else (write-op type form))))
(install-writer! :constant write-constant)

(defn write-keyword
  [form]
  {:type :Literal
   :value (name (:form form))
   :loc (write-location form)})
(install-writer! :keyword write-keyword)

(defn write-var
  [form]
  {:type :Identifier
   :name (translate-identifier (:form form))
   :loc (write-location form)})
(install-writer! :var write-var)

(defn write-invoke
  [form]
  {:type :CallExpression
   :callee (write (:callee form))
   :arguments (map write (:params form))
   :loc (write-location form)})
(install-writer! :invoke write-invoke)

(defn write-vector
  [form]
  {:type :ArrayExpression
   :elements (map write (:items form))
   :loc (write-location form)})
(install-writer! :vector write-vector)

(defn write-dictionary
  [form]
  (let [properties (partition 2 (interleave (:keys form)
                                            (:values form)))]
    {:type :ObjectExpression
     :properties (map (fn [pair]
                        {:kind :init
                         :type :Property
                         :key (write (first pair))
                         :value (write (second pair))})
                      properties)
     :loc (write-location form)}))
(install-writer! :dictionary write-dictionary)

(defn write-def
  [form]
  {:type :VariableDeclaration
   :kind :var
   :declarations [{:type :VariableDeclarator
                   :id (write-var (:var form))
                   :init (if (nil? (:init form))
                           (write-nil {})
                           (write (:init form)))}]
   :loc (write-location form)})
(install-writer! :def write-def)

(defn write-throw
  [form]
  (->expression {:type :ThrowStatement
                 :argument (write (:throw form))
                 :loc (write-location form)}))
(install-writer! :throw write-throw)

(defn write-new
  [form]
  {:type :NewExpression
   :callee (write (:constructor form))
   :arguments (map write (:params form))
   :loc (write-location form)})
(install-writer! :new write-new)

(defn write-set!
  [form]
  {:type :AssignmentExpression
   :operator :=
   :left (write (:target form))
   :right (write (:value form))
   :loc (write-location form)})
(install-writer! :set! write-set!)

(defn write-aget
  [form]
  {:type :MemberExpression
   :computed (:computed form)
   :object (write (:target form))
   :property (write (:property form))
   :loc (write-location form)})
(install-writer! :member-expression write-aget)

(defn write-statement
  [form]
  (let [op (:op form)]
    (if (or (= op :def)
            (= op :throw)
            (= op :try))
      (write form)
      {:type :ExpressionStatement
       :expression (write form)
       :loc (write-location form)})))

(defn write-body
  "Takes form that may contain `:statements` vector
  or `:result` form  and returns vector expression
  nodes that can be used in any block. If `:result`
  is present it will be a last in vector and of a
  `:ReturnStatement` type.
  Examples:


  (write-body {:statements nil
               :result {:op :constant
                        :type :number
                        :form 3}})
  ;; =>
  [{:type :ReturnStatement
    :argument {:type :Literal :value 3}}]

  (write-body {:statements [{:op :set!
                             :target {:op :var :form 'x}
                             :value {:op :var :form 'y}}]
               :result {:op :var :form 'x}})
  ;; =>
  [{:type :ExpressionStatement
    :expression {:type :AssignmentExpression
                 :operator :=
                 :left {:type :Identifier :name :x}
                 :right {:type :Identifier :name :y}}}
   {:type :ReturnStatement
    :argument {:type :Identifier :name :x}}]"
  [form]
  (let [statements (map write-statement
                        (or (:statements form) []))

        result (if (:result form)
                 {:type :ReturnStatement
                  :argument (write (:result form))})]

    (if result
      (conj statements result)
      statements)))

(defn ->block
  [body]
  {:type :BlockStatement
   :body (if (vector? body)
           body
           [body])})

(defn ->expression
  [body]
  {:type :CallExpression
   :arguments []
   :callee {:type :SequenceExpression
            :expressions [{:type :FunctionExpression
                           :id nil
                           :params []
                           :defaults []
                           :expression false
                           :generator false
                           :rest nil
                           :body (->block body)}]}})

(defn write-do
  [form]
  (->expression (write-body form)))
(install-writer! :do write-do)

(defn write-if
  [form]
  {:type :ConditionalExpression
   :test (write (:test form))
   :consequent (write (:consequent form))
   :alternate (write (:alternate form))
   :loc (write-location form)})
(install-writer! :if write-if)

(defn write-try
  [form]
  (->expression {:type :TryStatement
                 :guardedHandlers []
                 :block (->block (write-body (:body form)))
                 :handlers (if (:handler form)
                             [{:type :CatchClause
                               :param (write (:name (:handler form)))
                               :body (->block (write-body (:handler form)))}]
                             [])
                 :finalizer (if (:finalizer form)
                              (->block (write-body (:finalizer form))))
                 :loc (write-location form)}))
(install-writer! :try write-try)

(defn- write-binding-value
  [form]
  (write (:init form)))

(defn- write-binding-param
  [form]
  (write-var {:form (:name form)}))

(defn write-let
  [form]
  {:type :CallExpression
   :arguments (map write-binding-value (:bindings form))
   :callee {:type :SequenceExpression
            :expressions [{:type :FunctionExpression
                           :id nil
                           :params (map write-binding-param
                                        (:bindings form))
                           :defaults []
                           :expression false
                           :generator false
                           :rest nil
                           :body (->block (write-body form))}]}})
(install-writer! :let write-let)

(defn ->rebind
  [form]
  (loop [result []
         bindings (:bindings form)]
    (if (empty? bindings)
      result
      (recur (conj result
                   {:type :AssignmentExpression
                    :operator :=
                    :left (write-var {:form (:name (first bindings))})
                    :right {:type :MemberExpression
                            :computed true
                            :object {:type :Identifier
                                     :name :loop}
                            :property {:type :Literal
                                       :value (count result)}}})
             (rest bindings)))))

(defn write-loop
  [form]
  {:type :CallExpression
   :arguments (map write-binding-value (:bindings form))
   :callee {:type :SequenceExpression
            :expressions [{:type :FunctionExpression
                           :id {:type :Identifier
                                :name :loop}
                           :params (map write-binding-param
                                        (:bindings form))
                           :defaults []
                           :expression false
                           :generator false
                           :rest nil
                           :body (->block [{:type :VariableDeclaration
                                            :kind :var
                                            :declarations [{:type :VariableDeclarator
                                                            :id {:type :Identifier
                                                                 :name :recur}
                                                            :init {:type :Identifier
                                                                   :name :loop}}]}
                                           {:type :DoWhileStatement
                                            :body (->block (conj (write-body (conj form {:result nil}))
                                                                 {:type :ExpressionStatement
                                                                  :expression {:type :AssignmentExpression
                                                                               :operator :=
                                                                               :left {:type :Identifier
                                                                                      :name :recur}
                                                                               :right (write (:result form))}}))
                                            :test {:type :SequenceExpression
                                                   :expressions (conj (->rebind form)
                                                                      {:type :BinaryExpression
                                                                       :operator :===
                                                                       :left {:type :Identifier
                                                                              :name :recur}
                                                                       :right {:type :Identifier
                                                                               :name :loop}})}}
                                           {:type :ReturnStatement
                                            :argument {:type :Identifier
                                                       :name :recur}}])}]}})
(install-writer! :loop write-loop)

(defn ->recur
  [form]
  (loop [result []
         params (:params form)]
    (if (empty? params)
      result
      (recur (conj result
                   {:type :AssignmentExpression
                    :operator :=
                    :right (write (first params))
                    :left {:type :MemberExpression
                           :computed true
                           :object {:type :Identifier
                                    :name :loop}
                           :property {:type :Literal
                                      :value (count result)}}})
             (rest params)))))

(defn write-recur
  [form]
  {:type :SequenceExpression
   :expressions (conj (->recur form)
                      {:type :Identifier
                       :name :loop})})
(install-writer! :recur write-recur)

(defn fallback-overload
  []
  {:type :SwitchCase
   :test nil
   :consequent [{:type :ThrowStatement
                 :argument {:type :CallExpression
                            :callee {:type :Identifier
                                     :name :Error}
                            :arguments [{:type :Literal
                                         :value "Invalid arity"}]}}]})

(defn splice-binding
  [form]
  {:op :def
   :var {:op :var
         :form (:name (last (:params form)))}
   :init {:op :invoke
          :callee {:op :var
                   :form 'Array.prototype.slice.call}
          :params [{:op :var
                    :form 'arguments}
                   {:op :constant
                    :form (:arity form)
                    :type :number}]}})

(defn write-overloading-params
  [params]
  (reduce (fn [forms param]
            (conj forms {:op :def
                         :var {:op :var
                               :form (:name param)}
                         :init {:op :member-expression
                                :computed true
                                :target {:op :var
                                         :form 'arguments}
                                :property {:op :constant
                                           :type :number
                                           :form (count forms)}}}))
          []
          params))

(defn write-overloading-fn
  [form]
  (let [overloads (map write-fn-overload (:methods form))]
    {:params []
     :body (->block {:type :SwitchStatement
                     :discriminant {:type :MemberExpression
                                    :computed false
                                    :object {:type :Identifier
                                             :name :arguments}
                                    :property {:type :Identifier
                                               :name :length}}
                     :cases (if (:variadic form)
                              overloads
                              (conj overloads (fallback-overload)))})}))

(defn write-fn-overload
  [form]
  (let [params (:params form)
        bindings (if (:variadic form)
                   (conj (write-overloading-params (butlast params))
                         (splice-binding form))
                   (write-overloading-params params))
        statements (vec (concat bindings (:statements form)))]
    {:type :SwitchCase
     :test (if (not (:variadic form))
             {:type :Literal
              :value (:arity form)})
     :consequent (write-body (conj form {:statements statements}))}))

(defn write-simple-fn
  [form]
  (let [method (first (:methods form))
        params (if (:variadic method)
                 (butlast (:params method))
                 (:params method))
        body (if (:variadic method)
               (conj method
                     {:statements (vec (cons (splice-binding method)
                                             (:statements method)))})
               method)]
    {:params (map #(write-var {:form (:name %)}) params)
     :body (->block (write-body body))}))

(defn resolve
  [from to]
  (let [requirer (split (str from) \.)
        requirement (split (str to) \.)
        relative? (and (not (identical? (str from)
                                        (str to)))
                       (identical? (first requirer)
                                   (first requirement)))]
    (if relative?
      (loop [from requirer
             to requirement]
        (if (identical? (first from)
                        (first to))
          (recur (rest from) (rest to))
          (join \/
                (concat [\.]
                        (repeat (dec (count from)) "..")
                        to))))
      (join \/ requirement))))

(defn id->ns
  "Takes namespace identifier symbol and translates to new
  simbol without . special characters
  wisp.core -> wisp*core"
  [id]
  (symbol nil (join \* (split (str id) \.))))


(defn write-require
  [form requirer]
  (let [ns-binding {:op :def
                    :var {:op :var
                          :form (id->ns (:ns form))}
                    :init {:op :invoke
                           :callee {:op :var
                                    :form 'require}
                           :params [{:op :constant
                                     :type :string
                                     :form (resolve requirer (:ns form))}]}}
        ns-alias (if (:alias form)
                   {:op :def
                    :var {:op :var
                          :form (:alias form)}
                    :init (:var ns-binding)})

        references (reduce (fn [references form]
                             (conj references
                                   {:op :def
                                    :var {:op :var
                                          :form (or (:rename form)
                                                    (:name form))}
                                    :init {:op :member-expression
                                           :computed false
                                           :target (:var ns-binding)
                                           :property {:op :var
                                                      :form (:name form)}}}))
                           []
                           (:refer form))]
    (vec (cons ns-binding
               (if ns-alias
                 (cons ns-alias references)
                 references)))))

(defn write-ns
  [form]
  (let [requirer (:name form)
        ns-binding {:op :def
                    :var {:op :var
                          :form '*ns*}
                    :init {:op :dictionary
                           :hash? true
                           :keys [{:op :var
                                   :form 'id}
                                  {:op :var
                                   :form 'doc}]
                           :values [{:op :constant
                                     :type :string
                                     :form (name (:name form))}
                                    {:op :constant
                                     :type (if (:doc form)
                                             :string
                                             :nil)
                                       :form (:doc form)}]}}
        requirements (vec (apply concat (map #(write-require % requirer)
                                             (:require form))))]
    (->block (map write (vec (cons ns-binding requirements))))))
(install-writer! :ns write-ns)

(defn write-fn
  [form]
  (let [base (if (> (count (:methods form)) 1)
               (write-overloading-fn form)
               (write-simple-fn form))]
    (conj base
          {:type :FunctionExpression
           :id (if (:name form)
                 (write-var {:form (:name form)}))
           :defaults nil
           :rest nil
           :generator false
           :expression false
           :loc (write-location form)})))
(install-writer! :fn write-fn)

(defn write
  [form]
  (let [op (:op form)
        writer (and (= :invoke (:op form))
                    (= :var (:op (:callee form)))
                    (get **specials** (name (:form (:callee form)))))]
    (if writer
      (writer form)
      (write-op (:op form) form))))


(defn compile
  [form options]
  (generate (write form) options))

(defn get-macro
  [target property]
  `(aget (or ~target 0)
         ~property))
(install-macro! :get get-macro)
