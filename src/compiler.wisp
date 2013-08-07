(ns wisp.compiler
  (:require [wisp.analyzer :refer [analyze]]
            [wisp.reader :refer [read* read push-back-reader]]
            [wisp.string :refer [replace]]
            [wisp.sequence :refer [map conj cons vec first rest empty? count]]
            [wisp.runtime :refer [error?]]

            [wisp.backend.escodegen.generator :refer [generate]
                                              :rename {generate generate-js}]
            [base64-encode :as btoa]))

(def generate generate-js)

(defn read-form
  [reader eof]
  (try (read reader false eof false)
    (catch error error)))

(defn read-forms
  [source uri]
  (let [reader (push-back-reader source uri)
        eof {}]
    (loop [forms []
           form (read-form reader eof)]
      (cond (error? form) {:forms forms :error form}
            (identical? form eof) {:forms forms}
            :else (recur (conj forms form)
                         (read-form reader eof))))))

(defn analyze-form
  [form]
  (try (analyze form) (catch error error)))

(defn analyze-forms
  [forms]
  (loop [nodes []
         forms forms]
    (let [node (analyze-form (first forms))]
      (cond (error? node) {:ast nodes :error node}
            (<= (count forms) 1) {:ast (conj nodes node)}
            :else (recur (conj nodes node) (rest forms))))))

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

         forms (read-forms source source-uri)

         ast (if (:error forms)
               forms
               (analyze-forms (:forms forms)))

         output (if (:error ast)
                  ast
                  (try              ;; TODO: Remove this
                                    ;; Old compiler has incorrect apply.
                    (apply generate (vec (cons (conj options
                                                     {:source-uri source-uri
                                                      :output-uri output-uri})
                                               (:ast ast))))
                    (catch error {:error error})))

         result {:source-uri source-uri
                 :output-uri output-uri
                 :source-map-uri (:source-map-uri options)
                 :ast (if (:include-ast options) (:ast ast))
                 :forms (if (:include-forms options) (:forms forms))}]
     (conj output result))))

(defn evaluate
  [source]
  (let [output (compile source)]
    (if (:error output)
      (throw (:error output))
      (eval (:code output)))))
