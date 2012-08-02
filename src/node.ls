(require "amd-loader")
(def fs (require "fs"))
(def ls (require "../lib/ls"))

(set! global.define
  (fn []
    (def factory (.call Array.prototype.slice arguments -1))
    (factory require exports module)))


;; Register `.ls` file extension so that `ls`
;; modules can be simply required.
(set! (get require.extensions ".ls")
  (fn [module filename]
    (def code (.read-file-sync fs filename :utf8))
    (._compile module (._compile ls code filename) filename)))

;; Load macros to be included into a compiler.
(require "../src/macros")

