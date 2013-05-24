(ns wisp.engine.node
  (:use [fs :only [read-file-sync]]
        [wisp.sequence :only [rest]]
        [wisp.runtime :only [str]]
        [wisp.reader :only [read*]]
        [wisp.compiler :only [compile*]]))

(set! global.**verbose** (<= 0 (.indexOf process.argv :--verbose)))

;; Register `.wisp` file extension so that
;; modules can be simply required.
(set! (get require.extensions ".wisp")
  (fn [module uri]
    (._compile module
               (compile* (read* (read-file-sync uri :utf8) uri)))))

