(ns wisp.engine.node
  (:require [fs :refer [read-file-sync]]
            [wisp.sequence :refer [rest]]
            [wisp.runtime :refer [str]]
            [wisp.reader :refer [read*]]
            [wisp.compiler :refer [compile*]]))

(set! global.**verbose** (<= 0 (.indexOf process.argv :--verbose)))

;; Register `.wisp` file extension so that
;; modules can be simply required.
(set! (get require.extensions ".wisp")
  (fn [module uri]
    (._compile module
               (compile* (read* (read-file-sync uri :utf8) uri)))))

