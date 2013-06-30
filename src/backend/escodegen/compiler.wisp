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

            [fs :refer [read-file-sync write-file-sync]]
            [path :refer [basename dirname join]
                  :rename {join join-path}]))

;; Just munge all the `--param value` pairs into global *env* hash.
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
        ast (apply write* analyzed)
        generated (generate ast options)]
    generated))

(defn compile-with-source-map
  "Takes relative uri (path) to the .wisp file and writes
  generated `*.js` file and a `*.wisp.map` source map file
  next to it."
  [uri]
  (let [directory (dirname uri)
        file (basename uri)
        source-map-uri (str file ".map")
        code-uri (replace file #".wisp$" ".js")
        source (read-file-sync uri {:encoding :utf-8})
        source-map-prefix (str "\n\n//# sourceMappingURL=" source-map-uri "\n")
        output (transpile source {:file code-uri
                                  :sourceMap file
                                  :sourceMapWithCode true})

        code (str (:code output) source-map-prefix)
        source-map (:map output)]
    (write-file-sync (join-path directory source-map-uri) source-map)
    (write-file-sync (join-path directory code-uri) code)))


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


(if (:compile *env*)
  (compile-with-source-map (:compile *env*)))
