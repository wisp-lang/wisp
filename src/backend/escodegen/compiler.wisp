(ns wisp.backend.escodegen.compiler
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
            [escodegen :refer [generate]]

            [fs :refer [read-file-sync]]))

(set! global.*env*
      (reduce (fn [env param]
                (let [name (first param)
                      value (second param)]
                  (if (identical? "--" (subs name 0 2))
                    (set! (get env (subs name 2))
                          value))
                  env))
              {}
              (partition 2 1 process.argv)))

(defn transpile
  [code options]
  (let [forms (read* code (:uri options))
        analyzed (map analyze forms)
        compiled (apply compile options analyzed)]
    compiled))


(if (:compile *env*)
  (print (transpile (str (read-file-sync (:compile *env*)))
                    {:uri (:compile *env*)})))


(defn expand-defmacro
  "Like defn, but the resulting function name is declared as a
  macro and will be used as a macro by the compiler when it is
  called."
  [id & body]
  (let [form `(fn ~id ~@body)
        ast (analyze form)
        code (compile ast)
        macro (eval code)]
    (install-macro! id macro)
    nil))
(install-macro! 'defmacro expand-defmacro)
