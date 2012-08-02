;; This require should be first to make `define`
(require "amd-loader")

(def fs (require "fs"))

;; lispy should be loaded before any macros so that
;; it will define require extension for lispyscript.
(def ls (require "../lib/ls"))

;; Register `.ls` file extension so that `ls`
;; modules can be simply required.
(set! (get require.extensions ".ls")
  (fn [module filename]
    (def code (.read-file-sync fs filename :utf8))
    (._compile module (._compile ls code filename) filename)))

;; Load macros only after everything else has beig set up.
(require "../src/macros")
(require "../src/node-macros")

