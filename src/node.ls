;; Defining helper macros to simplify module import / exports.
(defmacro destructure*
  "Helper macro for destructuring object"
  ([source name] `(def ~name (js* "~{}.~{}" ~source ~name)))
  ([source name & names]
   `(statements*
     (destructure* ~source ~name)
     (destructure* ~source ~@names))))

(defmacro import
  "Helper macro for importing node modules"
  ([path]
   `(require ~path))
  ([names path]
   `(destructure* (import ~path) ~@names)))

(defmacro export*
  ([source name]
   `(set! (js* "~{}.~{}" ~source ~name) ~name))
  ([source name & names]
   `(statements*
     (export* ~source ~name)
     (export* ~source ~@names))))

(defmacro export
  ([name]
   `(set! module.exports ~name))
  ([& names]
   `(export* 'exports ~@names)))

(import "amd-loader")
;; Load macros to be included into a compiler.
(import "../src/macros")

(import (read-file-sync) "fs")
(import (_compile) "../lib/ls")


(set! global.define
  (fn []
    (def factory (.call Array.prototype.slice arguments -1))
    (factory require exports module)))


;; Register `.ls` file extension so that `ls`
;; modules can be simply required.
(set! (get require.extensions ".ls")
  (fn [module filename]
    (def code (read-file-sync filename :utf8))
    (._compile module (_compile ls code filename) filename)))
