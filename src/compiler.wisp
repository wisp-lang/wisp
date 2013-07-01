(ns wisp.compiler
  (:require [wisp.analyzer :refer [analyze]]
            [wisp.reader :refer [read*]]
            [wisp.string :refer [replace]]
            [wisp.sequence :refer [map conj cons vec]]

            [wisp.backend.escodegen.generator :refer [generate]]
            [Base64 :refer [atob btoa]]))

(defn compile
  "Compiler takes wisp code in form of string and returns a hash
  containing `:source` representing compilation result. If
  `(:source-map options)` is `true` then `:source-map` of the returned
  hash will contain source map for it.
  :output-uri
  :source-map-uri

  Returns hash with following fields:

  :code - Generated code.

  :source-map - Generated source map. Only if (:source-map options)
                was true.

  :output-uri - Returns back (:output-uri options) if was passed in,
                otherwise computes one from (:source-uri options) by
                changing file extension.

  :source-map-uri - Returns back (:source-map-uri options) if was passed
                    in, otherwise computes one from (:source-uri options)
                    by adding `.map` file extension."
  ([source] (compile source {}))
  ([source options]
   (let [uri (:source-uri options)
         source-uri (or uri
                        (str "data:application/wisp;charset=utf-8;base64,"
                             (btoa source)))
         output-uri (or (:output-uri options)
                        (if uri (replace uri #".wisp$" ".js")))

         forms (read* source source-uri)
         ast (map analyze forms)

         output (apply generate
                       ;; TODO: Remove this
                       ;; Old compiler has incorrect apply.
                       (vec (cons

                             (conj options
                                   {:source-uri source-uri
                                    :output-uri output-uri})
                             ast)
                            ))]
     (conj output {:source-uri source-uri
                   :output-uri output-uri
                   :source-map-uri (:source-map-uri options)
                   :ast (if (:include-ast options) ast)
                   :forms (if (:include-forms options) forms)}))))

(defn evaluate
  [source]
  (eval (compile source)))



