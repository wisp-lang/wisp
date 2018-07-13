(ns wisp.engine.node
  (:require [fs :refer [read-file-sync]]
            [wisp.compiler :refer [compile]]))

(set! global.**verbose** (<= 0 (.indexOf process.argv :--verbose)))

(defn compile-path
  [path]
  (let [source (read-file-sync path :utf8)
        output (compile source {:source-uri path})]
    (if (:error output)
      (throw (:error output))
      (:code output))))

;; Register `.wisp` file extension so that
;; modules can be simply required.
(set! (get require.extensions ".wisp")
      (fn [src path]
        (._compile src (compile-path path) path)))
