(ns wisp.backend.escodegen.generator
  (:require [wisp.reader :refer [read-from-string read*]
                         :rename {read-from-string read-string}]
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
            [wisp.analyzer :refer [empty-env analyze analyze*]]
            [wisp.backend.escodegen.writer :refer [write compile write*]]

            [escodegen :refer [generate] :rename {generate generate*}]
            [base64-encode :as btoa]
            [fs :refer [read-file-sync write-file-sync]]
            [path :refer [basename dirname join]
                  :rename {join join-path}]))

(defn generate
  [options & nodes]
  (let [ast (apply write* nodes)

        output (generate* ast {:file (:output-uri options)
                               :sourceContent (:source options)
                               :sourceMap (:source-uri options)
                               :sourceMapRoot (:source-root options)
                               :sourceMapWithCode true})]

    ;; Workaround the fact that escodegen does not yet includes source
    (.setSourceContent (:map output)
                       (:source-uri options)
                       (:source options))

    {:code (if (:no-map options)
             (:code output)
             (str (:code output)
                  "\n//# sourceMappingURL="
                  "data:application/json;base64,"
                  (btoa (str (:map output)))
                  "\n"))
     :source-map (:map output)
     :js-ast ast}))


(defn expand-defmacro
  "Like defn, but the resulting function name is declared as a
  macro and will be used as a macro by the compiler when it is
  called."
  [&form id & body]
  (let [fn (with-meta `(defn ~id ~@body) (meta &form))
        form `(do ~fn ~id)
        ast (analyze form)
        code (compile ast)
        macro (eval code)]
    (install-macro! id macro)
    nil))
(install-macro! 'defmacro (with-meta expand-defmacro {:implicit [:&form]}))
